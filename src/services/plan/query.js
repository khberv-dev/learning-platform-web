import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    getPlans, getActivePlans, getPlan,
    createPlan, updatePlan, setPlanActive, deletePlan,
} from "@/services/plan/api.js";

export const useGetPlans = (courseId) => useQuery({
    queryKey: ['plan', 'list', courseId],
    queryFn: () => getPlans(courseId),
    enabled: !!courseId,
})

export const useGetActivePlans = (courseId) => useQuery({
    queryKey: ['plan', 'active', courseId],
    queryFn: () => getActivePlans(courseId),
    enabled: !!courseId,
})

export const useGetPlan = (courseId, planId) => useQuery({
    queryKey: ['plan', 'detail', courseId, planId],
    queryFn: () => getPlan(courseId, planId),
    enabled: !!courseId && !!planId,
})

export const useCreatePlan = (opts) => useInfoMutation({
    queryKey: ['plan'],
    mutationFn: ({courseId, data}) => createPlan(courseId, data),
    onSuccess: opts?.onSuccess,
})

export const useUpdatePlan = (opts) => useInfoMutation({
    queryKey: ['plan'],
    mutationFn: ({courseId, planId, data}) => updatePlan(courseId, planId, data),
    onSuccess: opts?.onSuccess,
})

export const useSetPlanActive = (opts) => useInfoMutation({
    queryKey: ['plan'],
    mutationFn: ({courseId, planId, isActive}) => setPlanActive(courseId, planId, isActive),
    onSuccess: opts?.onSuccess,
})

export const useDeletePlan = (opts) => useInfoMutation({
    queryKey: ['plan'],
    mutationFn: ({courseId, planId}) => deletePlan(courseId, planId),
    onSuccess: opts?.onSuccess,
})
