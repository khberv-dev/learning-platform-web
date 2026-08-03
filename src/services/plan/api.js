import {api} from "@/services/api.js";

export async function getPlans(courseId) {
    const res = await api.get(`admin/courses/${courseId}/plans`)
    return res.data
}

export async function getActivePlans(courseId) {
    const res = await api.get(`courses/${courseId}/plans`)
    return res.data
}

export async function getPlan(courseId, planId) {
    const res = await api.get(`admin/courses/${courseId}/plans/${planId}`)
    return res.data
}

export async function createPlan(courseId, data) {
    const res = await api.post(`admin/courses/${courseId}/plans`, data)
    return res.data
}

export async function updatePlan(courseId, planId, data) {
    const res = await api.patch(`admin/courses/${courseId}/plans/${planId}`, data)
    return res.data
}

export async function setPlanActive(courseId, planId, isActive) {
    const action = isActive ? 'activate' : 'deactivate'
    const res = await api.patch(`admin/courses/${courseId}/plans/${planId}/${action}`)
    return res.data
}

export async function deletePlan(courseId, planId) {
    const res = await api.delete(`admin/courses/${courseId}/plans/${planId}`)
    return res.data
}
