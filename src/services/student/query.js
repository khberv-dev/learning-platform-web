import {useQuery} from "@tanstack/react-query";
import {getStudentMe} from "@/services/student/api.js";

export const useGetStudentMe = () => useQuery({
    queryKey: ['student', 'me'],
    queryFn: getStudentMe,
})
