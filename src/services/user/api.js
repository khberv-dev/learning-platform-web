import {apiClient} from '@/services/api.js';

export async function getMe() {
    const res = await apiClient.get('user/me');
    return res.data;
}

export async function updateMyAvatar(file) {
    const form = new FormData();
    form.append('avatar', file);
    const res = await apiClient.patch('user/me/avatar', form);
    return res.data;
}

export async function setUserPassword({id, password}) {
    await apiClient.patch(`admin/users/${id}/password`, {password});
}
