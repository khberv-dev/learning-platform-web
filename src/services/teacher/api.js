import {api} from "@/services/api.js";

// Admin
export async function getAllTeachers() {
    const res = await api.get('teachers')
    return res.data
}

export async function getTeacherById(id) {
    const res = await api.get(`teachers/${id}`)
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

// Student-facing
export async function getActiveTeachers() {
    const res = await api.get('teachers')
    return res.data
}

export async function addTeacherFeedback(id, data) {
    const res = await api.post(`teachers/${id}/feedbacks`, data)
    return res.data
}

// Teacher self (intro video upload)
export async function updateTeacherIntroVideo(file) {
    const formData = new FormData()
    formData.append('video', file)

    const res = await api.patch('teachers/me', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    })
    return res.data
}
