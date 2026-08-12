import {apiClient} from '@/services/api.js';

// REST covers history and sending; the socket (see socket.js) covers live
// delivery. The POST endpoints also broadcast over the socket server-side, so
// a sent message arrives back through both paths - the message list dedupes
// by id.

export async function getChatRooms({page = 1, limit = 20} = {}) {
    const res = await apiClient.get('chat/rooms', {params: {page, limit}});
    return res.data;
}

export async function getChatRoom(id) {
    const res = await apiClient.get(`chat/rooms/${id}`);
    return res.data;
}

export async function getChatMessages({roomId, page = 1, limit = 30}) {
    const res = await apiClient.get(`chat/rooms/${roomId}/messages`, {params: {page, limit}});
    return res.data;
}

export async function sendChatMessage({roomId, text}) {
    const res = await apiClient.post(`chat/rooms/${roomId}/messages`, {text});
    return res.data;
}

export async function sendChatFile({roomId, file}) {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post(`chat/rooms/${roomId}/messages/file`, form);
    return res.data;
}
