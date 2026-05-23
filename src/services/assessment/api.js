import {api} from "@/services/api.js";

export async function createAssessment(file) {
    const form = new FormData()
    form.append('audio', file)
    const res = await api.post('assessments', form)
    return res.data
}

export async function getMyAssessments() {
    const res = await api.get('assessments/me')
    return res.data
}
