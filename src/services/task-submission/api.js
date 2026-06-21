import {api} from "@/services/api.js";

export async function submitTasks(answers) {
    const res = await api.post('task-submissions', answers)
    return res.data
}

export async function getLessonTaskResults(lessonId) {
    const res = await api.get(`task-submissions/lessons/${lessonId}`)
    return res.data
}
