import {apiClient} from '@/services/api.js';

// Plans hang off a course - a course has no price of its own, the plan carries
// `price`, `month` (duration) and `hasMentor`.

export async function getPlans(courseId) {
    const res = await apiClient.get(`admin/courses/${courseId}/plans`);
    return res.data;
}

export async function createPlan({courseId, ...payload}) {
    const res = await apiClient.post(`admin/courses/${courseId}/plans`, payload);
    return res.data;
}

export async function updatePlan({courseId, planId, ...payload}) {
    const res = await apiClient.patch(`admin/courses/${courseId}/plans/${planId}`, payload);
    return res.data;
}

export async function activatePlan({courseId, planId}) {
    const res = await apiClient.patch(`admin/courses/${courseId}/plans/${planId}/activate`);
    return res.data;
}

export async function deactivatePlan({courseId, planId}) {
    const res = await apiClient.patch(`admin/courses/${courseId}/plans/${planId}/deactivate`);
    return res.data;
}

export async function deletePlan({courseId, planId}) {
    await apiClient.delete(`admin/courses/${courseId}/plans/${planId}`);
}
