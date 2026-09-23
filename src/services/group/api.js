import {apiClient} from '@/services/api.js';

// Admins manage groups under `admin/groups`; a mentor only reads their own
// (`mentor/groups/me`). Mutations answer with the full group detail - the
// group plus `mentors` (each with a `role`) and `students`.

export async function getGroups({page = 1, limit = 15, search, isActive, sortBy, sortOrder} = {}) {
    const res = await apiClient.get('admin/groups', {
        params: {
            page,
            limit,
            search: search?.trim() || undefined,
            isActive: isActive === undefined || isActive === '' ? undefined : isActive,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
        },
    });
    return res.data;
}

export async function getGroup(id) {
    const res = await apiClient.get(`admin/groups/${id}`);
    return res.data;
}

export async function createGroup(payload) {
    const res = await apiClient.post('admin/groups', payload);
    return res.data;
}

export async function updateGroup({id, ...payload}) {
    const res = await apiClient.patch(`admin/groups/${id}`, payload);
    return res.data;
}

export async function setGroupActive({id, isActive}) {
    const res = await apiClient.patch(`admin/groups/${id}/${isActive ? 'activate' : 'deactivate'}`);
    return res.data;
}

// Only students with no group can be added; moving a placed student is a swap.
export async function addGroupStudents({id, studentIds}) {
    const res = await apiClient.post(`admin/groups/${id}/students`, {studentIds});
    return res.data;
}

export async function removeGroupStudent({id, studentId}) {
    const res = await apiClient.delete(`admin/groups/${id}/students/${studentId}`);
    return res.data;
}

// Moves the student out of `id` into `toGroupId`; answers with the target group.
export async function swapGroupStudent({id, studentId, toGroupId}) {
    const res = await apiClient.patch(`admin/groups/${id}/students/${studentId}/swap`, {toGroupId});
    return res.data;
}

// Replaces whoever is primary; an existing support mentor is promoted.
export async function assignPrimaryMentor({id, mentorId}) {
    const res = await apiClient.patch(`admin/groups/${id}/primary-mentor`, {mentorId});
    return res.data;
}

export async function addSupportMentor({id, mentorId}) {
    const res = await apiClient.post(`admin/groups/${id}/support-mentors`, {mentorId});
    return res.data;
}

export async function removeGroupMentor({id, mentorId}) {
    const res = await apiClient.delete(`admin/groups/${id}/mentors/${mentorId}`);
    return res.data;
}

// A paginated envelope: every group the mentor is primary or support for, each
// row the same lightweight shape as `getGroups` (group fields + `primaryMentor`,
// `null` if unassigned) plus the calling mentor's own `role` in it - no
// `mentors[]`/`students[]`, unlike the single-group admin detail.
export async function getMyGroups({page = 1, limit = 100} = {}) {
    const res = await apiClient.get('mentor/groups/me', {params: {page, limit}});
    return res.data;
}

// Unlike the list, this is the full detail shape (`mentors[]`, `students[]`) -
// the same `findOneGroup` the admin route answers with. The server 403s if the
// calling mentor isn't a member (primary or support) of the group at all.
export async function getMyGroup(id) {
    const res = await apiClient.get(`mentor/groups/${id}`);
    return res.data;
}
