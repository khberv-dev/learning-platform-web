import Icon from "@/ui/components/icon/index.jsx";

const ICON_THEMES = {
    green: {bg: 'var(--it-green-tint)', color: 'var(--it-green-700)'},
    orange: {bg: 'var(--it-avatar-orange-bg)', color: 'var(--it-avatar-orange-text)'},
    purple: {bg: 'var(--it-avatar-purple-bg)', color: 'var(--it-avatar-purple-text)'},
    blue: {bg: 'var(--it-avatar-blue-bg)', color: 'var(--it-avatar-blue-text)'},
}

export default function StatCard({value, label, icon, iconTheme = 'green', delta, deltaTone = 'success'}) {
    const t = ICON_THEMES[iconTheme] ?? ICON_THEMES.green

    const deltaBg = deltaTone === 'success' ? 'var(--it-success-bg)' : 'var(--it-danger-bg)'
    const deltaColor = deltaTone === 'success' ? 'var(--it-success-text)' : 'var(--it-danger-text)'

    return (
        <div
            style={{
                background: 'var(--it-surface)',
                border: '1px solid var(--it-border)',
                borderRadius: 'var(--it-radius-lg)',
                boxShadow: 'var(--it-shadow-sm)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 140,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: t.bg,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon name={icon} color={t.color} size={20}/>
                </div>

                {delta && (
                    <span
                        style={{
                            color: deltaColor,
                            background: deltaBg,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 999,
                        }}
                    >
                        {delta}
                    </span>
                )}
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                <span
                    style={{
                        fontSize: 30,
                        fontWeight: 700,
                        color: 'var(--it-text-primary)',
                        letterSpacing: -0.5,
                        lineHeight: 1.1,
                    }}
                >
                    {value}
                </span>
                <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>{label}</span>
            </div>
        </div>
    )
}
