const PALETTES = {
    green: {bg: 'var(--it-green)', text: '#FFFFFF'},
    purple: {bg: 'var(--it-avatar-purple-bg)', text: 'var(--it-avatar-purple-text)'},
    purpleSolid: {bg: 'var(--it-avatar-purple-text)', text: '#FFFFFF'},
    gray: {bg: '#E5E7EB', text: '#374151'},
    blue: {bg: '#DBEAFE', text: '#1D4ED8'},
}

export default function Avatar({
                                   initials = '',
                                   size = 36,
                                   palette = 'green',
                                   style,
                               }) {
    const colors = PALETTES[palette] ?? PALETTES.green
    const fontSize = Math.round(size * 0.4)

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                background: colors.bg,
                color: colors.text,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize,
                flexShrink: 0,
                ...style,
            }}
        >
            {initials}
        </div>
    )
}
