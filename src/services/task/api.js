import {api} from "@/services/api.js";

export async function listTasks(courseId, unitId, lessonId) {
    const res = await api.get(`courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks`)
    return res.data
}

export async function createTask(courseId, unitId, lessonId, data) {
    const res = await api.post(`admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks`, data)
    return res.data
}

export async function updateTask(courseId, unitId, lessonId, taskId, data) {
    const res = await api.patch(`admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${taskId}`, data)
    return res.data
}

export async function deleteTask(courseId, unitId, lessonId, taskId) {
    const res = await api.delete(`admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${taskId}`)
    return res.data
}
