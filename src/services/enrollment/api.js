import {apiClient} from '@/services/api.js';

// Sorting is whitelisted server-side to createdAt/updatedAt/start/end/status.
//
// `isExpired` filters on the term, not the status, and implies `status=active`
// when no status is given — only an active enrollment has a meaningful end
// date. Every row also carries its own `isExpired`, because an enrollment can
// still read `active` while already past its end.
export async function getEnrollments({
    page = 1,
    limit = 15,
    studentId,
    courseId,
    status,
    isExpired,
    sortBy,
    sortOrder,
} = {}) {
    const res = await apiClient.get('admin/enrollments', {
        params: {
            page,
            limit,
            studentId: studentId || undefined,
            courseId: courseId || undefined,
            status: status || undefined,
            isExpired: isExpired === undefined || isExpired === '' ? undefined : isExpired,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
        },
    });
    return res.data;
}

// Manual, payment-free enrollment - the admin path for cash and bank transfer
// sales. Opens the enrollment as `active` immediately.
//
// Pass `planId` to take the course, duration and price from the plan; pass
// `courseId` instead and `end` becomes required, since there's no plan to
// derive the term from.
export async function createEnrollment(payload) {
    const res = await apiClient.post('admin/enrollments', payload);
    return res.data;
}

// Enrolment requests queued by an external service (CRM, terminal). They sit in
// `created` until an admin resolves them; the same sort whitelist as the
// enrollment list applies.
export async function getPendingEnrollments({
    page = 1,
    limit = 15,
    userId,
    courseId,
    status,
    sortBy,
    sortOrder,
} = {}) {
    const res = await apiClient.get('admin/pending-enrollments', {
        params: {
            page,
            limit,
            userId: userId || undefined,
            courseId: courseId || undefined,
            status: status || undefined,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
        },
    });
    return res.data;
}

// The request itself carries no plan - the admin picks one here, since price
// and duration are only settled at approval time. The plan must belong to the
// requested course. Omitting `amount` charges the plan's own price.
//
// Accepting opens the enrollment as `active` and writes a `paid` payment row:
// the money was collected outside the payment systems, as with a manual
// enrollment.
export async function acceptPendingEnrollment({id, planId, amount}) {
    const payload = {planId};
    if (amount !== undefined) payload.amount = amount;

    const res = await apiClient.patch(`admin/pending-enrollments/${id}/accept`, payload);
    return res.data;
}

export async function rejectPendingEnrollment(id) {
    const res = await apiClient.patch(`admin/pending-enrollments/${id}/reject`);
    return res.data;
}
