export default function SectionCard({
                                        title,
                                        action,
                                        children,
                                        padding = 20,
                                        gap = 16,
                                        elevation = 'sm',
                                        style,
                                    }) {
    const shadow = elevation === 'none' ? 'none' : `var(--it-shadow-${elevation})`

    return (
        <div
            style={{
                background: 'var(--it-surface)',
                border: '1px solid var(--it-border)',
                borderRadius: 'var(--it-radius-lg)',
                boxShadow: shadow,
                padding,
                display: 'flex',
                flexDirection: 'column',
                gap,
                ...style,
            }}
        >
            {(title || action) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                    }}
                >
                    {title && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            {typeof title === 'string' ? (
                                <span
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: 'var(--it-text-primary)',
                                        letterSpacing: -0.1,
                                    }}
                                >
                                    {title}
                                </span>
                            ) : title}
                        </div>
                    )}
                    {action}
                </div>
            )}
            {children}
        </div>
    )
}
