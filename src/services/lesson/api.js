import {api} from "@/services/api.js";

function asForm(payload, fileField = 'media') {
    const form = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
        if (k === fileField) return
        if (v === undefined || v === null) return
        form.append(k, v)
    })
    if (payload?.[fileField] instanceof File) {
        form.append(fileField, payload[fileField])
    }
    return form
}

export async function createLesson(courseId, unitId, data) {
    const res = await api.post(`courses/${courseId}/units/${unitId}/lessons`, asForm(data, 'media'))
    return res.data
}

export async function updateLesson(courseId, unitId, lessonId, data) {
    const res = await api.patch(`courses/${courseId}/units/${unitId}/lessons/${lessonId}`, data)
    return res.data
}

export async function deleteLesson(courseId, unitId, lessonId) {
    const res = await api.delete(`courses/${courseId}/units/${unitId}/lessons/${lessonId}`)
    return res.data
}
