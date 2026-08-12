import {apiClient} from '@/services/api.js';

// Students are read-only for admins: they self-register through the mobile
// sign-up flow, so there is no create/update/delete endpoint here.
export async function getStudents({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('students', {params: {page, limit}});
    return res.data;
}

// Returns the profile plus its enrollments.
export async function getStudent(id) {
    const res = await apiClient.get(`students/${id}`);
    return res.data;
}
