import {useQuery} from '@tanstack/react-query';
import {getPayment, getPayments} from '@/services/payment/api.js';

export const PAYMENT_STATUS = {
    CREATED: 'created',
    PAID: 'paid',
    CANCELLED: 'cancelled',
};

export const usePayments = (params) => {
    return useQuery({
        queryKey: ['payment', 'list', params],
        queryFn: () => getPayments(params),
    });
};

export const usePayment = (id) => {
    return useQuery({
        queryKey: ['payment', 'detail', id],
        queryFn: () => getPayment(id),
        enabled: Boolean(id),
    });
};
