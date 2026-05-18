import {api} from "@/services/api.js";

export async function createLesson(courseId, unitId, dto, media) {
    const formData = new FormData()
    for (const [k, v] of Object.entries(dto ?? {})) {
        if (v === undefined || v === null) continue
        formData.append(k, v)
    }
    if (media) formData.append('media', media)

    const res = await api.post(`courses/${courseId}/units/${unitId}/lessons`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    })
    return res.data
}

export async function updateLesson(courseId, unitId, lessonId, dto) {
    const res = await api.patch(`courses/${courseId}/units/${unitId}/lessons/${lessonId}`, dto)
    return res.data
}

export async function deleteLesson(courseId, unitId, lessonId) {
    const res = await api.delete(`courses/${courseId}/units/${unitId}/lessons/${lessonId}`)
    return res.data
}
