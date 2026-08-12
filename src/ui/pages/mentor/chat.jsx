import {useEffect, useMemo, useRef, useState} from 'react';
import {Button, TextInput} from '@gravity-ui/uikit';
import {Paperclip, Send} from 'lucide-react';
import dayjs from 'dayjs';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useChatMessages, useChatRooms, useSendChatFile, useSendChatMessage} from '@/services/chat/query.js';
import {joinChatRoom, leaveChatRoom, subscribeChatSocket} from '@/services/chat/socket.js';
import {useMe} from '@/services/user/query.js';
import {cdnUrl, fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';
import {EmptyState, LoadingState} from '@/ui/components/stateViews.jsx';

function MessageBubble({message, own}) {
    const file = message.filePath ? cdnUrl(message.filePath) : null;

    return (
        <div style={{display: 'flex', justifyContent: own ? 'flex-end' : 'flex-start'}}>
            <div
                style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: own ? 'var(--g-color-base-brand)' : 'var(--g-color-base-generic)',
                    color: own ? 'var(--g-color-text-light-primary)' : 'var(--g-color-text-primary)',
                }}
            >
                {message.type === 'file' && file ? (
                    <a
                        href={file}
                        target="_blank"
                        rel="noreferrer"
                        style={{color: 'inherit', textDecoration: 'underline', fontSize: 14}}
                    >
                        {message.fileName ?? 'file'}
                    </a>
                ) : (
                    <div style={{fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                        {message.text}
                    </div>
                )}
                <div style={{fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right'}}>
                    {dayjs(message.createdAt).format('HH:mm')}
                </div>
            </div>
        </div>
    );
}

function MentorChat() {
    const {t} = useI18n();
    const {data: me} = useMe();
    const rooms = useChatRooms({page: 1, limit: 50});
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const sendMessage = useSendChatMessage();
    const sendFile = useSendChatFile();
    const [text, setText] = useState('');
    // Socket arrivals bucketed by room, so switching rooms needs no reset -
    // the REST history covers everything from before the room was opened.
    const [liveByRoom, setLiveByRoom] = useState({});
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    const roomList = useMemo(() => rooms.data?.data ?? [], [rooms.data]);

    // Falls back to the first room so the pane isn't empty on arrival - derived
    // rather than assigned in an effect.
    const roomId = selectedRoomId ?? roomList[0]?.id ?? null;
    const history = useChatMessages({roomId, page: 1, limit: 50});

    useEffect(() => {
        if (!roomId) return undefined;

        joinChatRoom(roomId);

        const unsubscribe = subscribeChatSocket(({event, payload}) => {
            if (event === 'message') {
                // The gateway broadcasts to the whole room including the
                // sender, so a message sent over REST also lands here.
                setLiveByRoom((current) => ({
                    ...current,
                    [roomId]: [...(current[roomId] ?? []), payload],
                }));
            }
        });

        return () => {
            leaveChatRoom(roomId);
            unsubscribe();
        };
    }, [roomId]);

    // History is newest-first from the API; the pane reads oldest-first, and
    // socket arrivals are deduped against it by id.
    const messages = useMemo(() => {
        const historical = [...(history.data?.data ?? [])].reverse();
        const seen = new Set(historical.map((message) => message.id));
        const live = liveByRoom[roomId] ?? [];
        return [...historical, ...live.filter((message) => !seen.has(message.id))];
    }, [history.data, liveByRoom, roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages.length]);

    const submit = (event) => {
        event.preventDefault();
        const value = text.trim();
        if (!value || !roomId) return;

        setText('');
        sendMessage.mutate(
            {roomId, text: value},
            {
                onError: (error) => {
                    setText(value);
                    toaster.add({
                        name: 'chat-send-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    });
                },
            }
        );
    };

    const handleFile = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !roomId) return;

        sendFile.mutate(
            {roomId, file},
            {
                onError: (error) =>
                    toaster.add({
                        name: 'chat-file-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    const activeRoom = roomList.find((room) => room.id === roomId);

    return (
        <>
            <PageHeader title={t('chat.title')}/>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(220px, 300px) 1fr',
                    gap: 16,
                    height: 'calc(100vh - 180px)',
                    minHeight: 420,
                }}
            >
                <div
                    style={{
                        border: '1px solid var(--g-color-line-generic)',
                        borderRadius: 8,
                        overflowY: 'auto',
                        background: 'var(--g-color-base-background)',
                    }}
                >
                    {rooms.isPending && <LoadingState rows={5}/>}
                    {!rooms.isPending && roomList.length === 0 && <EmptyState/>}
                    {roomList.map((room) => {
                        const student = room.student;
                        const active = room.id === roomId;
                        return (
                            <button
                                key={room.id}
                                type="button"
                                onClick={() => setSelectedRoomId(room.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    width: '100%',
                                    padding: 12,
                                    border: 'none',
                                    borderBottom: '1px solid var(--g-color-line-generic)',
                                    background: active ? 'var(--g-color-base-selection)' : 'transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: 'inherit',
                                    font: 'inherit',
                                }}
                            >
                                <UserAvatar avatar={student?.avatar} name={fullName(student)} size="s"/>
                                <span
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: 14,
                                    }}
                                >
                                    {fullName(student) || '—'}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid var(--g-color-line-generic)',
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}
                >
                    {!roomId ? (
                        <EmptyState title={t('chat.empty')}/>
                    ) : (
                        <>
                            <div
                                style={{
                                    padding: 12,
                                    borderBottom: '1px solid var(--g-color-line-generic)',
                                    fontWeight: 600,
                                }}
                            >
                                {fullName(activeRoom?.student) || t('chat.title')}
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: 16,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                }}
                            >
                                {history.isPending && <LoadingState rows={4}/>}
                                {!history.isPending && messages.length === 0 && (
                                    <EmptyState title={t('chat.noMessages')}/>
                                )}
                                {messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        own={message.sender?.id === me?.id}
                                    />
                                ))}
                                <div ref={bottomRef}/>
                            </div>

                            <form
                                onSubmit={submit}
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    padding: 12,
                                    borderTop: '1px solid var(--g-color-line-generic)',
                                }}
                            >
                                <Button
                                    view="flat"
                                    onClick={() => fileInputRef.current?.click()}
                                    loading={sendFile.isPending}
                                    aria-label={t('chat.attach')}
                                >
                                    <Button.Icon>
                                        <Paperclip size={16}/>
                                    </Button.Icon>
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    style={{display: 'none'}}
                                    onChange={handleFile}
                                />
                                <TextInput
                                    value={text}
                                    onUpdate={setText}
                                    placeholder={t('chat.placeholder')}
                                    size="l"
                                />
                                <Button
                                    type="submit"
                                    view="action"
                                    size="l"
                                    loading={sendMessage.isPending}
                                    aria-label={t('chat.send')}
                                >
                                    <Button.Icon>
                                        <Send size={16}/>
                                    </Button.Icon>
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default MentorChat;
