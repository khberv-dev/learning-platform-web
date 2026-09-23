import {apiClient} from '@/services/api.js';

// Admin-side CRUD lives under `admin/mentors`; a mentor's own self-service
// routes live under `mentor/me`. Both are the same domain from the UI's
// point of view, so they share this module.

// `search` matches first name, last name and phone, case-insensitively.
// Sorting is whitelisted server-side and maps onto real columns, so only the
// documented field names are accepted.
export async function getMentors({
    page = 1,
    limit = 15,
    search,
    status,
    role,
    isActive,
    sortBy,
    sortOrder,
} = {}) {
    const res = await apiClient.get('admin/mentors', {
        params: {
            page,
            limit,
            search: search?.trim() || undefined,
            status: status || undefined,
            role: role || undefined,
            isActive: isActive === undefined || isActive === '' ? undefined : isActive,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
        },
    });
    return res.data;
}

export async function getMentor(id) {
    const res = await apiClient.get(`admin/mentors/${id}`);
    return res.data;
}

export async function createMentor(payload) {
    const res = await apiClient.post('admin/mentors', payload);
    return res.data;
}

export async function updateMentor({id, ...payload}) {
    const res = await apiClient.patch(`admin/mentors/${id}`, payload);
    return res.data;
}

export async function changeMentorStatus({id, status}) {
    const res = await apiClient.patch(`admin/mentors/${id}/status`, {status});
    return res.data;
}

export async function uploadMentorIntroVideo({id, file, onUploadProgress}) {
    const form = new FormData();
    form.append('video', file);
    const res = await apiClient.patch(`admin/mentors/${id}/intro-video`, form, {onUploadProgress});
    return res.data;
}

export async function uploadMentorAvatar({id, file, onUploadProgress}) {
    const form = new FormData();
    form.append('avatar', file);
    const res = await apiClient.patch(`admin/mentors/${id}/avatar`, form, {onUploadProgress});
    return res.data;
}

// ── Mentor self-service ──────────────────────────────────────────────────────

export async function getMySummary() {
    const res = await apiClient.get('mentor/me/summary');
    return res.data;
}

export async function uploadMyIntroVideo({file, onUploadProgress}) {
    const form = new FormData();
    form.append('video', file);
    const res = await apiClient.patch('mentor/me/intro-video', form, {onUploadProgress});
    return res.data;
}
