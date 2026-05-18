import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {createAssessment, getMyAssessments} from "@/services/assessment/api.js";

export const useGetMyAssessments = () => useQuery({
    queryKey: ['assessment', 'me'],
    queryFn: getMyAssessments,
})

export const useCreateAssessment = () => useInfoMutation({
    queryKey: ['assessment'],
    mutationFn: (audio) => createAssessment(audio),
})
