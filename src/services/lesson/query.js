import {useInfoMutation} from "@/services/query.js";
import {createLesson, deleteLesson, updateLesson} from "@/services/lesson/api.js";

export const useCreateLesson = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, dto, media}) => createLesson(courseId, unitId, dto, media),
})

export const useUpdateLesson = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, lessonId, dto}) => updateLesson(courseId, unitId, lessonId, dto),
})

export const useDeleteLesson = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, lessonId}) => deleteLesson(courseId, unitId, lessonId),
})
