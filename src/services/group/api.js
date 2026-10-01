import {apiClient} from '@/services/api.js';

// Admins manage groups under `admin/groups`; a mentor only reads the ones
// they lead (`mentor/groups/me`). A group belongs to a course and has at most
// one mentor, `primaryMentor`, stored on the group itself - there is no mentor
// team and no support mentors. Every row (list and detail) carries `course`
// and `primaryMentor`; mutations answer with the detail, which adds
// `students` (active members, each with its `joinedAt`).

export async function getGroups({page = 1, limit = 15, search, courseId, isActive, sortBy, sortOrder} = {}) {
    const res = await apiClient.get('admin/groups', {
        params: {
            page,
            limit,
            search: search?.trim() || undefined,
            courseId: courseId || undefined,
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

// A student may be in several groups, but only one active group per course:
// adding 400s (naming the conflict) if a student is already in this group or
// another group of the same course. Moving one between groups is a swap.
export async function addGroupStudents({id, studentIds}) {
    const res = await apiClient.post(`admin/groups/${id}/students`, {studentIds});
    return res.data;
}

export async function removeGroupStudent({id, studentId}) {
    const res = await apiClient.delete(`admin/groups/${id}/students/${studentId}`);
    return res.data;
}

// Moves the student out of `id` into `toGroupId` in one transaction - the
// target may be in another course. Answers with the target group.
export async function swapGroupStudent({id, studentId, toGroupId}) {
    const res = await apiClient.patch(`admin/groups/${id}/students/${studentId}/swap`, {toGroupId});
    return res.data;
}

// Sets the group's mentor, replacing whoever held it. Only a mentor whose own
// profile `role` is `primary` is accepted.
export async function assignPrimaryMentor({id, mentorId}) {
    const res = await apiClient.patch(`admin/groups/${id}/primary-mentor`, {mentorId});
    return res.data;
}

// Leaves the group with no mentor; 404s if it already has none.
export async function unassignPrimaryMentor(id) {
    const res = await apiClient.delete(`admin/groups/${id}/primary-mentor`);
    return res.data;
}

// A paginated envelope of the groups whose `primaryMentor` is the caller - the
// same row shape as `getGroups`, no `students[]`.
export async function getMyGroups({page = 1, limit = 100} = {}) {
    const res = await apiClient.get('mentor/groups/me', {params: {page, limit}});
    return res.data;
}

// The same detail shape the admin route answers with (`students[]` included).
// The server 403s unless the caller is this group's `primaryMentor`.
export async function getMyGroup(id) {
    const res = await apiClient.get(`mentor/groups/${id}`);
    return res.data;
}
