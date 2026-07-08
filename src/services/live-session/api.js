import {api} from "@/services/api.js";

export async function uploadLiveSession(assignmentId, {title, file, onProgress}) {
    const form = new FormData()
    form.append('title', title)
    form.append('file', file)
    const res = await api.post(
        `live-sessions/assignments/${assignmentId}`,
        form,
        {onUploadProgress: e => onProgress?.(Math.round((e.loaded / e.total) * 100))},
    )
    return res.data
}

export async function getMyLiveSessions() {
    const res = await api.get('live-sessions/my')
    return res.data
}

export async function getLiveSessionsByAssignment(assignmentId) {
    const res = await api.get(`live-sessions/assignments/${assignmentId}`)
    return res.data
}

export async function getLiveSession(id) {
    const res = await api.get(`live-sessions/${id}`)
    return res.data
}
