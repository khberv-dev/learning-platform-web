import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {createConversation, listConversations, getConversation, sendTurn} from "@/services/assessment/api.js";

export const useCreateConversation = (opts) => useInfoMutation({
    queryKey: ['assessment', 'conversations'],
    mutationFn: () => createConversation(),
    onSuccess: opts?.onSuccess,
})

export const useListConversations = (params = {}) => useQuery({
    queryKey: ['assessment', 'conversations', params.page ?? 1, params.limit ?? 10],
    queryFn: () => listConversations(params),
})

export const useGetConversation = (id) => useQuery({
    queryKey: ['assessment', 'conversation', id],
    queryFn: () => getConversation(id),
    enabled: !!id,
})

export const useSendTurn = (opts) => useInfoMutation({
    mutationFn: ({conversationId, audioFile}) => sendTurn(conversationId, audioFile),
    onSuccess: opts?.onSuccess,
})
