import {apiClient} from '@/services/api.js';

// A live lesson is a create-only "go live now" broadcast, not a schedulable
// resource - there is no list, update or delete here, only this and the
// recording upload below. The mentor creating it must currently hold the
// primary role for the target group; the API notifies every student in it.
export async function createLiveLesson(payload) {
    const res = await apiClient.post('mentor/live-lessons', payload);
    return res.data;
}

// Recordings are a separate, unrelated entity filed against the group.
export async function uploadRecording({groupId, title, file, onUploadProgress}) {
    const form = new FormData();
    form.append('title', title);
    form.append('file', file);
    const res = await apiClient.post(`mentor/live-lesson-recordings/groups/${groupId}`, form, {onUploadProgress});
    return res.data;
}
