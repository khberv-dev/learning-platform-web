import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    getChatMessages,
    getChatRoom,
    getChatRooms,
    sendChatFile,
    sendChatMessage,
} from '@/services/chat/api.js';

export const useChatRooms = (params) => {
    return useQuery({
        queryKey: ['chat', 'rooms', params],
        queryFn: () => getChatRooms(params),
    });
};

export const useChatRoom = (id) => {
    return useQuery({
        queryKey: ['chat', 'room', id],
        queryFn: () => getChatRoom(id),
        enabled: Boolean(id),
    });
};

export const useChatMessages = ({roomId, page = 1, limit = 30}) => {
    return useQuery({
        queryKey: ['chat', 'messages', roomId, page, limit],
        queryFn: () => getChatMessages({roomId, page, limit}),
        enabled: Boolean(roomId),
    });
};

// Sending doesn't invalidate the message list: the server broadcasts the saved
// message over the socket, and the page appends it from there. Invalidating
// would refetch the whole page of history for every keystroke-sized message.
function useSendMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        // The room list shows a last-message preview and ordering, so that
        // alone is worth refreshing.
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['chat', 'rooms']}),
    });
}

export const useSendChatMessage = () => useSendMutation(sendChatMessage);
export const useSendChatFile = () => useSendMutation(sendChatFile);
