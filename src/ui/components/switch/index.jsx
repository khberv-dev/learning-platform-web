export function Switch({checked = false, onChange, label, disabled = false, id}) {
    const toggle = () => { if (!disabled) onChange?.(!checked) }

    return (
        <div
            id={id}
            className={`it-switch ${checked ? 'it-switch--on' : ''}`}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            onClick={toggle}
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    toggle()
                }
            }}
        >
            <span className={`it-switch__track ${checked ? 'it-switch__track--on' : ''}`}>
                <span className="it-switch__knob"/>
            </span>
            {label && <span className="it-switch__label">{label}</span>}
        </div>
    )
}

export default Switch
