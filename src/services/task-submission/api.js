import {apiClient} from '@/services/api.js';

// Returns the authenticated student's saved answers for one task. Correct
// answer keys are intentionally not included by the API.
export async function getTaskSubmission(taskId) {
    const res = await apiClient.get(`task-submissions/${taskId}`);
    return res.data;
}

// Admin-side counterpart: one lesson's tasks with the answers a given student
// gave. Unlike the student route above it carries the answer key, so the page
// can show what was expected next to what was submitted. `studentId` is the
// Student entity id - the one `/admin/users/students/:id` carries.
export async function getStudentLessonResults({studentId, lessonId}) {
    const res = await apiClient.get(`task-submissions/students/${studentId}/lessons/${lessonId}`);
    return res.data;
}
