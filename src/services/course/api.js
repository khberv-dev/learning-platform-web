import {api} from "@/services/api.js";

export async function getCourses() {
    const res = await api.get('admin/courses')
    return res.data
}

export async function getAvailableCourses() {
    const res = await api.get('courses/available')
    return res.data
}

export async function getMyCourses() {
    const res = await api.get('courses/me')
    return res.data
}

export async function getCourse(id) {
    const res = await api.get(`admin/courses/${id}`)
    return res.data
}

function asForm(payload, fileField = 'image') {
    const form = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
        if (k === fileField) return
        if (v === undefined || v === null) return
        form.append(k, typeof v === 'boolean' ? String(v) : v)
    })
    if (payload?.[fileField] instanceof File) {
        form.append(fileField, payload[fileField])
    }
    return form
}

export async function createCourse(data) {
    const res = await api.post('admin/courses', asForm(data, 'image'))
    return res.data
}

export async function updateCourse(id, data) {
    const res = await api.patch(`admin/courses/${id}`, asForm(data, 'image'))
    return res.data
}

export async function deleteCourse(id) {
    const res = await api.delete(`admin/courses/${id}`)
    return res.data
}
