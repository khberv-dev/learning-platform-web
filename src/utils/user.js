export function getFullName(user) {
    if (!user) return ''
    const first = user.firstName?.trim() ?? ''
    const last = user.lastName?.trim() ?? ''
    return [first, last].filter(Boolean).join(' ') || 'User'
}

export function getInitials(user) {
    if (!user) return '?'
    const first = user.firstName?.trim()?.[0]?.toUpperCase() ?? ''
    const last = user.lastName?.trim()?.[0]?.toUpperCase() ?? ''
    return (first + last) || first || '?'
}

const PALETTES = ['green', 'purple', 'blue', 'gray']

export function getAvatarPalette(id) {
    if (!id) return PALETTES[0]
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
    return PALETTES[Math.abs(h) % PALETTES.length]
}
