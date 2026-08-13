import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    addTaskQuestion,
    createCourse,
    createLesson,
    createTask,
    deleteTaskQuestion,
    updateTaskQuestion,
    createUnit,
    deleteCourse,
    deleteLesson,
    deleteTask,
    deleteUnit,
    getCourse,
    getCourses,
    getLessons,
    getTasks,
    updateCourse,
    updateLesson,
    updateTask,
    updateUnit,
    uploadLessonMedia,
    uploadTaskFile,
} from '@/services/course/api.js';

export const TASK_CONTENT_TYPE = {
    AUDIO: 'audio',
    TEXT: 'text',
    PICTURE: 'picture',
};

export const useCourses = () => {
    return useQuery({
        queryKey: ['course', 'list'],
        queryFn: getCourses,
    });
};

export const useCourse = (id) => {
    return useQuery({
        queryKey: ['course', 'detail', id],
        queryFn: () => getCourse(id),
        enabled: Boolean(id),
    });
};

// Fetched per unit, only once its row is expanded - the course payload no
// longer embeds lessons, and a course with many units would otherwise fan out
// into one request per unit on load.
export const useLessons = ({courseId, unitId, enabled = true}) => {
    return useQuery({
        queryKey: ['course', 'lessons', courseId, unitId],
        queryFn: () => getLessons({courseId, unitId}),
        enabled: enabled && Boolean(courseId && unitId),
    });
};

export const useTasks = ({courseId, unitId, lessonId}) => {
    return useQuery({
        queryKey: ['course', 'tasks', courseId, unitId, lessonId],
        queryFn: () => getTasks({courseId, unitId, lessonId}),
        enabled: Boolean(courseId && unitId && lessonId),
    });
};

// The API exposes no "get one unit/lesson/task" route, so the detail pages
// pick their entity out of the parent list. `select` runs against the same
// cache entry as the list hook above, so opening a detail page reuses whatever
// the list already fetched instead of issuing its own request.

export const useUnit = ({courseId, unitId}) => {
    return useQuery({
        queryKey: ['course', 'detail', courseId],
        queryFn: () => getCourse(courseId),
        enabled: Boolean(courseId && unitId),
        select: (course) => course.units?.find((unit) => unit.id === unitId) ?? null,
    });
};

export const useLesson = ({courseId, unitId, lessonId}) => {
    return useQuery({
        queryKey: ['course', 'lessons', courseId, unitId],
        queryFn: () => getLessons({courseId, unitId}),
        enabled: Boolean(courseId && unitId && lessonId),
        select: (lessons) => lessons.find((lesson) => lesson.id === lessonId) ?? null,
    });
};

export const useTask = ({courseId, unitId, lessonId, taskId}) => {
    return useQuery({
        queryKey: ['course', 'tasks', courseId, unitId, lessonId],
        queryFn: () => getTasks({courseId, unitId, lessonId}),
        enabled: Boolean(courseId && unitId && lessonId && taskId),
        select: (tasks) => tasks.find((task) => task.id === taskId) ?? null,
    });
};

// Courses, units, lessons and tasks are separate queries but one dependent
// tree: adding a lesson changes its unit's `lessonsCount` on the course detail
// and the list's totals too. Invalidating the `['course']` prefix wholesale
// refreshes every level rather than trying to patch one branch.
function useCourseMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['course']}),
    });
}

export const useCreateCourse = () => useCourseMutation(createCourse);
export const useUpdateCourse = () => useCourseMutation(updateCourse);
export const useDeleteCourse = () => useCourseMutation(deleteCourse);

export const useCreateUnit = () => useCourseMutation(createUnit);
export const useUpdateUnit = () => useCourseMutation(updateUnit);
export const useDeleteUnit = () => useCourseMutation(deleteUnit);

export const useCreateLesson = () => useCourseMutation(createLesson);
export const useUpdateLesson = () => useCourseMutation(updateLesson);
export const useUploadLessonMedia = () => useCourseMutation(uploadLessonMedia);
export const useDeleteLesson = () => useCourseMutation(deleteLesson);

export const useCreateTask = () => useCourseMutation(createTask);
export const useAddTaskQuestion = () => useCourseMutation(addTaskQuestion);
export const useUpdateTaskQuestion = () => useCourseMutation(updateTaskQuestion);
export const useDeleteTaskQuestion = () => useCourseMutation(deleteTaskQuestion);
export const useUpdateTask = () => useCourseMutation(updateTask);
export const useUploadTaskFile = () => useCourseMutation(uploadTaskFile);
export const useDeleteTask = () => useCourseMutation(deleteTask);
