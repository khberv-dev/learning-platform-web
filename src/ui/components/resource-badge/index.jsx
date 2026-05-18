const THEMES = {
    success: {bg: 'var(--it-success-bg)', border: 'var(--it-success-border)', text: 'var(--it-success-text)'},
    info: {bg: 'var(--it-info-bg)', border: 'var(--it-info-border)', text: 'var(--it-info-text)'},
    danger: {bg: 'var(--it-danger-bg)', border: 'var(--it-danger-border)', text: 'var(--it-danger-text)'},
    warning: {bg: 'var(--it-warning-bg)', border: 'var(--it-warning-border)', text: 'var(--it-warning-text)'},
    neutral: {bg: '#F3F4F6', border: '#E5E7EB', text: '#374151'},
}

export default function ResourceBadge({active, theme, children, dot = true}) {
    const resolved =
        theme ?? (active === undefined ? 'neutral' : active ? 'success' : 'danger')
    const c = THEMES[resolved] ?? THEMES.neutral

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.text,
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: 'nowrap',
            }}
        >
            {dot && (
                <span
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: c.text,
                        display: 'inline-block',
                    }}
                />
            )}
            {children ?? (active ? 'Active' : 'Inactive')}
        </span>
    )
}
