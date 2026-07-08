import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {listTasks, createTask, updateTask, uploadTaskFile, deleteTask} from "@/services/task/api.js";

export const useListTasks = (courseId, unitId, lessonId) => useQuery({
    queryKey: ['task', courseId, unitId, lessonId],
    queryFn: () => listTasks(courseId, unitId, lessonId),
    enabled: !!(courseId && unitId && lessonId),
})

export const useCreateTask = (opts) => useInfoMutation({
    queryKey: ['task'],
    mutationFn: ({courseId, unitId, lessonId, data}) => createTask(courseId, unitId, lessonId, data),
    onSuccess: opts?.onSuccess,
})

export const useUpdateTask = (opts) => useInfoMutation({
    queryKey: ['task'],
    mutationFn: ({courseId, unitId, lessonId, taskId, data}) => updateTask(courseId, unitId, lessonId, taskId, data),
    onSuccess: opts?.onSuccess,
})

export const useUploadTaskFile = (opts) => useInfoMutation({
    queryKey: ['task'],
    mutationFn: ({courseId, unitId, lessonId, taskId, file, onProgress}) => uploadTaskFile(courseId, unitId, lessonId, taskId, file, onProgress),
    onSuccess: opts?.onSuccess,
})

export const useDeleteTask = (opts) => useInfoMutation({
    queryKey: ['task'],
    mutationFn: ({courseId, unitId, lessonId, taskId}) => deleteTask(courseId, unitId, lessonId, taskId),
    onSuccess: opts?.onSuccess,
})
