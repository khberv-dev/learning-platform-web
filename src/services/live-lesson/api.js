import {apiClient} from '@/services/api.js';

export async function getLiveLessons({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('live-lessons', {params: {page, limit}});
    return res.data;
}

export async function getLiveLesson(id) {
    const res = await apiClient.get(`live-lessons/${id}`);
    return res.data;
}

// A live lesson always hangs off an accepted assignment - that's what ties it
// to a specific student.
export async function createLiveLesson(payload) {
    const res = await apiClient.post('live-lessons', payload);
    return res.data;
}

export async function updateLiveLesson({id, ...payload}) {
    const res = await apiClient.patch(`live-lessons/${id}`, payload);
    return res.data;
}

export async function deleteLiveLesson(id) {
    await apiClient.delete(`live-lessons/${id}`);
}

// Recordings are filed against the assignment, not the live lesson row.
export async function uploadRecording({assignmentId, title, file}) {
    const form = new FormData();
    form.append('title', title);
    form.append('file', file);
    const res = await apiClient.post(`live-lesson-recordings/assignments/${assignmentId}`, form);
    return res.data;
}
