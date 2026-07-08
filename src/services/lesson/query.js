import {useInfoMutation} from "@/services/query.js";
import {createLesson, updateLesson, uploadLessonMedia, deleteLesson} from "@/services/lesson/api.js";

export const useCreateLesson = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, data}) => createLesson(courseId, unitId, data),
    onSuccess: opts?.onSuccess,
})

export const useUpdateLesson = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, lessonId, data}) => updateLesson(courseId, unitId, lessonId, data),
    onSuccess: opts?.onSuccess,
})

export const useUploadLessonMedia = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, lessonId, file, onProgress}) => uploadLessonMedia(courseId, unitId, lessonId, file, onProgress),
    onSuccess: opts?.onSuccess,
})

export const useDeleteLesson = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, lessonId}) => deleteLesson(courseId, unitId, lessonId),
    onSuccess: opts?.onSuccess,
})
