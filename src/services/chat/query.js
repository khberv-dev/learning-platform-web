import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    getChatRooms, getChatRoom,
    getChatMessages, sendChatText, sendChatFile,
} from "@/services/chat/api.js";

export const useGetChatRooms = (params = {}) => useQuery({
    queryKey: ['chat', 'rooms', params.page ?? 1, params.limit ?? 20],
    queryFn: () => getChatRooms(params),
})

export const useGetChatRoom = (roomId) => useQuery({
    queryKey: ['chat', 'room', roomId],
    queryFn: () => getChatRoom(roomId),
    enabled: !!roomId,
})

export const useGetChatMessages = (roomId, params = {}) => useQuery({
    queryKey: ['chat', 'messages', roomId, params.page ?? 1, params.limit ?? 30],
    queryFn: () => getChatMessages(roomId, params),
    enabled: !!roomId,
})

export const useSendChatText = (opts) => useInfoMutation({
    queryKey: ['chat', 'rooms'],
    mutationFn: ({roomId, text}) => sendChatText(roomId, text),
    onSuccess: opts?.onSuccess,
})

export const useSendChatFile = (opts) => useInfoMutation({
    queryKey: ['chat', 'rooms'],
    mutationFn: ({roomId, file}) => sendChatFile(roomId, file),
    onSuccess: opts?.onSuccess,
})
