import {useQuery} from "@tanstack/react-query";
import {getMyStudent, getStudents} from "@/services/student/api.js";

export const useGetMyStudent = () => useQuery({
    queryKey: ['student', 'me'],
    queryFn: getMyStudent,
})

export const useGetStudents = (params = {}) => useQuery({
    queryKey: ['student', 'list', params.page ?? 1, params.limit ?? 10],
    queryFn: () => getStudents(params),
})
