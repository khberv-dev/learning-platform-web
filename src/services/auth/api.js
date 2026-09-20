import {apiClient} from '@/services/api.js';
import {ROLE} from '@/shared/auth/roles.js';

// Each role has its own sign-in route and identity: an admin signs in with an
// email (matched case-insensitively server-side), a mentor with a phone number
// in the stored 998XXXXXXXXX format. There is no student sign-in here.
export async function signIn({role, identity, password}) {
    const normalized = identity.trim();

    if (role === ROLE.ADMIN) {
        const res = await apiClient.post('auth/admin/sign-in', {email: normalized.toLowerCase(), password});
        return res.data;
    }

    const res = await apiClient.post('auth/mentor/sign-in', {
        phoneNumber: normalized.replace(/\D/g, ''),
        password,
    });
    return res.data;
}
