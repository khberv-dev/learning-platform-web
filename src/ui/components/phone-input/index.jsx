import {useController} from 'react-hook-form'

function formatUzbPhone(input) {
    const digits = String(input ?? '').replace(/\D/g, '').slice(0, 9)
    const parts = []
    if (digits.length > 0) parts.push(digits.slice(0, 2))
    if (digits.length > 2) parts.push(digits.slice(2, 5))
    if (digits.length > 5) parts.push(digits.slice(5, 7))
    if (digits.length > 7) parts.push(digits.slice(7, 9))
    return parts.join(' ')
}

export function PhoneInput({control, name = 'phoneNumber', rules}) {
    const {field} = useController({control, name, rules})

    return (
        <div className="it-input it-input--lg">
            <span style={{paddingRight: 12, borderRight: '1px solid var(--it-border-strong)', color: 'var(--it-text-body)', fontSize: 14}}>
                +998
            </span>
            <input
                type="tel"
                className="it-input__el"
                placeholder="90 123 45 67"
                autoComplete="tel"
                value={formatUzbPhone(field.value)}
                onChange={e => field.onChange(formatUzbPhone(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
            />
        </div>
    )
}

export default PhoneInput
