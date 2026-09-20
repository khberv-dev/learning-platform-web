import {apiClient} from '@/services/api.js';

// One lesson's tasks with the answers a given student
// gave. Unlike the student-facing routes it carries the answer key, so the page
// can show what was expected next to what was submitted. `studentId` is the
// Student entity id - the one `/admin/users/students/:id` carries.
export async function getStudentLessonResults({studentId, lessonId}) {
    const res = await apiClient.get(`admin/task-submissions/students/${studentId}/lessons/${lessonId}`);
    return res.data;
}
