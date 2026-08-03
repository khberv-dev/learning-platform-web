import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    getPaymentTypes, getPaymentType,
    createPaymentType, updatePaymentType, deletePaymentType,
    getPayments, getPayment, updatePaymentStatus, deletePayment,
    requestPayment, selectPaymentType, getMyPayments, getMyPayment,
} from "@/services/payment/api.js";

/* ---------- Payment types ---------- */

export const useGetPaymentTypes = () => useQuery({
    queryKey: ['payment-type', 'list'],
    queryFn: getPaymentTypes,
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

/* ---------- Payments (admin) ---------- */

export const useGetPayments = (params = {}) => useQuery({
    queryKey: [
        'payment', 'list',
        params.page ?? 1, params.limit ?? 10,
        params.userId ?? null, params.paymentTypeId ?? null,
        params.enrollmentId ?? null, params.planId ?? null,
        params.status ?? null,
    ],
    queryFn: () => getPayments(params),
})

export const useGetPayment = (id) => useQuery({
    queryKey: ['payment', 'detail', id],
    queryFn: () => getPayment(id),
    enabled: !!id,
})

/** status: 'paid' confirms the payment and activates its enrollment; 'cancelled' voids both. */
export const useUpdatePaymentStatus = (opts) => useInfoMutation({
    queryKey: ['payment'],
    mutationFn: ({id, ...data}) => updatePaymentStatus(id, data),
    onSuccess: opts?.onSuccess,
})

export const useDeletePayment = (opts) => useInfoMutation({
    queryKey: ['payment'],
    mutationFn: (id) => deletePayment(id),
    onSuccess: opts?.onSuccess,
})

/* ---------- Payments (student) ---------- */

export const useRequestPayment = (opts) => useInfoMutation({
    queryKey: ['payment'],
    mutationFn: (planId) => requestPayment(planId),
    onSuccess: opts?.onSuccess,
})

export const useSelectPaymentType = (opts) => useInfoMutation({
    queryKey: ['payment'],
    mutationFn: ({paymentId, paymentTypeId}) => selectPaymentType(paymentId, paymentTypeId),
    onSuccess: opts?.onSuccess,
})

export const useGetMyPayments = (params = {}) => useQuery({
    queryKey: ['payment', 'me', params.page ?? 1, params.limit ?? 10],
    queryFn: () => getMyPayments(params),
})

export const useGetMyPayment = (id) => useQuery({
    queryKey: ['payment', 'me', 'detail', id],
    queryFn: () => getMyPayment(id),
    enabled: !!id,
})
