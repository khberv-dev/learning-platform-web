import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    activatePlan,
    createPlan,
    deactivatePlan,
    deletePlan,
    getPlans,
    updatePlan,
} from '@/services/plan/api.js';

export const usePlans = (courseId) => {
    return useQuery({
        queryKey: ['plan', 'list', courseId],
        queryFn: () => getPlans(courseId),
        enabled: Boolean(courseId),
    });
};

function usePlanMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['plan']}),
    });
}

export const useCreatePlan = () => usePlanMutation(createPlan);
export const useUpdatePlan = () => usePlanMutation(updatePlan);
export const useActivatePlan = () => usePlanMutation(activatePlan);
export const useDeactivatePlan = () => usePlanMutation(deactivatePlan);
export const useDeletePlan = () => usePlanMutation(deletePlan);
