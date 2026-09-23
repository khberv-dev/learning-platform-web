import {apiClient} from '@/services/api.js';
import {currentRole} from '@/shared/auth/roles.js';

export async function getMe() {
    const res = await apiClient.get(`${currentRole()}/me`);
    return res.data;
}

export async function updateMyAvatar({file, onUploadProgress}) {
    const form = new FormData();
    form.append('avatar', file);
    const res = await apiClient.patch(`${currentRole()}/me/avatar`, form, {onUploadProgress});
    return res.data;
}

// Only students have a dedicated admin password route; a mentor's password is
// set through the regular mentor update (see services/mentor).
export async function setStudentPassword({id, password}) {
    await apiClient.patch(`admin/students/${id}/password`, {password});
}
