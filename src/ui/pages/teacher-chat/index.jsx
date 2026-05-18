import {useEffect, useState} from "react";
import {Button, TextInput} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";

const CONVERSATIONS = [
    {
        id: 1,
        name: 'Anton Tomas',
        initials: 'AT',
        palette: 'blue',
        lastMessage: 'Thanks for the lesson today!',
        time: '12:42',
        unread: 2
    },
    {
        id: 2,
        name: 'Yuliya Misyura',
        initials: 'YM',
        palette: 'purple',
        lastMessage: 'When is the next session?',
        time: '11:18',
        unread: 0
    },
    {
        id: 3,
        name: 'Farrux Nuriddinov',
        initials: 'FN',
        palette: 'green',
        lastMessage: 'Can you share the slides?',
        time: 'Yesterday',
        unread: 1
    },
    {
        id: 4,
        name: 'Madina Yusupova',
        initials: 'MY',
        palette: 'gray',
        lastMessage: 'Got it, thank you!',
        time: 'Mon',
        unread: 0
    },
]

const MESSAGES_BY_ID = {
    1: [
        {from: 'them', text: 'Hi! Thanks for the lesson today.'},
        {from: 'me', text: 'You\'re welcome — glad it helped.'},
        {from: 'them', text: 'When are the practice problems coming?'},
        {from: 'me', text: 'I\'ll post them tomorrow morning.'},
    ],
}

export default function TeacherChatPage() {
    const {setHeader} = useHeader()
    const [activeId, setActiveId] = useState(null)
    const [draft, setDraft] = useState('')

    useEffect(() => {
        setHeader({title: 'Chat'})
    }, [setHeader])

    const active = CONVERSATIONS.find(c => c.id === activeId)
    const messages = active ? (MESSAGES_BY_ID[active.id] ?? []) : []

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '320px 1fr',
                gap: 0,
                background: 'var(--it-surface)',
                border: '1px solid var(--it-border)',
                borderRadius: 12,
                height: 'calc(100vh - 64px - 56px)',
                overflow: 'hidden',
            }}
        >
            <div style={{display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--it-border)'}}>
                <div style={{padding: 16, borderBottom: '1px solid var(--it-border)'}}>
                    <TextInput
                        placeholder={'Search conversations...'}
                        startContent={
                            <span style={{paddingLeft: 8, display: 'inline-flex'}}>
                                <Icon name={'search'} size={16} color={'var(--it-text-secondary)'}/>
                            </span>
                        }
                    />
                </div>
                <div style={{flex: 1, overflow: 'auto'}}>
                    {CONVERSATIONS.map(c => (
                        <button
                            key={c.id}
                            type={'button'}
                            onClick={() => setActiveId(c.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                width: '100%',
                                padding: 14,
                                border: 'none',
                                background: c.id === activeId ? 'var(--it-green-tint)' : 'transparent',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--it-border)',
                            }}
                        >
                            <Avatar initials={c.initials} palette={c.palette} size={40}/>
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                textAlign: 'left',
                                minWidth: 0
                            }}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{fontSize: 14, fontWeight: 600}}>{c.name}</span>
                                    <span style={{fontSize: 11, color: 'var(--it-text-secondary)'}}>{c.time}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: 'var(--it-text-secondary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {c.lastMessage}
                                    </span>
                                    {c.unread > 0 && (
                                        <span
                                            style={{
                                                background: 'var(--it-green)',
                                                color: '#FFFFFF',
                                                fontSize: 10,
                                                fontWeight: 700,
                                                borderRadius: 10,
                                                padding: '2px 6px',
                                            }}
                                        >
                                            {c.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {!active ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        color: 'var(--it-text-secondary)',
                    }}
                >
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            background: '#F3F4F6',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon name={'message-circle'} size={28} color={'var(--it-text-secondary)'}/>
                    </div>
                    <span style={{fontSize: 16, fontWeight: 600, color: 'var(--it-text-primary)'}}>
                        No conversation selected
                    </span>
                    <span style={{fontSize: 13}}>Choose a student from the list to start chatting.</span>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 16,
                            borderBottom: '1px solid var(--it-border)',
                        }}
                    >
                        <Avatar initials={active.initials} palette={active.palette} size={40}/>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <span style={{fontSize: 14, fontWeight: 600}}>{active.name}</span>
                            <span style={{fontSize: 12, color: 'var(--it-success-text)'}}>Online</span>
                        </div>
                    </div>

                    <div style={{
                        flex: 1,
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        overflow: 'auto'
                    }}>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    padding: '10px 14px',
                                    borderRadius: 14,
                                    background: m.from === 'me' ? 'var(--it-green)' : '#F3F4F6',
                                    color: m.from === 'me' ? '#FFFFFF' : 'var(--it-text-primary)',
                                    fontSize: 14,
                                }}
                            >
                                {m.text}
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            padding: 16,
                            borderTop: '1px solid var(--it-border)',
                        }}
                    >
                        <Button view={'flat'}>
                            <Icon name={'paperclip'} size={18} color={'var(--it-text-secondary)'}/>
                        </Button>
                        <TextInput
                            value={draft}
                            onUpdate={setDraft}
                            placeholder={'Type a message...'}
                            size={'l'}
                            style={{flex: 1}}
                        />
                        <Button
                            view={'action'}
                            size={'l'}
                        >
                            <Icon name={'send'} size={16} color={'#FFFFFF'}/>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
