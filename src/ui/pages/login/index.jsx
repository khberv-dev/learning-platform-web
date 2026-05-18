import {NavLink, Outlet} from "react-router";
import Icon from "@/ui/components/icon/index.jsx";

export default function LoginPage() {
    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100vh',
                background: 'var(--it-surface)',
            }}
        >
            <aside
                style={{
                    width: 580,
                    background: 'var(--it-green)',
                    padding: 48,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: '#FFFFFF',
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.16)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 6,
                        }}
                    >
                        <img
                            src={'/brand.png'}
                            alt={'iTeach'}
                            style={{width: '100%', height: '100%', objectFit: 'contain'}}
                        />
                    </div>
                    <span style={{fontSize: 22, fontWeight: 700}}>iTeach</span>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <span style={{fontSize: 44, fontWeight: 800, lineHeight: 1.1}}>
                        Modern Learning Platform
                    </span>
                    <span style={{fontSize: 16, opacity: 0.92}}>
                        Empowering teachers and students to grow together.
                    </span>
                </div>

                <span style={{fontSize: 12, opacity: 0.85}}>© 2025 iTeach</span>
            </aside>

            <section
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 32,
                }}
            >
                <div style={{width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 24}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                        <span style={{fontSize: 28, fontWeight: 700, color: 'var(--it-text-primary)'}}>
                            Welcome back
                        </span>
                        <span style={{fontSize: 14, color: 'var(--it-text-secondary)'}}>
                            Sign in with your credentials
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: 24,
                            borderBottom: '1px solid var(--it-border)',
                        }}
                    >
                        <LoginTab to={'/login/email'} icon={'mail'} label={'Email'}/>
                        <LoginTab to={'/login/phone'} icon={'phone'} label={'Phone Number'}/>
                    </div>

                    <Outlet/>
                </div>
            </section>
        </div>
    )
}

function LoginTab({to, icon, label}) {
    return (
        <NavLink
            to={to}
            style={({isActive}) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 4px',
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? 'var(--it-green)' : 'var(--it-text-secondary)',
                borderBottom: `2px solid ${isActive ? 'var(--it-green)' : 'transparent'}`,
                marginBottom: -1,
            })}
        >
            {({isActive}) => (
                <>
                    <Icon name={icon} size={16} color={isActive ? 'var(--it-green)' : 'var(--it-text-secondary)'}/>
                    {label}
                </>
            )}
        </NavLink>
    )
}
