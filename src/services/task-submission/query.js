import {useQuery} from '@tanstack/react-query';
import {getStudentLessonResults, getTaskSubmission} from '@/services/task-submission/api.js';

export const useTaskSubmission = (taskId) => {
    return useQuery({
        queryKey: ['task-submission', 'detail', taskId],
        queryFn: () => getTaskSubmission(taskId),
        enabled: Boolean(taskId),
    });
};

export const useStudentLessonResults = ({studentId, lessonId}) => {
    return useQuery({
        queryKey: ['task-submission', 'lesson', studentId, lessonId],
        queryFn: () => getStudentLessonResults({studentId, lessonId}),
        enabled: Boolean(studentId && lessonId),
    });
};
