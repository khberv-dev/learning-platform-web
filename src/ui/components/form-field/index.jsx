export function FormField({label, hint, error, children, htmlFor}) {
    return (
        <label className="it-field" htmlFor={htmlFor}>
            {label && <span className="it-field__label">{label}</span>}
            {hint && <span className="it-field__hint">{hint}</span>}
            {children}
            {error && <span className="it-field__error">{error}</span>}
        </label>
    )
}

export default FormField
