import {apiClient} from '@/services/api.js';

// Students are read-only for admins: they self-register through the mobile
// sign-up flow, so there is no create/update/delete endpoint here.
//
// `search` matches first name, last name, phone or email, case-insensitively.
// Sorting is whitelisted server-side and maps onto real columns, so only the
// documented field names are accepted.
export async function getStudents({
    page = 1,
    limit = 15,
    search,
    level,
    isActive,
    sortBy,
    sortOrder,
} = {}) {
    const res = await apiClient.get('students', {
        params: {
            page,
            limit,
            search: search?.trim() || undefined,
            level: level || undefined,
            isActive: isActive === undefined || isActive === '' ? undefined : isActive,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
        },
    });
    return res.data;
}

// Returns the profile plus its enrollments.
export async function getStudent(id) {
    const res = await apiClient.get(`students/${id}`);
    return res.data;
}
