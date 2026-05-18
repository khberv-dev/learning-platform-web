import {api} from "@/services/api.js";

export async function createUnit(courseId, dto) {
    const res = await api.post(`courses/${courseId}/units`, dto)
    return res.data
}

export async function updateUnit(courseId, unitId, dto) {
    const res = await api.patch(`courses/${courseId}/units/${unitId}`, dto)
    return res.data
}

export async function deleteUnit(courseId, unitId) {
    const res = await api.delete(`courses/${courseId}/units/${unitId}`)
    return res.data
}
