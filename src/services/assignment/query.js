import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    acceptAssignment,
    getAssignment,
    getAssignmentHistory,
    getAssignments,
    getPendingAssignments,
    rejectAssignment,
} from '@/services/assignment/api.js';

export const ASSIGNMENT_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    REJECTED: 'rejected',
};

export const useAssignments = (params) => {
    return useQuery({
        queryKey: ['assignment', 'list', params],
        queryFn: () => getAssignments(params),
    });
};

export const useAssignment = (id) => {
    return useQuery({
        queryKey: ['assignment', 'detail', id],
        queryFn: () => getAssignment(id),
        enabled: Boolean(id),
    });
};

export const usePendingAssignments = () => {
    return useQuery({
        queryKey: ['assignment', 'pending'],
        queryFn: getPendingAssignments,
    });
};

export const useAssignmentHistory = (params) => {
    return useQuery({
        queryKey: ['assignment', 'history', params],
        queryFn: () => getAssignmentHistory(params),
    });
};

// Accepting or rejecting moves a row out of the pending queue and into history,
// and changes the mentor dashboard's pending count - so the mentor summary is
// invalidated alongside the assignment domain.
function useAssignmentDecision(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['assignment']});
            queryClient.invalidateQueries({queryKey: ['mentor', 'me']});
        },
    });
}

export const useAcceptAssignment = () => useAssignmentDecision(acceptAssignment);
export const useRejectAssignment = () => useAssignmentDecision(rejectAssignment);
