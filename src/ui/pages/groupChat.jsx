import {useEffect, useMemo, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Button, TextInput} from '@gravity-ui/uikit';
import {Paperclip, Send} from 'lucide-react';
import dayjs from 'dayjs';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useChatMessages, useChatRoom, useChatRooms, useSendChatFile, useSendChatMessage} from '@/services/chat/query.js';
import {joinChatRoom, leaveChatRoom, subscribeChatSocket} from '@/services/chat/socket.js';
import {useMe} from '@/services/user/query.js';
import {useAuth} from '@/shared/auth/authContext.jsx';
import {ROLE} from '@/shared/auth/roles.js';
import {fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

// A message is owned by exactly one of student/mentor/admin.
function messageSender(message) {
    return message.student ?? message.mentor ?? message.admin ?? null;
}

function MessageBubble({message, own}) {
    const file = message.filePath || null;
    const sender = messageSender(message);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: own ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: 8,
            }}
        >
            {/* An incoming message shows who sent it - own messages need no
                avatar, since that's always the viewer. */}
            {!own && <UserAvatar avatar={sender?.avatar} name={fullName(sender)} size="xs"/>}
            <div
                style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: own ? 'var(--g-color-base-brand)' : 'var(--g-color-base-generic)',
                    color: own ? 'var(--g-color-text-light-primary)' : 'var(--g-color-text-primary)',
                }}
            >
                {/* Several people talk in a group chat, so others' messages are
                    labelled with who sent them. */}
                {!own && sender && (
                    <div style={{fontSize: 12, fontWeight: 600, marginBottom: 2, opacity: 0.8}}>
                        {fullName(sender)}
                    </div>
                )}
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

// Reached only from a group's own page - there is no standalone chat menu
// item and no room switcher, since the room here is fixed to `groupId`. The
// rooms list carries no server-side group filter, so the room is found by
// matching `group.id` against the caller's accessible rooms; 100 is the API's
// hard cap on `limit`, comfortably covering every room an admin or a primary
// mentor can reach in one request.
function GroupChatPage() {
    const {t} = useI18n();
    const {id: groupId} = useParams();
    const {role} = useAuth();
    const {data: me} = useMe();
    const rooms = useChatRooms({page: 1, limit: 100});
    const sendMessage = useSendChatMessage();
    const sendFile = useSendChatFile();
    const [text, setText] = useState('');
    const [liveMessages, setLiveMessages] = useState([]);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    const roomList = useMemo(() => rooms.data?.data ?? [], [rooms.data]);
    const roomId = roomList.find((room) => room.group?.id === groupId)?.id ?? null;

    const activeRoom = useChatRoom(roomId).data;
    const history = useChatMessages({roomId, page: 1, limit: 50});

    useEffect(() => {
        if (!roomId) return undefined;

        // roomId resolves once, from null to this group's fixed room - unlike a
        // room switcher there is nothing to reset `liveMessages` for.
        joinChatRoom(roomId);

        const unsubscribe = subscribeChatSocket(({event, payload}) => {
            // The gateway only broadcasts to sockets that joined this room, so
            // every 'message' event received here belongs to it - including a
            // message this page itself sent over REST.
            if (event === 'message') setLiveMessages((current) => [...current, payload]);
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
        return [...historical, ...liveMessages.filter((message) => !seen.has(message.id))];
    }, [history.data, liveMessages]);

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

    const groupTitle = activeRoom?.group?.title ?? roomList.find((room) => room.group?.id === groupId)?.group?.title;

    const backTo = role === ROLE.ADMIN ? `/admin/groups/${groupId}` : '/mentor/groups';
    const breadcrumbs =
        role === ROLE.ADMIN
            ? [
                  {title: t('group.title'), to: '/admin/groups'},
                  {title: groupTitle ?? '', to: `/admin/groups/${groupId}`},
                  {title: t('chat.title')},
              ]
            : [{title: t('group.myGroups'), to: '/mentor/groups'}, {title: t('chat.title')}];

    if (rooms.isPending) return <LoadingState rows={8}/>;
    if (rooms.isError) return <ErrorState error={rooms.error} onRetry={rooms.refetch}/>;

    return (
        <>
            <PageHeader title={groupTitle ?? t('chat.title')} backTo={backTo} breadcrumbs={breadcrumbs}/>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--g-color-line-generic)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    height: 'calc(100vh - 220px)',
                    minHeight: 420,
                }}
            >
                {!roomId ? (
                    <EmptyState title={t('chat.notFound')}/>
                ) : (
                    <>
                        {activeRoom && (
                            <div
                                style={{
                                    padding: 12,
                                    borderBottom: '1px solid var(--g-color-line-generic)',
                                    fontSize: 12,
                                    color: 'var(--g-color-text-secondary)',
                                }}
                            >
                                {[
                                    activeRoom.mentor && fullName(activeRoom.mentor),
                                    `${t('group.students')}: ${activeRoom.students?.length ?? 0}`,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </div>
                        )}

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
                                    own={Boolean(me) && message[me.role]?.id === me.id}
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
                            <input ref={fileInputRef} type="file" style={{display: 'none'}} onChange={handleFile}/>
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
        </>
    );
}

export default GroupChatPage;
