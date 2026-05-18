import {api} from "@/services/api.js";

export async function createAssessment(audio) {
    const formData = new FormData()
    formData.append('audio', audio)

    const res = await api.post('assessments', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    })
    return res.data
}

export async function getMyAssessments() {
    const res = await api.get('assessments/me')
    return res.data
}
