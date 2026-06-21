import {api} from "@/services/api.js";

export async function uploadLiveSession(enrollmentId, {title, file}) {
    const form = new FormData()
    form.append('title', title)
    form.append('file', file)
    const res = await api.post(`live-sessions/enrollments/${enrollmentId}`, form)
    return res.data
}

export async function getMyLiveSessions() {
    const res = await api.get('live-sessions/my')
    return res.data
}

export async function getLiveSessionsByEnrollment(enrollmentId) {
    const res = await api.get(`live-sessions/enrollments/${enrollmentId}`)
    return res.data
}

export async function getLiveSession(id) {
    const res = await api.get(`live-sessions/${id}`)
    return res.data
}
