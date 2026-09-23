import {apiClient} from '@/services/api.js';

function asForm(payload, icon) {
    const form = new FormData();

    Object.entries(payload ?? {}).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        form.append(key, typeof value === 'boolean' ? String(value) : value);
    });

    if (icon) form.append('icon', icon);

    return form;
}

// Paginated; 100 is the API's own cap on `limit` and comfortably covers every
// payment type in one request - the list page has no pagination UI.
export async function getPaymentTypes({page = 1, limit = 100} = {}) {
    const res = await apiClient.get('admin/payment-types', {params: {page, limit}});
    return res.data;
}

export async function createPaymentType({icon, onUploadProgress, ...payload}) {
    const res = await apiClient.post('admin/payment-types', asForm(payload, icon), {onUploadProgress});
    return res.data;
}

export async function updatePaymentType({id, icon, onUploadProgress, ...payload}) {
    const res = await apiClient.patch(`admin/payment-types/${id}`, asForm(payload, icon), {onUploadProgress});
    return res.data;
}

export async function deletePaymentType(id) {
    await apiClient.delete(`admin/payment-types/${id}`);
}
