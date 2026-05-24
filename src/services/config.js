export const baseApiUrl = import.meta.env.VITE_BASE_API_URL
export const baseCdnUrl = import.meta.env.VITE_BASE_CDN_URL

export function cdnUrl(path) {
    if (!path) return null
    // Pass through absolute URLs and local previews (blob:/data:) untouched.
    if (/^(https?:|blob:|data:)/.test(path)) return path
    const cleaned = path.startsWith('/') ? path : `/${path}`
    return `${baseCdnUrl}${cleaned}`
}
