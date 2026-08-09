import {api} from "@/services/api.js";

function asForm(payload, fileField = 'icon') {
    const form = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
        if (k === fileField) return
        if (v === undefined || v === null) return
        form.append(k, typeof v === 'boolean' ? String(v) : v)
    })
    if (payload?.[fileField] instanceof File) {
        form.append(fileField, payload[fileField])
    }
    return form
}

/* ---------- Payment types (admin) ---------- */

export async function getPaymentTypes() {
    const res = await api.get('admin/payment-types')
    return res.data
}

export async function getPaymentType(id) {
    const res = await api.get(`admin/payment-types/${id}`)
    return res.data
}

export async function createPaymentType(data) {
    const res = await api.post('admin/payment-types', asForm(data, 'icon'))
    return res.data
}

export async function updatePaymentType(id, data) {
    const res = await api.patch(`admin/payment-types/${id}`, asForm(data, 'icon'))
    return res.data
}

export async function deletePaymentType(id) {
    const res = await api.delete(`admin/payment-types/${id}`)
    return res.data
}

/* ---------- Payments (admin, read-only) ----------
 * Payment status changes only through the Click webhooks — there is no approve,
 * reject or delete endpoint. For cash or transfer, enroll the student directly
 * with createEnrollment() instead.
 */

export async function getPayments({page = 1, limit = 10, userId, paymentTypeId, enrollmentId, planId, status} = {}) {
    const res = await api.get('admin/payments', {
        params: {
            page,
            limit,
            userId: userId || undefined,
            paymentTypeId: paymentTypeId || undefined,
            enrollmentId: enrollmentId || undefined,
            planId: planId || undefined,
            status: status || undefined,
        },
    })
    return res.data
}

export async function getPayment(id) {
    const res = await api.get(`admin/payments/${id}`)
    return res.data
}

/* ---------- Payments (student) ---------- */

/** Opens a pending enrollment + payment for a plan and returns {payment, paymentTypes}. */
export async function requestPayment(planId) {
    const res = await api.post('payments/request', {planId})
    return res.data
}

export async function selectPaymentType(paymentId, paymentTypeId) {
    const res = await api.patch(`payments/${paymentId}/payment-type`, {paymentTypeId})
    return res.data
}

export async function getMyPayments({page = 1, limit = 10} = {}) {
    const res = await api.get('payments/me', {params: {page, limit}})
    return res.data
}

export async function getMyPayment(id) {
    const res = await api.get(`payments/${id}`)
    return res.data
}
