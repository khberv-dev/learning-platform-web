import {apiClient} from '@/services/api.js';

// Admin accounts, managed by superadmins only - every `admin/admins` route
// 403s for a plain admin. There is no delete: an account is switched off with
// `isActive: false`, which blocks new sign-ins (a token already issued keeps
// working until it expires).
//
// `search` matches first name, last name and email, case-insensitively.
// Newest first; there is no sort parameter.
export async function getAdmins({page = 1, limit = 15, search, isActive, isSuperadmin} = {}) {
    const res = await apiClient.get('admin/admins', {
        params: {
            page,
            limit,
            search: search?.trim() || undefined,
            isActive: isActive === undefined || isActive === '' ? undefined : isActive,
            isSuperadmin: isSuperadmin === undefined || isSuperadmin === '' ? undefined : isSuperadmin,
        },
    });
    return res.data;
}

// `{firstName, lastName?, email, password, isSuperadmin?}`. The email is
// lowercased server-side and must be unused (case-insensitively).
export async function createAdmin(payload) {
    const res = await apiClient.post('admin/admins', payload);
    return res.data;
}

// Any create field plus `isActive`; `password` only when it should change.
// A superadmin can't switch off their own `isSuperadmin` or `isActive` (400),
// which also keeps at least one superadmin in place.
export async function updateAdmin({id, ...payload}) {
    const res = await apiClient.patch(`admin/admins/${id}`, payload);
    return res.data;
}
