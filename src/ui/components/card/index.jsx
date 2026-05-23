export function Card({children, padding = 0, gap, style, className = '', shadow = false, ...rest}) {
    const cls = ['it-card', shadow && 'it-card--shadow', className].filter(Boolean).join(' ')
    const composed = {
        padding,
        display: 'flex',
        flexDirection: 'column',
        gap,
        ...style,
    }
    return (
        <div className={cls} style={composed} {...rest}>
            {children}
        </div>
    )
}

export default Card
