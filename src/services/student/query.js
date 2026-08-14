import {useQuery} from '@tanstack/react-query';
import {getStudent, getStudents} from '@/services/student/api.js';

// The API's StudentLevel enum, uppercase on the wire.
export const STUDENT_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Whitelisted server-side; anything else is rejected rather than reaching SQL.
export const STUDENT_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'points',
    'coins',
    'balance',
    'level',
    'firstName',
    'lastName',
];

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
