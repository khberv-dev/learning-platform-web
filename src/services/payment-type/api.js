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

export async function getPaymentTypes() {
    const res = await apiClient.get('admin/payment-types');
    return res.data;
}

export async function createPaymentType({icon, ...payload}) {
    const res = await apiClient.post('admin/payment-types', asForm(payload, icon));
    return res.data;
}

export async function updatePaymentType({id, icon, ...payload}) {
    const res = await apiClient.patch(`admin/payment-types/${id}`, asForm(payload, icon));
    return res.data;
}

export async function deletePaymentType(id) {
    await apiClient.delete(`admin/payment-types/${id}`);
}
