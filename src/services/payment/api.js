import {apiClient} from '@/services/api.js';

// Read-only for admins by design: payment status changes only through the Click
// webhooks. There is deliberately no approve/reject/delete endpoint - a cash or
// transfer sale is recorded by opening an enrollment directly instead.
export async function getPayments({page = 1, limit = 15, status, userId} = {}) {
    const res = await apiClient.get('admin/payments', {
        params: {page, limit, status: status || undefined, userId: userId || undefined},
    });
    return res.data;
}

export async function getPayment(id) {
    const res = await apiClient.get(`admin/payments/${id}`);
    return res.data;
}
