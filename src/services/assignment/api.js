import {apiClient} from '@/services/api.js';

// Admins see every assignment (`admin/assignments`); a mentor sees only their
// own queue and history (`mentor/assignments`).

export async function getAssignments({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('admin/assignments', {params: {page, limit}});
    return res.data;
}

export async function getAssignment(id) {
    const res = await apiClient.get(`admin/assignments/${id}`);
    return res.data;
}

// Returns a plain array, not a paginated envelope.
export async function getPendingAssignments() {
    const res = await apiClient.get('mentor/assignments/pending');
    return res.data;
}

export async function getAssignmentHistory({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('mentor/assignments/history', {params: {page, limit}});
    return res.data;
}

export async function acceptAssignment(id) {
    const res = await apiClient.patch(`mentor/assignments/${id}/accept`);
    return res.data;
}

export async function rejectAssignment(id) {
    const res = await apiClient.patch(`mentor/assignments/${id}/reject`);
    return res.data;
}
