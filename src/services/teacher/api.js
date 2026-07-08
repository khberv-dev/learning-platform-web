import {api} from "@/services/api.js";

export async function getTeachers({page = 1, limit = 10} = {}) {
    const res = await api.get('admin/teachers', {params: {page, limit}})
    return res.data
}

export async function getTeacher(id) {
    const res = await api.get(`admin/teachers/${id}`)
    return res.data
}

export async function getMyTeacherSummary() {
    const res = await api.get('teachers/me/summary')
    return res.data
}

export async function createTeacher(data) {
    const res = await api.post('admin/teachers', data)
    return res.data
}

export async function updateTeacher(id, data) {
    const res = await api.patch(`admin/teachers/${id}`, data)
    return res.data
}

export async function changeTeacherStatus(id, status) {
    const res = await api.patch(`admin/teachers/${id}/status`, {status})
    return res.data
}

export async function uploadTeacherIntro(file, onProgress) {
    const form = new FormData()
    form.append('video', file)
    const res = await api.patch(
        'teachers/me',
        form,
        {onUploadProgress: e => onProgress?.(Math.round((e.loaded / e.total) * 100))},
    )
    return res.data
}

export async function uploadTeacherIntroById(id, file, onProgress) {
    const form = new FormData()
    form.append('video', file)
    const res = await api.patch(
        `admin/teachers/${id}/intro-video`,
        form,
        {onUploadProgress: e => onProgress?.(Math.round((e.loaded / e.total) * 100))},
    )
    return res.data
}

export async function createFeedback(teacherId, data) {
    const res = await api.post(`teachers/${teacherId}/feedbacks`, data)
    return res.data
}

export async function getMySchedule() {
    const res = await api.get('teachers/me/schedule')
    return res.data
}

export async function setMySchedule(schedule) {
    const res = await api.patch('teachers/me/schedule', {schedule})
    return res.data
}
