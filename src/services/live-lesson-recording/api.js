import {api} from "@/services/api.js";

/** Teacher uploads the recording of a live lesson held for an assignment. */
export async function uploadLiveLessonRecording(assignmentId, {title, file, onProgress}) {
    const form = new FormData()
    form.append('title', title)
    form.append('file', file)
    const res = await api.post(
        `live-lesson-recordings/assignments/${assignmentId}`,
        form,
        {onUploadProgress: e => onProgress?.(Math.round((e.loaded / e.total) * 100))},
    )
    return res.data
}

export async function getMyLiveLessonRecordings() {
    const res = await api.get('live-lesson-recordings/my')
    return res.data
}

export async function getLiveLessonRecordingsByAssignment(assignmentId) {
    const res = await api.get(`live-lesson-recordings/assignments/${assignmentId}`)
    return res.data
}

export async function getLiveLessonRecording(id) {
    const res = await api.get(`live-lesson-recordings/${id}`)
    return res.data
}
