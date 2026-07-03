import {api} from "@/services/api.js";

export async function createUnit(courseId, data) {
    const res = await api.post(`admin/courses/${courseId}/units`, data)
    return res.data
}

export async function updateUnit(courseId, unitId, data) {
    const res = await api.patch(`admin/courses/${courseId}/units/${unitId}`, data)
    return res.data
}

export async function deleteUnit(courseId, unitId) {
    const res = await api.delete(`admin/courses/${courseId}/units/${unitId}`)
    return res.data
}
