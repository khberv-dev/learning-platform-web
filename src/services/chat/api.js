import {api} from "@/services/api.js";

export const CHAT_FILE_MAX_BYTES = 50 * 1024 * 1024

export async function getChatRooms({page = 1, limit = 20} = {}) {
    const res = await api.get('chat/rooms', {params: {page, limit}})
    return res.data
}

export async function getChatRoom(roomId) {
    const res = await api.get(`chat/rooms/${roomId}`)
    return res.data
}

export async function getChatMessages(roomId, {page = 1, limit = 30} = {}) {
    const res = await api.get(`chat/rooms/${roomId}/messages`, {params: {page, limit}})
    return res.data
}

export async function sendChatText(roomId, text) {
    const res = await api.post(`chat/rooms/${roomId}/messages`, {text})
    return res.data
}

export async function sendChatFile(roomId, file) {
    if (file.size > CHAT_FILE_MAX_BYTES) {
        const mb = (file.size / (1024 * 1024)).toFixed(1)
        throw new Error(`File too large (${mb} MB). Max 50 MB.`)
    }
    const form = new FormData()
    form.append('file', file)
    const res = await api.post(`chat/rooms/${roomId}/messages/file`, form)
    return res.data
}
