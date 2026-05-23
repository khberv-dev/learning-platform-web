import {api} from "@/services/api.js";

export async function getGroups({page = 1, limit = 10} = {}) {
    const res = await api.get('groups', {params: {page, limit}})
    return res.data
}

export async function getGroup(id) {
    const res = await api.get(`groups/${id}`)
    return res.data
}

export async function createGroup(data) {
    const res = await api.post('groups', data)
    return res.data
}

export async function updateGroup(id, data) {
    const res = await api.patch(`groups/${id}`, data)
    return res.data
}

export async function deactivateGroup(id) {
    const res = await api.patch(`groups/${id}/deactivate`)
    return res.data
}

export async function addStudentToGroup(groupId, studentId) {
    const res = await api.post(`groups/${groupId}/students/${studentId}`)
    return res.data
}

export async function removeStudentFromGroup(groupId, studentId) {
    const res = await api.delete(`groups/${groupId}/students/${studentId}`)
    return res.data
}
