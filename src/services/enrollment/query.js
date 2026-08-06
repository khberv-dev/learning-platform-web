import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {getEnrollmentHistory, createEnrollment} from "@/services/enrollment/api.js";

export const useGetEnrollmentHistory = () => useQuery({
    queryKey: ['enrollment', 'history'],
    queryFn: getEnrollmentHistory,
})

export const useCreateEnrollment = (opts) => useInfoMutation({
    queryKey: ['enrollment'],
    mutationFn: (data) => createEnrollment(data),
    onSuccess: opts?.onSuccess,
    onError: opts?.onError,
})
