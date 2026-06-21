import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {uploadLiveSession, getMyLiveSessions, getLiveSessionsByEnrollment, getLiveSession} from "@/services/live-session/api.js";

export const useUploadLiveSession = (opts) => useInfoMutation({
    queryKey: ['live-session'],
    mutationFn: ({enrollmentId, title, file}) => uploadLiveSession(enrollmentId, {title, file}),
    onSuccess: opts?.onSuccess,
})

export const useGetMyLiveSessions = () => useQuery({
    queryKey: ['live-session', 'my'],
    queryFn: () => getMyLiveSessions(),
})

export const useGetLiveSessionsByEnrollment = (enrollmentId) => useQuery({
    queryKey: ['live-session', 'by-enrollment', enrollmentId],
    queryFn: () => getLiveSessionsByEnrollment(enrollmentId),
    enabled: !!enrollmentId,
})

export const useGetLiveSession = (id) => useQuery({
    queryKey: ['live-session', 'detail', id],
    queryFn: () => getLiveSession(id),
    enabled: !!id,
})
