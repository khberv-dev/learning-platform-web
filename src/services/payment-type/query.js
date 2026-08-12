import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    createPaymentType,
    deletePaymentType,
    getPaymentTypes,
    updatePaymentType,
} from '@/services/payment-type/api.js';

export const usePaymentTypes = () => {
    return useQuery({
        queryKey: ['payment-type', 'list'],
        queryFn: getPaymentTypes,
    });
};

function usePaymentTypeMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['payment-type']}),
    });
}

export const useCreatePaymentType = () => usePaymentTypeMutation(createPaymentType);
export const useUpdatePaymentType = () => usePaymentTypeMutation(updatePaymentType);
export const useDeletePaymentType = () => usePaymentTypeMutation(deletePaymentType);
