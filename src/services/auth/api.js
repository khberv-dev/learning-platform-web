import {api} from "@/services/api.js";

/** data: {email, password} or {phoneNumber, password} — phoneNumber is 998XXXXXXXXX. */
export async function signIn(data) {
    const res = await api.post('auth/sign-in', data)
    return res.data
}

/** data: {firstName, phoneNumber, password, code} — `code` is the 6-digit OTP from sendOtp. */
export async function signUp(data) {
    const res = await api.post('auth/sign-up', data)
    return res.data
}

/**
 * Sends a 6-digit OTP over SMS. Used for both sign-up and password recovery.
 * Rate limited server-side: one per 60s and 5 per hour for a phone number
 * (429 with a message saying how long to wait).
 */
export async function sendOtp(phoneNumber) {
    const res = await api.post('auth/otp/send', {phoneNumber})
    return res.data
}

/** data: {phoneNumber, code, newPassword} */
export async function recoverPassword(data) {
    const res = await api.post('auth/recover-password', data)
    return res.data
}
