import {NavLink, useNavigate} from "react-router";
import Icon from "@/ui/components/icon/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";

export default function Sidebar({items, user}) {
    const navigate = useNavigate()

    return (
        <aside
            style={{
                width: 248,
                background: 'var(--it-sidebar-bg)',
                display: 'flex',
                flexDirection: 'column',
                color: 'var(--it-text-on-dark)',
                flexShrink: 0,
                borderRight: '1px solid rgba(255, 255, 255, 0.04)',
            }}
        >
            <div
                style={{
                    height: 64,
                    padding: '0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                }}
                onClick={() => navigate('/')}
            >
                <img
                    src={'/brand.png'}
                    alt={'iTeach'}
                    width={36}
                    height={36}
                    style={{
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 10px rgba(24, 201, 106, 0.35))',
                    }}
                />
                <span style={{fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.2}}>
                    iTeach
                </span>
            </div>

            <div style={{height: 1, background: 'var(--it-sidebar-divider)'}}/>

            <nav
                style={{
                    flex: 1,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}
            >
                {items.map((item, i) => {
                    if (item.spacer) return <div key={`s-${i}`} style={{flex: 1}}/>

                    if (item.onClick) {
                        return (
                            <button
                                key={`a-${i}`}
                                type={'button'}
                                onClick={item.onClick}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    height: 42,
                                    padding: '0 12px',
                                    borderRadius: 10,
                                    background: 'transparent',
                                    color: item.tone === 'danger' ? '#FCA5A5' : 'var(--it-text-on-dark-soft)',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%',
                                    transition: 'background 0.15s ease, color 0.15s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <Icon
                                    name={item.icon}
                                    size={18}
                                    color={item.tone === 'danger' ? '#FCA5A5' : 'var(--it-text-on-dark-soft)'}
                                />
                                <span>{item.label}</span>
                            </button>
                        )
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            style={({isActive}) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                height: 42,
                                padding: '0 12px',
                                borderRadius: 10,
                                background: isActive ? 'var(--it-green-tint)' : 'transparent',
                                color: isActive ? '#FFFFFF' : 'var(--it-text-on-dark-soft)',
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 500,
                                transition: 'background 0.15s ease, color 0.15s ease',
                            })}
                        >
                            {({isActive}) => (
                                <>
                                    <Icon
                                        name={item.icon}
                                        size={18}
                                        color={isActive ? 'var(--it-green)' : 'var(--it-text-on-dark-soft)'}
                                    />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </nav>

            <div style={{height: 1, background: 'var(--it-sidebar-divider)'}}/>

            <div
                style={{
                    height: 68,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}
            >
                <Avatar
                    initials={user?.initials ?? 'A'}
                    palette={user?.palette ?? 'green'}
                />
                <div style={{display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden'}}>
                    <span
                        style={{
                            color: '#F9FAFB',
                            fontSize: 13,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {user?.name ?? 'User'}
                    </span>
                    <span style={{color: 'var(--it-text-on-dark-soft)', fontSize: 11}}>
                        {user?.role ?? ''}
                    </span>
                </div>
            </div>
        </aside>
    )
}
