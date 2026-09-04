import {apiClient} from '@/services/api.js';

// Returns the authenticated student's saved answers for one task. Correct
// answer keys are intentionally not included by the API.
export async function getTaskSubmission(taskId) {
    const res = await apiClient.get(`task-submissions/${taskId}`);
    return res.data;
}