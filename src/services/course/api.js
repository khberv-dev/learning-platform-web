import {api} from "@/services/api.js";

function toFormData(dto, fileField, file) {
    const formData = new FormData()
    for (const [k, v] of Object.entries(dto ?? {})) {
        if (v === undefined || v === null) continue
        formData.append(k, typeof v === 'boolean' ? String(v) : v)
    }
    if (file) formData.append(fileField, file)
    return formData
}

// Admin
export async function getAllCourses() {
    const res = await api.get('courses')
    return res.data
}

export async function getCourseById(id) {
    const res = await api.get(`courses/${id}`)
    return res.data
}

export async function createCourse(dto, image) {
    const res = await api.post('courses', toFormData(dto, 'image', image), {
        headers: {'Content-Type': 'multipart/form-data'},
    })
    return res.data
}

export async function updateCourse(id, dto, image) {
    const res = await api.patch(`courses/${id}`, toFormData(dto, 'image', image), {
        headers: {'Content-Type': 'multipart/form-data'},
    })
    return res.data
}

export async function deleteCourse(id) {
    const res = await api.delete(`courses/${id}`)
    return res.data
}

// Student-facing
export async function getActiveCourses() {
    const res = await api.get('courses')
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
