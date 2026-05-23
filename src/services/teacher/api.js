import {api} from "@/services/api.js";

export async function getTeachers({page = 1, limit = 10} = {}) {
    const res = await api.get('teachers', {params: {page, limit}})
    const body = res.data

    // `GET /teachers` may resolve to the student handler (returns a plain array of
    // active teachers) or the admin handler (returns a {data,total,...} envelope).
    // Normalize both into a paginated envelope so callers stay shape-agnostic.
    if (Array.isArray(body)) {
        const total = body.length
        const start = (page - 1) * limit
        return {
            data: body.slice(start, start + limit),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        }
    }
    return body
}

export async function getTeacher(id) {
    const res = await api.get(`teachers/${id}`)
    return res.data
}

export async function getMyTeacherSummary() {
    const res = await api.get('teachers/me/summary')
    return res.data
}

export async function createTeacher(data) {
    const res = await api.post('teachers', data)
    return res.data
}

export async function updateTeacher(id, data) {
    const res = await api.patch(`teachers/${id}`, data)
    return res.data
}

export async function changeTeacherStatus(id, status) {
    const res = await api.patch(`teachers/${id}/status`, {status})
    return res.data
}

export async function uploadTeacherIntro(file) {
    const form = new FormData()
    form.append('video', file)
    const res = await api.patch('teachers/me', form)
    return res.data
}

export async function createFeedback(teacherId, data) {
    const res = await api.post(`teachers/${teacherId}/feedbacks`, data)
    return res.data
}
