function FormField({label, hint, error, required, children}) {
    return (
        <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            {label && (
                <span style={{fontSize: 13, fontWeight: 500, color: 'var(--g-color-text-secondary)'}}>
                    {label}
                    {required && <span style={{color: 'var(--g-color-text-danger)'}}> *</span>}
                </span>
            )}
            {children}
            {hint && !error && (
                <span style={{fontSize: 12, color: 'var(--g-color-text-hint)'}}>{hint}</span>
            )}
            {error && <span style={{fontSize: 12, color: 'var(--g-color-text-danger)'}}>{error}</span>}
        </label>
    );
}

export default FormField;
