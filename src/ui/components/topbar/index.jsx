import {useNavigate} from "react-router";
import Icon from "@/ui/components/icon/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import {useHeader} from "@/providers/header.jsx";
import {useAuth} from "@/providers/auth.jsx";

export default function Topbar() {
    const {title, onBack} = useHeader()
    const {user} = useAuth() ?? {}
    const navigate = useNavigate()

    return (
        <header
            style={{
                height: 64,
                background: 'var(--it-surface)',
                borderBottom: '1px solid var(--it-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                flexShrink: 0,
            }}
        >
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                {onBack && (
                    <button
                        type={'button'}
                        onClick={() => (typeof onBack === 'function' ? onBack() : navigate(-1))}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: 'var(--it-surface-alt)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <Icon name={'chevron-left'} size={18} color={'var(--it-text-primary)'}/>
                    </button>
                )}
                <span
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: 'var(--it-text-primary)',
                        letterSpacing: -0.2,
                    }}
                >
                    {title}
                </span>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <button
                    type={'button'}
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: 'var(--it-surface-alt)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                    }}
                >
                    <Icon name={'bell'} size={18} color={'var(--it-text-secondary)'}/>
                    <span
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: 'var(--it-green)',
                            border: '2px solid var(--it-surface)',
                        }}
                    />
                </button>
                <Avatar
                    initials={user?.initials ?? 'A'}
                    palette={user?.palette ?? 'green'}
                    size={38}
                />
            </div>
        </header>
    )
}
