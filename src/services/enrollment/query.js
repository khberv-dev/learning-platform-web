import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createEnrollment} from '@/services/enrollment/api.js';

export const ENROLLMENT_STATUS = {
    CREATED: 'created',
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
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
