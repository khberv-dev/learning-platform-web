import {api} from "@/services/api.js";

export async function createConversation() {
    const res = await api.post('assessments/conversations')
    return res.data
}

export async function listConversations({page = 1, limit = 10} = {}) {
    const res = await api.get('assessments/conversations', {params: {page, limit}})
    return res.data
}

export async function getConversation(id) {
    const res = await api.get(`assessments/conversations/${id}`)
    return res.data
}

export async function sendTurn(conversationId, audioFile) {
    const form = new FormData()
    form.append('audio', audioFile)
    const res = await api.post(`assessments/conversations/${conversationId}/messages`, form)
    return res.data
}
