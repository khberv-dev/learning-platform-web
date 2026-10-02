import {apiClient} from '@/services/api.js';

// A 1-to-1 student<->mentor pairing, separate from groups. The student asks
// for one from the app against one of their own subscriptions (one assignment
// per subscription), with a weekly schedule; it waits as `pending` until an
// admin gives it a mentor, which makes it `active`. Admins only ever read and
// (re)assign the mentor - there is no create, edit or delete here.
//
// Rows carry `student`, `mentor` (null while pending), `subscription` (with
// its `course` and the paid `start`/`end` term), `status`, `start` (set the
// first time a mentor is assigned, kept on reassignment) and `schedule`.

export async function getAssignments({page = 1, limit = 15, status, studentId, mentorId} = {}) {
    const res = await apiClient.get('admin/assignments', {
        params: {
            page,
            limit,
            status: status || undefined,
            studentId: studentId || undefined,
            mentorId: mentorId || undefined,
        },
    });
    return res.data;
}

// Adds `histories` - one row per mentor tenure ({mentor, start, end}), newest
// first, at most one still open (`end: null`).
export async function getAssignment(id) {
    const res = await apiClient.get(`admin/assignments/${id}`);
    return res.data;
}

// Assigns or reassigns. The mentor must be `working` (any role); picking the
// one already on it 400s. Answers with the detail, histories included.
export async function assignAssignmentMentor({id, mentorId}) {
    const res = await apiClient.patch(`admin/assignments/${id}/mentor`, {mentorId});
    return res.data;
}

// The assignments the calling mentor currently holds. Read-only.
export async function getMyAssignments({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('mentor/assignments', {params: {page, limit}});
    return res.data;
}
