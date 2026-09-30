import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createMaterial, deleteMaterial, getMaterials} from '@/services/material/api.js';

export const useMaterials = (lessonId) => {
    return useQuery({
        queryKey: ['material', 'list', lessonId],
        queryFn: () => getMaterials({lessonId}),
        enabled: Boolean(lessonId),
    });
};

function useMaterialMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['material']}),
    });
}

export const useCreateMaterial = () => useMaterialMutation(createMaterial);
export const useDeleteMaterial = () => useMaterialMutation(deleteMaterial);
