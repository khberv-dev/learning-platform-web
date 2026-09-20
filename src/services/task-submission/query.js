import {useQuery} from '@tanstack/react-query';
import {getStudentLessonResults} from '@/services/task-submission/api.js';

export const useStudentLessonResults = ({studentId, lessonId}) => {
    return useQuery({
        queryKey: ['task-submission', 'lesson', studentId, lessonId],
        queryFn: () => getStudentLessonResults({studentId, lessonId}),
        enabled: Boolean(studentId && lessonId),
    });
};
