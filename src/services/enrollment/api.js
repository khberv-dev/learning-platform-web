import {api} from "@/services/api.js";

// Admin
export async function createEnrollment(data) {
    const res = await api.post('enrollments', data)
    return res.data
}

// Student
export async function getEnrollmentHistory() {
    const res = await api.get('enrollments/history')
    return res.data
}
