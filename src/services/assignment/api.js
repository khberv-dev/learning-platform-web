import {apiClient} from '@/services/api.js';

// Admins see every assignment; a mentor sees only their own queue and history.
// Both live under `assignments`, split by role on the server.

export async function getAssignments({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('assignments', {params: {page, limit}});
    return res.data;
}

export async function getAssignment(id) {
    const res = await apiClient.get(`assignments/${id}`);
    return res.data;
}

// Returns a plain array, not a paginated envelope.
export async function getPendingAssignments() {
    const res = await apiClient.get('assignments/pending');
    return res.data;
}

export async function getAssignmentHistory({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('assignments/history', {params: {page, limit}});
    return res.data;
}

export async function acceptAssignment(id) {
    const res = await apiClient.patch(`assignments/${id}/accept`);
    return res.data;
}

export async function rejectAssignment(id) {
    const res = await apiClient.patch(`assignments/${id}/reject`);
    return res.data;
}
