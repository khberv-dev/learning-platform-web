import {useEffect, useMemo, useRef, useState, useCallback} from 'react'
import {useSearchParams} from 'react-router'
import {useQueryClient} from '@tanstack/react-query'
import {useAuth} from '@/providers/auth.jsx'
import {
    useGetChatRooms, useGetChatMessages,
    useSendChatFile,
} from '@/services/chat/query.js'
import {CHAT_FILE_MAX_BYTES} from '@/services/chat/api.js'
import {subscribeChatSocket, joinChatRoom, sendChatMessage, emitTyping, emitStopTyping} from '@/services/chat/socket.js'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {EmptyState} from '@/ui/components/empty-state/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {cdnUrl} from '@/services/config.js'
import {toaster} from '@/services/toaster.js'
import {fullName, timeAgo} from '@/utils/lib.js'

export function TeacherChatPage() {
    const {user} = useAuth() ?? {}
    const [searchParams, setSearchParams] = useSearchParams()

    const {data: roomsPage, isLoading: roomsLoading} = useGetChatRooms({page: 1, limit: 50})
    const rooms = roomsPage?.data ?? []

    const [activeRoomId, setActiveRoomId] = useState(null)
    const [search, setSearch] = useState('')

    // When arriving with ?userId=, find the existing room for that user
    useEffect(() => {
        const targetUserId = searchParams.get('userId')
        if (!targetUserId || roomsLoading) return

        setSearchParams({}, {replace: true})
        const existing = rooms.find(r => (r.members ?? []).some(m => m.user?.id === targetUserId))
        if (existing) {
            queueMicrotask(() => setActiveRoomId(existing.id))
        } else {
            toaster.add({name: `chat-no-room-${targetUserId}`, content: 'No active chat room with this student yet.', theme: 'warning', timeout: 4000})
        }
    }, [searchParams, rooms, roomsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!activeRoomId && rooms.length > 0) setActiveRoomId(rooms[0].id)
    }, [rooms, activeRoomId])

    const filteredRooms = useMemo(() => {
        if (!search) return rooms
        const s = search.toLowerCase()
        return rooms.filter(r => roomTitle(r, user).toLowerCase().includes(s))
    }, [rooms, search, user])

    useEffect(() => {
        const unsubscribe = subscribeChatSocket((event, payload) => {
            if (event === 'error') {
                toaster.add({name: `chat-err-${Date.now()}`, content: payload?.message ?? 'Chat error', theme: 'danger', timeout: 4000})
            }
        })
        return unsubscribe
    }, [])

    useEffect(() => {
        if (activeRoomId) joinChatRoom(activeRoomId)
    }, [activeRoomId])

    return (
        <div style={{display: 'flex', flex: 1, minHeight: 0}}>
            <aside style={{width: 320, background: 'var(--it-surface)', borderRight: '1px solid var(--it-border)', display: 'flex', flexDirection: 'column', minHeight: 0}}>
                <div style={{height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--it-border)'}}>
                    <h2 style={{fontSize: 18, fontWeight: 700}}>Messages</h2>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', height: 48, borderBottom: '1px solid var(--it-border)'}}>
                    <Icon name="search" size={16} color="var(--it-text-tertiary)"/>
                    <input
                        className="it-bare-input"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{flex: 1, overflowY: 'auto'}}>
                    {roomsLoading ? (
                        <div style={{padding: 24, color: 'var(--it-text-tertiary)', fontSize: 13}}>Loading…</div>
                    ) : filteredRooms.length === 0 ? (
                        <div style={{padding: 24, color: 'var(--it-text-tertiary)', fontSize: 13}}>
                            {search ? 'No matches.' : 'No conversations yet. Start one with the pencil icon.'}
                        </div>
                    ) : filteredRooms.map((r) => {
                        const title = roomTitle(r, user)
                        return (
                            <button
                                key={r.id}
                                onClick={() => setActiveRoomId(r.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                                    height: 72, padding: '0 16px', textAlign: 'left',
                                    background: activeRoomId === r.id ? 'var(--it-success-bg)' : 'transparent',
                                    borderBottom: '1px solid var(--it-border-row)',
                                    cursor: 'pointer',
                                }}
                            >
                                <Avatar name={title} size={40}/>
                                <div style={{flex: 1, minWidth: 0}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <span style={{fontWeight: 600, fontSize: 14, color: 'var(--it-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                            {title}
                                        </span>
                                        <span style={{fontSize: 11, color: 'var(--it-text-tertiary)', flexShrink: 0, marginLeft: 8}}>
                                            {timeAgo(r.updatedAt)}
                                        </span>
                                    </div>
                                    <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                        Direct message
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </aside>

            <section style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--it-surface-hover)'}}>
                {!activeRoomId ? (
                    <EmptyState
                        icon="message-circle"
                        title="Select a conversation"
                        hint="Choose a conversation from the list, or start a new one."
                    />
                ) : (
                    <RoomView roomId={activeRoomId} room={rooms.find(r => r.id === activeRoomId)} me={user}/>
                )}
            </section>

        </div>
    )
}

function RoomView({roomId, room, me}) {
    const queryClient = useQueryClient()
    const {data: messagesPage, isLoading} = useGetChatMessages(roomId, {page: 1, limit: 50})
    const sendFile = useSendChatFile()

    const [draft, setDraft] = useState('')
    const [typingUsers, setTypingUsers] = useState({}) // {userId: firstName}
    const fileInputRef = useRef(null)
    const scrollerRef = useRef(null)
    const typingTimersRef = useRef({})
    const stopTypingTimerRef = useRef(null)

    // API returns newest-first; reverse to render oldest→newest top→bottom
    const messages = useMemo(
        () => [...(messagesPage?.data ?? [])].reverse(),
        [messagesPage],
    )

    useEffect(() => {
        const el = scrollerRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [messages.length])

    // Subscribe to message and typing presence events for this room
    useEffect(() => {
        const unsub = subscribeChatSocket((event, payload) => {
            if (event === 'message') {
                const msg = payload
                // Prepend into the messages cache (API returns newest-first)
                queryClient.setQueriesData(
                    {queryKey: ['chat', 'messages', roomId], exact: false},
                    (old) => {
                        if (!old) return old
                        if (old.data.some(m => m.id === msg.id)) return old
                        return {...old, data: [msg, ...old.data], total: (old.total ?? 0) + 1}
                    },
                )
                // Bump updatedAt on this room in every cached rooms page
                queryClient.setQueriesData(
                    {queryKey: ['chat', 'rooms'], exact: false},
                    (old) => {
                        if (!old?.data) return old
                        const updated = old.data.map(r =>
                            r.id === roomId ? {...r, updatedAt: new Date().toISOString()} : r
                        )
                        updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                        return {...old, data: updated}
                    },
                )
                return
            }
            if (payload?.roomId !== roomId) return
            if (event === 'typing') {
                const uid = payload.userId
                const name = (room?.members ?? []).find(m => m.user?.id === uid)?.user?.firstName ?? 'Someone'
                clearTimeout(typingTimersRef.current[uid])
                setTypingUsers(prev => ({...prev, [uid]: name}))
                // Auto-clear after 3 s in case stop-typing is never received
                typingTimersRef.current[uid] = setTimeout(() => {
                    setTypingUsers(prev => { const n = {...prev}; delete n[uid]; return n })
                }, 3000)
            } else if (event === 'stop-typing') {
                const uid = payload.userId
                clearTimeout(typingTimersRef.current[uid])
                setTypingUsers(prev => { const n = {...prev}; delete n[uid]; return n })
            }
        })
        return () => {
            unsub()
            Object.values(typingTimersRef.current).forEach(clearTimeout)
            typingTimersRef.current = {}
        }
    }, [roomId, room, queryClient])

    const onSend = useCallback(() => {
        const text = draft.trim()
        if (!text) return
        clearTimeout(stopTypingTimerRef.current)
        emitStopTyping(roomId)
        setDraft('')
        sendChatMessage(roomId, text)
    }, [draft, roomId])

    const onDraftChange = useCallback((e) => {
        setDraft(e.target.value)
        if (e.target.value) {
            emitTyping(roomId)
            clearTimeout(stopTypingTimerRef.current)
            stopTypingTimerRef.current = setTimeout(() => emitStopTyping(roomId), 2000)
        } else {
            clearTimeout(stopTypingTimerRef.current)
            emitStopTyping(roomId)
        }
    }, [roomId])

    const onPickFile = useCallback(async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''
        if (file.size > CHAT_FILE_MAX_BYTES) {
            toaster.add({
                name: `chat-file-too-big-${Date.now()}`,
                content: `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max 50 MB.`,
                theme: 'danger',
                timeout: 4000,
            })
            return
        }
        sendFile.mutate({roomId, file})
    }, [roomId, sendFile])

    const title = roomTitle(room, me)
    const subtitle = 'Direct message'
    const typingNames = Object.values(typingUsers)

    return (
        <>
            <header style={{height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--it-surface)', borderBottom: '1px solid var(--it-border)'}}>
                <Avatar name={title}/>
                <div style={{flex: 1}}>
                    <div style={{fontWeight: 700}}>{title}</div>
                    <div style={{fontSize: 12, color: 'var(--it-text-tertiary)'}}>{subtitle}</div>
                </div>
            </header>

            <div ref={scrollerRef} style={{flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 10}}>
                {isLoading ? (
                    <div style={{color: 'var(--it-text-tertiary)', textAlign: 'center', padding: 24}}>Loading messages…</div>
                ) : messages.length === 0 ? (
                    <div style={{color: 'var(--it-text-tertiary)', textAlign: 'center', padding: 24}}>No messages yet — say hello!</div>
                ) : messages.map((m, idx) => {
                    const mine = m.sender?.id === me?.id
                    const showHeader = idx === 0 || messages[idx - 1].sender?.id !== m.sender?.id
                    return (
                        <MessageBubble
                            key={m.id}
                            message={m}
                            mine={mine}
                            showSender={false}
                        />
                    )
                })}
            </div>

            {typingNames.length > 0 && (
                <div style={{padding: '3px 24px', fontSize: 12, color: 'var(--it-text-tertiary)', fontStyle: 'italic', background: 'var(--it-surface-hover)'}}>
                    {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing…
                </div>
            )}
            <div style={{padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--it-surface)', borderTop: '1px solid var(--it-border)'}}>
                <input ref={fileInputRef} type="file" hidden onChange={onPickFile}/>
                <button
                    className="it-btn it-btn--icon"
                    title="Attach file (max 50 MB)"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendFile.isPending}
                >
                    <Icon name={sendFile.isPending ? 'loader' : 'paperclip'} size={18}/>
                </button>
                <div style={{flex: 1}}>
                    <Input
                        size="md"
                        placeholder="Type a message..."
                        value={draft}
                        onChange={onDraftChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                onSend()
                            }
                        }}
                    />
                </div>
                <button
                    onClick={onSend}
                    disabled={!draft.trim()}
                    style={{
                        width: 40, height: 40, borderRadius: 999,
                        background: !draft.trim() ? 'var(--it-border)' : 'var(--it-green)',
                        color: !draft.trim() ? 'var(--it-text-tertiary)' : '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 0,
                        cursor: !draft.trim() ? 'not-allowed' : 'pointer',
                        transition: 'background 120ms ease, color 120ms ease',
                    }}
                    title="Send"
                >
                    <Icon name="send" size={18}/>
                </button>
            </div>
        </>
    )
}

function MessageBubble({message, mine, showSender}) {
    const isFile = message.type === 'file'
    return (
        <div style={{display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 10}}>
            {!mine && <Avatar name={fullName(message.sender) || 'User'} size={32}/>}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: 560, gap: 2}}>
                {showSender && (
                    <span style={{fontSize: 11, color: 'var(--it-text-tertiary)', paddingLeft: 4}}>
                        {fullName(message.sender)}
                    </span>
                )}
                <div style={{
                    padding: isFile ? 10 : '10px 14px',
                    borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: mine ? 'var(--it-green)' : 'var(--it-surface)',
                    color: mine ? '#FFFFFF' : 'var(--it-text-primary)',
                    border: mine ? 'none' : '1px solid var(--it-border)',
                    fontSize: 14,
                    wordBreak: 'break-word',
                }}>
                    {isFile ? <FileAttachment message={message} mine={mine}/> : (
                        <span style={{whiteSpace: 'pre-wrap'}}>{message.text}</span>
                    )}
                </div>
                <span style={{fontSize: 11, color: 'var(--it-text-tertiary)', paddingLeft: 4, paddingRight: 4}}>
                    {timeAgo(message.createdAt)}
                </span>
            </div>
        </div>
    )
}

function FileAttachment({message, mine}) {
    const fileUrl = cdnUrl(message.filePath)
    const mime = message.fileMimeType ?? ''
    const isImage = mime.startsWith('image/')
    const fg = mine ? '#FFFFFF' : 'var(--it-text-primary)'
    const sub = mine ? 'rgba(255,255,255,0.85)' : 'var(--it-text-tertiary)'

    if (isImage) {
        return (
            <a href={fileUrl} target="_blank" rel="noreferrer" style={{display: 'block'}}>
                <img
                    src={fileUrl}
                    alt={message.fileName ?? ''}
                    style={{maxWidth: 320, maxHeight: 320, borderRadius: 10, display: 'block'}}
                />
                {message.fileName && (
                    <span style={{fontSize: 11, color: sub, display: 'block', marginTop: 6}}>
                        {message.fileName}{formatBytes(message.fileSize, ' · ')}
                    </span>
                )}
            </a>
        )
    }

    return (
        <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{display: 'flex', alignItems: 'center', gap: 10, color: fg, textDecoration: 'none', minWidth: 220}}
        >
            <span style={{
                width: 40, height: 40, borderRadius: 8,
                background: mine ? 'rgba(255,255,255,0.18)' : 'var(--it-surface-alt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon name="file" size={20} color={fg}/>
            </span>
            <span style={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
                <span style={{fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {message.fileName ?? 'File'}
                </span>
                <span style={{fontSize: 11, color: sub}}>
                    {formatBytes(message.fileSize)}
                </span>
            </span>
        </a>
    )
}

function roomTitle(room, me) {
    if (!room) return 'Conversation'
    const other = (room.members ?? []).find(m => m.user?.id !== me?.id)
    return fullName(other?.user) || 'Direct message'
}

function formatBytes(bytes, prefix = '') {
    if (bytes == null) return ''
    const n = Number(bytes)
    if (!Number.isFinite(n)) return ''
    if (n < 1024) return `${prefix}${n} B`
    if (n < 1024 * 1024) return `${prefix}${(n / 1024).toFixed(1)} KB`
    return `${prefix}${(n / (1024 * 1024)).toFixed(1)} MB`
}

export default TeacherChatPage
