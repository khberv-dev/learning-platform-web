export default function Card({
                                 elevation = 'sm',
                                 padding = 20,
                                 gap = 16,
                                 interactive = false,
                                 style,
                                 children,
                                 ...props
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
                transition: interactive ? 'box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease' : undefined,
                cursor: interactive ? 'pointer' : undefined,
                ...(interactive && {
                    ':hover': {
                        borderColor: 'var(--it-border-strong)',
                    },
                }),
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    )
}
