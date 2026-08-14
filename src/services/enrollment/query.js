import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createEnrollment, getEnrollments} from '@/services/enrollment/api.js';

export const ENROLLMENT_STATUS = {
    CREATED: 'created',
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
};

export const ENROLLMENT_SORT_FIELDS = ['createdAt', 'updatedAt', 'start', 'end', 'status'];

// The list response carries no computed expiry flag, so it is derived from the
// term. Mirrors the server's own filter: an *active* enrollment whose `end` is
// in the past. `created` and `cancelled` rows have no meaningful term.
export function isEnrollmentExpired(enrollment, now = new Date()) {
    if (enrollment?.status !== ENROLLMENT_STATUS.ACTIVE || !enrollment.end) return false;
    return new Date(enrollment.end) < now;
}

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
