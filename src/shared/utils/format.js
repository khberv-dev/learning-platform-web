import dayjs from 'dayjs';
import config from '@/shared/config.js';

export function fullName(user) {
    if (!user) return '';
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}

export function initials(name) {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

// Sums are stored as integer so'm, so they're grouped rather than decimalised.
export function formatMoney(amount) {
    if (amount == null) return '—';
    return `${Number(amount).toLocaleString('ru-RU')} so'm`;
}

export function formatDate(value) {
    return value ? dayjs(value).format('DD.MM.YYYY') : '—';
}

export function formatDateTime(value) {
    return value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—';
}

// Phone numbers are stored bare as 998XXXXXXXXX.
export function formatPhone(phoneNumber) {
    const digits = String(phoneNumber ?? '').replace(/\D/g, '');
    if (digits.length !== 12) return phoneNumber ?? '—';
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
}

// Stored asset paths are server-relative ("/public/avatars/x.png", or just
// "/avatar/x.png" for some modules). Absolute URLs and local preview URLs
// (blob:/data: from a file input) must pass through untouched.
export function cdnUrl(path) {
    if (!path) return null;
    if (/^(https?:|blob:|data:)/.test(path)) return path;
    return `${config.cdnBaseUrl}${path.replace(/^\/?(public\/)?/, '')}`;
}
