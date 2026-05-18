import Input, {TextArea} from "@/ui/components/input/index.jsx";

export default function FormField({
                                      label,
                                      required,
                                      error,
                                      children,
                                      hint,
                                      style,
                                  }) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 6, ...style}}>
            {label && (
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--it-text-primary)',
                    }}
                >
                    {label}
                    {required && (
                        <span style={{color: 'var(--it-danger-text)', marginLeft: 4}}>*</span>
                    )}
                </span>
            )}
            {children}
            {hint && !error && (
                <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>{hint}</span>
            )}
            {error && (
                <span style={{fontSize: 12, color: 'var(--it-danger-text)'}}>{error}</span>
            )}
        </div>
    )
}

export function FormText({label, required, error, hint, style, ...props}) {
    return (
        <FormField label={label} required={required} error={error} hint={hint} style={style}>
            <Input
                validationState={error ? 'invalid' : undefined}
                {...props}
            />
        </FormField>
    )
}

export function FormTextArea({label, required, error, hint, style, ...props}) {
    return (
        <FormField label={label} required={required} error={error} hint={hint} style={style}>
            <TextArea
                validationState={error ? 'invalid' : undefined}
                {...props}
            />
        </FormField>
    )
}
