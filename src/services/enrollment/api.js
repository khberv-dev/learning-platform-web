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
