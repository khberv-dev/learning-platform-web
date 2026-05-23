import {api} from "@/services/api.js";

export async function createAssignment(data) {
    const res = await api.post('assignments', data)
    return res.data
}

export async function getPendingAssignments() {
    const res = await api.get('assignments/pending')
    return res.data
}

export async function acceptAssignment(id) {
    const res = await api.patch(`assignments/${id}/accept`)
    return res.data
}

export async function rejectAssignment(id) {
    const res = await api.patch(`assignments/${id}/reject`)
    return res.data
}

export async function getTeacherAssignmentHistory({page = 1, limit = 10} = {}) {
    const res = await api.get('assignments/history', {params: {page, limit}})
    return res.data
}

export async function getAssignments({status} = {}) {
    const res = await api.get('assignments', {params: status ? {status} : undefined})
    return res.data
}

export async function getAssignment(id) {
    const res = await api.get(`assignments/${id}`)
    return res.data
}
