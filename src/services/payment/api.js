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

/* ---------- Payment types ---------- */

export async function getPaymentTypes() {
    const res = await api.get('admin/payment-types')
    return res.data
}

export async function getActivePaymentTypes() {
    const res = await api.get('payment-types')
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

/* ---------- Payments ---------- */

export async function getPayments({page = 1, limit = 10, paymentTypeId} = {}) {
    const res = await api.get('admin/payments', {params: {page, limit, paymentTypeId: paymentTypeId || undefined}})
    return res.data
}

export async function getPayment(id) {
    const res = await api.get(`admin/payments/${id}`)
    return res.data
}

export async function getMyPayments() {
    const res = await api.get('payments/me')
    return res.data
}

export async function createPayment(data) {
    const res = await api.post('payments', data)
    return res.data
}

export async function deletePayment(id) {
    const res = await api.delete(`admin/payments/${id}`)
    return res.data
}
