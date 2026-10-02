import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createAdmin, getAdmins, updateAdmin} from '@/services/admin/api.js';

export const useAdmins = (params) => {
    return useQuery({
        queryKey: ['admin', 'list', params],
        queryFn: () => getAdmins(params),
    });
};

// `me` is refreshed too: a superadmin may be editing their own row (name,
// email), and the sidebar shows it.
function useAdminMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin']});
            queryClient.invalidateQueries({queryKey: ['me']});
        },
    });
}

export const useCreateAdmin = () => useAdminMutation(createAdmin);
export const useUpdateAdmin = () => useAdminMutation(updateAdmin);
