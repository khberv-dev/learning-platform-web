import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    assignAssignmentMentor,
    getAssignment,
    getAssignments,
    getMyAssignments,
} from '@/services/assignment/api.js';

export const ASSIGNMENT_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
};

export const useAssignments = (params, {enabled = true} = {}) => {
    return useQuery({
        queryKey: ['assignment', 'list', params],
        queryFn: () => getAssignments(params),
        enabled,
    });
};

export const useAssignment = (id) => {
    return useQuery({
        queryKey: ['assignment', 'detail', id],
        queryFn: () => getAssignment(id),
        enabled: Boolean(id),
    });
};

export const useMyAssignments = (params) => {
    return useQuery({
        queryKey: ['assignment', 'me', params],
        queryFn: () => getMyAssignments(params),
    });
};

// A reassignment moves the row between lists filtered by status and by mentor,
// so the whole domain is refreshed.
export const useAssignAssignmentMentor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assignAssignmentMentor,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['assignment']}),
    });
};
