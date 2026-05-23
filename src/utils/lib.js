export function formatNumber(input) {
    if (input == null) return ''
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function extractDigits(input) {
    return String(input ?? '').replace(/\D/g, '')
}

export function formatPhoneNumber(input) {
    const digits = String(input ?? '').replace(/\D/g, '').slice(0, 12)

    const groups = [3, 2, 3, 2, 2]
    const parts = []
    let index = 0

    for (const size of groups) {
        if (index >= digits.length) break

        parts.push(digits.slice(index, index + size))
        index += size
    }

    return parts.join(' ')
}

export function initials(name) {
    if (!name) return '?'
    const parts = String(name).trim().split(/\s+/).slice(0, 2)
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || '?'
}

export function fullName(user) {
    if (!user) return ''
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
}

const PALETTE = [
    {bg: 'var(--it-avatar-purple-bg)', fg: 'var(--it-avatar-purple-text)'},
    {bg: 'var(--it-avatar-blue-bg)', fg: 'var(--it-avatar-blue-text)'},
    {bg: 'var(--it-avatar-orange-bg)', fg: 'var(--it-avatar-orange-text)'},
    {bg: 'var(--it-avatar-green-bg)', fg: 'var(--it-avatar-green-text)'},
    {bg: 'var(--it-avatar-red-bg)', fg: 'var(--it-avatar-red-text)'},
]

export function colorFromString(seed) {
    const s = String(seed ?? '')
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return PALETTE[h % PALETTE.length]
}

export function formatDate(input, withTime = false) {
    if (!input) return ''
    const d = new Date(input)
    if (isNaN(d.getTime())) return ''
    const date = d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})
    if (!withTime) return date
    const time = d.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})
    return `${date}, ${time}`
}

export function timeAgo(input) {
    if (!input) return ''
    const d = new Date(input)
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks}w ago`
    return formatDate(input)
}
