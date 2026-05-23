export function SectionCard({title, action, children, padding = 20, className = ''}) {
    return (
        <section className={`it-section ${className}`} style={{padding}}>
            {(title || action) && (
                <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    {title && <h3 className="it-section__title">{title}</h3>}
                    {action}
                </header>
            )}
            {children}
        </section>
    )
}

export default SectionCard
