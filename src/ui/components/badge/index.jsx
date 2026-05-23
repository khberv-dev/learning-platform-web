export function Badge({children, variant = 'neutral', size = 'md', className = '', ...rest}) {
    const cls = [
        'it-badge',
        `it-badge--${variant}`,
        size === 'sm' && 'it-badge--sm',
        className,
    ].filter(Boolean).join(' ')
    return <span className={cls} {...rest}>{children}</span>
}

export default Badge
