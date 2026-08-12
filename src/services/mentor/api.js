import {apiClient} from '@/services/api.js';

// Admin-side CRUD lives under `admin/teachers`; a mentor's own self-service
// routes live under `teachers/me`. Both are the same domain from the UI's
// point of view, so they share this module.

export async function getMentors({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('admin/teachers', {params: {page, limit}});
    return res.data;
}

export async function getMentor(id) {
    const res = await apiClient.get(`admin/teachers/${id}`);
    return res.data;
}

export async function createMentor(payload) {
    const res = await apiClient.post('admin/teachers', payload);
    return res.data;
}

export async function updateMentor({id, ...payload}) {
    const res = await apiClient.patch(`admin/teachers/${id}`, payload);
    return res.data;
}

export async function changeMentorStatus({id, status}) {
    const res = await apiClient.patch(`admin/teachers/${id}/status`, {status});
    return res.data;
}

export async function uploadMentorIntroVideo({id, file}) {
    const form = new FormData();
    form.append('video', file);
    const res = await apiClient.patch(`admin/teachers/${id}/intro-video`, form);
    return res.data;
}

// ── Mentor self-service ──────────────────────────────────────────────────────

export async function getMySummary() {
    const res = await apiClient.get('teachers/me/summary');
    return res.data;
}

export async function getMySchedule() {
    const res = await apiClient.get('teachers/me/schedule');
    return res.data;
}

// Keys are Mon..Sun, values are HH:00 / HH:30 strings - the API rejects any
// other day name or minute value.
export async function setMySchedule(schedule) {
    const res = await apiClient.patch('teachers/me/schedule', {schedule});
    return res.data;
}

export async function uploadMyIntroVideo(file) {
    const form = new FormData();
    form.append('video', file);
    const res = await apiClient.patch('teachers/me', form);
    return res.data;
}
