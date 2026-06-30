import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {uploadLiveSession, getMyLiveSessions, getLiveSessionsByAssignment, getLiveSession} from "@/services/live-session/api.js";

export const useUploadLiveSession = (opts) => useInfoMutation({
    queryKey: ['live-session'],
    mutationFn: ({assignmentId, title, file}) => uploadLiveSession(assignmentId, {title, file}),
    onSuccess: opts?.onSuccess,
})

export const useGetMyLiveSessions = () => useQuery({
    queryKey: ['live-session', 'my'],
    queryFn: () => getMyLiveSessions(),
})

export const useGetLiveSessionsByAssignment = (assignmentId) => useQuery({
    queryKey: ['live-session', 'by-assignment', assignmentId],
    queryFn: () => getLiveSessionsByAssignment(assignmentId),
    enabled: !!assignmentId,
})

export const useGetLiveSession = (id) => useQuery({
    queryKey: ['live-session', 'detail', id],
    queryFn: () => getLiveSession(id),
    enabled: !!id,
})
