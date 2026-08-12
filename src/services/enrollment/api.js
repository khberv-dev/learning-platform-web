import {apiClient} from '@/services/api.js';

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
