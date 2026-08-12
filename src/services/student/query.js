import {useQuery} from '@tanstack/react-query';
import {getStudent, getStudents} from '@/services/student/api.js';

export const useStudents = (params) => {
    return useQuery({
        queryKey: ['student', 'list', params],
        queryFn: () => getStudents(params),
    });
};

export const useStudent = (id) => {
    return useQuery({
        queryKey: ['student', 'detail', id],
        queryFn: () => getStudent(id),
        enabled: Boolean(id),
    });
};
