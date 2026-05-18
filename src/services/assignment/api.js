import {api} from "@/services/api.js";

// Admin
export async function getAllAssignments(status) {
    const res = await api.get('assignments', {params: status ? {status} : {}})
    return res.data
}

export async function getAssignmentById(id) {
    const res = await api.get(`assignments/${id}`)
    return res.data
}

// Teacher
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

// Student
export async function createAssignment(data) {
    const res = await api.post('assignments', data)
    return res.data
}
