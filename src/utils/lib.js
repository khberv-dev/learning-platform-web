export function formatNumber(input) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function extractDigits(input) {
    return String(input).replace(/\D/g, '')
}

export function cleanPhoneNumber(input) {
    return String(input ?? '').replace(/\D/g, '').slice(0, 12)
}

export function formatPhoneNumber(input) {
    const digits = String(input).replace(/\D/g, '').slice(0, 12)

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
