import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    acceptAssignment,
    createAssignment,
    getAllAssignments,
    getAssignmentById,
    getPendingAssignments,
    rejectAssignment,
} from "@/services/assignment/api.js";

export const useGetAllAssignments = (status) => useQuery({
    queryKey: ['assignment', 'all', status ?? null],
    queryFn: () => getAllAssignments(status),
})

export const useGetAssignment = (id) => useQuery({
    queryKey: ['assignment', 'one', id],
    queryFn: () => getAssignmentById(id),
    enabled: !!id,
})

export const useGetPendingAssignments = () => useQuery({
    queryKey: ['assignment', 'pending'],
    queryFn: getPendingAssignments,
})

export const useAcceptAssignment = () => useInfoMutation({
    queryKey: ['assignment'],
    mutationFn: (id) => acceptAssignment(id),
})

export const useRejectAssignment = () => useInfoMutation({
    queryKey: ['assignment'],
    mutationFn: (id) => rejectAssignment(id),
})

export const useCreateAssignment = () => useInfoMutation({
    queryKey: ['assignment'],
    mutationFn: (data) => createAssignment(data),
})
