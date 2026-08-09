/**
 * `as="div"` for fields whose content is not a single labelable control —
 * a <label> forwards clicks to the first labelable descendant, so wrapping a
 * file input or an upload button in one makes any click in the field open the
 * file picker.
 */
export function FormField({label, hint, error, children, htmlFor, as: Tag = 'label'}) {
    return (
        <Tag className="it-field" htmlFor={Tag === 'label' ? htmlFor : undefined}>
            {label && <span className="it-field__label">{label}</span>}
            {hint && <span className="it-field__hint">{hint}</span>}
            {children}
            {error && <span className="it-field__error">{error}</span>}
        </Tag>
    )
}

export default FormField
