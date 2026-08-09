import {api} from "@/services/api.js";

export async function getLiveLessons({page = 1, limit = 10} = {}) {
    const res = await api.get('live-lessons', {params: {page, limit}})
    return res.data
}

/** Live lessons the current student is assigned to. */
export async function getMyLiveLessons() {
    const res = await api.get('live-lessons/my')
    return res.data
}

export async function getLiveLesson(id) {
    const res = await api.get(`live-lessons/${id}`)
    return res.data
}

export async function createLiveLesson({name, meetLink, startTime, endTime, assignmentId}) {
    const res = await api.post('live-lessons', {name, meetLink, startTime, endTime, assignmentId})
    return res.data
}

export async function updateLiveLesson(id, data) {
    const res = await api.patch(`live-lessons/${id}`, data)
    return res.data
}

export async function deleteLiveLesson(id) {
    await api.delete(`live-lessons/${id}`)
}
