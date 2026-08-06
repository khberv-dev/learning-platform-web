import {api} from "@/services/api.js";

export async function getEnrollmentHistory() {
    const res = await api.get('enrollments/history')
    return res.data
}

/**
 * Admin enrolls a student manually, without a payment — the enrollment opens as active.
 * `planId` supplies the course, duration and price; with `courseId` an `end` date is required.
 * data: {studentId, planId?, courseId?, start?, end?, purchaseAmount?}
 */
export async function createEnrollment(data) {
    const res = await api.post('admin/enrollments', data)
    return res.data
}
