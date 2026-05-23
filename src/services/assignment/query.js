import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    createAssignment, getPendingAssignments, acceptAssignment, rejectAssignment,
    getAssignments, getAssignment, getTeacherAssignmentHistory,
} from "@/services/assignment/api.js";

export const useGetPendingAssignments = () => useQuery({
    queryKey: ['assignment', 'pending'],
    queryFn: getPendingAssignments,
})

export const useGetTeacherAssignmentHistory = (params = {}) => useQuery({
    queryKey: ['assignment', 'history', params.page ?? 1, params.limit ?? 10],
    queryFn: () => getTeacherAssignmentHistory(params),
})

export const useGetAssignments = (params = {}) => useQuery({
    queryKey: ['assignment', 'list', params.status],
    queryFn: () => getAssignments(params),
})

export const useGetAssignment = (id) => useQuery({
    queryKey: ['assignment', 'detail', id],
    queryFn: () => getAssignment(id),
    enabled: !!id,
})

export const useCreateAssignment = (opts) => useInfoMutation({
    queryKey: ['assignment'],
    mutationFn: (data) => createAssignment(data),
    onSuccess: opts?.onSuccess,
})

export const useAcceptAssignment = (opts) => useInfoMutation({
    queryKey: ['assignment'],
    mutationFn: (id) => acceptAssignment(id),
    onSuccess: opts?.onSuccess,
})

export const useRejectAssignment = (opts) => useInfoMutation({
    queryKey: ['assignment'],
    mutationFn: (id) => rejectAssignment(id),
    onSuccess: opts?.onSuccess,
})
