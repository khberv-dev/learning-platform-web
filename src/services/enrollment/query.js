import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    acceptPendingEnrollment,
    createEnrollment,
    getEnrollmentProgress,
    getEnrollments,
    getPendingEnrollments,
    rejectPendingEnrollment,
} from '@/services/enrollment/api.js';

export const ENROLLMENT_STATUS = {
    CREATED: 'created',
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
};

// A queued request, not an enrollment - `created` is the only state an admin
// can act on, the other two are the outcome of that decision.
export const PENDING_ENROLLMENT_STATUS = {
    CREATED: 'created',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
};

export const ENROLLMENT_SORT_FIELDS = ['createdAt', 'updatedAt', 'start', 'status'];

export const useEnrollments = (params) => {
    return useQuery({
        queryKey: ['enrollment', 'list', params],
        queryFn: () => getEnrollments(params),
    });
};

export const useCreateEnrollment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createEnrollment,
        // A new enrollment shows up on the student's detail page and shifts the
        // dashboard counters, so both domains are invalidated alongside it.
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['enrollment']});
            queryClient.invalidateQueries({queryKey: ['student']});
            queryClient.invalidateQueries({queryKey: ['stats']});
        },
    });
};

export const useEnrollmentProgress = ({enrollmentId, studentId}) => {
    return useQuery({
        queryKey: ['enrollment', 'progress', enrollmentId, studentId],
        queryFn: () => getEnrollmentProgress({enrollmentId, studentId}),
        enabled: Boolean(enrollmentId && studentId),
    });
};

// Pending requests live under the enrollment domain rather than one of their
// own, so accepting one invalidates both lists with a single key.
export const usePendingEnrollments = (params) => {
    return useQuery({
        queryKey: ['enrollment', 'pending', params],
        queryFn: () => getPendingEnrollments(params),
    });
};

// Accepting opens an enrollment and a paid payment in one transaction, so it
// moves the same counters a manual enrollment does.
export const useAcceptPendingEnrollment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: acceptPendingEnrollment,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['enrollment']});
            queryClient.invalidateQueries({queryKey: ['payment']});
            queryClient.invalidateQueries({queryKey: ['student']});
            queryClient.invalidateQueries({queryKey: ['stats']});
        },
    });
};

// Rejecting creates neither an enrollment nor a payment - only the request row
// changes, so nothing outside the domain needs refetching.
export const useRejectPendingEnrollment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rejectPendingEnrollment,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['enrollment']}),
    });
};
