import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {createEnrollment, getEnrollmentHistory} from "@/services/enrollment/api.js";

export const useCreateEnrollment = () => useInfoMutation({
    queryKey: ['enrollment'],
    mutationFn: (data) => createEnrollment(data),
})

export const useGetEnrollmentHistory = () => useQuery({
    queryKey: ['enrollment', 'history'],
    queryFn: getEnrollmentHistory,
})
