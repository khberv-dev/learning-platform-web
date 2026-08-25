import {apiClient} from '@/services/api.js';

// Exactly one identity is sent. Email matching is case-insensitive server-side;
// phone numbers stay in the stored 998XXXXXXXXX format.
export async function signIn({identity, password}) {
    const normalized = identity.trim();
    const credentials = normalized.includes('@')
        ? {email: normalized.toLowerCase()}
        : {phoneNumber: normalized.replace(/\D/g, '')};
    const res = await apiClient.post('auth/sign-in', {...credentials, password});
    return res.data;
}
