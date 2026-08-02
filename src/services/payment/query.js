import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    getPaymentTypes, getActivePaymentTypes, getPaymentType,
    createPaymentType, updatePaymentType, deletePaymentType,
    getPayments, getPayment, getMyPayments, createPayment, deletePayment,
} from "@/services/payment/api.js";

/* ---------- Payment types ---------- */

export const useGetPaymentTypes = () => useQuery({
    queryKey: ['payment-type', 'list'],
    queryFn: getPaymentTypes,
})

export const useGetActivePaymentTypes = () => useQuery({
    queryKey: ['payment-type', 'active'],
    queryFn: getActivePaymentTypes,
})

export const useGetPaymentType = (id) => useQuery({
    queryKey: ['payment-type', 'detail', id],
    queryFn: () => getPaymentType(id),
    enabled: !!id,
})

export const useCreatePaymentType = (opts) => useInfoMutation({
    queryKey: ['payment-type'],
    mutationFn: (data) => createPaymentType(data),
    onSuccess: opts?.onSuccess,
})

export const useUpdatePaymentType = (opts) => useInfoMutation({
    queryKey: ['payment-type'],
    mutationFn: ({id, data}) => updatePaymentType(id, data),
    onSuccess: opts?.onSuccess,
})

export const useDeletePaymentType = (opts) => useInfoMutation({
    queryKey: ['payment-type'],
    mutationFn: (id) => deletePaymentType(id),
    onSuccess: opts?.onSuccess,
})

/* ---------- Payments ---------- */

export const useGetPayments = (params = {}) => useQuery({
    queryKey: ['payment', 'list', params.page ?? 1, params.limit ?? 10, params.paymentTypeId ?? null],
    queryFn: () => getPayments(params),
})

export const useGetPayment = (id) => useQuery({
    queryKey: ['payment', 'detail', id],
    queryFn: () => getPayment(id),
    enabled: !!id,
})

export const useGetMyPayments = () => useQuery({
    queryKey: ['payment', 'me'],
    queryFn: getMyPayments,
})

export const useCreatePayment = (opts) => useInfoMutation({
    queryKey: ['payment'],
    mutationFn: (data) => createPayment(data),
    onSuccess: opts?.onSuccess,
})

export const useDeletePayment = (opts) => useInfoMutation({
    queryKey: ['payment'],
    mutationFn: (id) => deletePayment(id),
    onSuccess: opts?.onSuccess,
})
