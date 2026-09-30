import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createAuthor, deleteAuthor, getAuthor, getAuthors, updateAuthor} from '@/services/author/api.js';

export const GENDER = {
    MALE: 'male',
    FEMALE: 'female',
};

export const useAuthors = (params) => {
    return useQuery({
        queryKey: ['author', 'list', params],
        queryFn: () => getAuthors(params),
    });
};

export const useAuthor = (id) => {
    return useQuery({
        queryKey: ['author', 'detail', id],
        queryFn: () => getAuthor(id),
        enabled: Boolean(id),
    });
};

// A course detail embeds its authors, so an author edit or delete has to
// refresh courses too.
function useAuthorMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['author']});
            queryClient.invalidateQueries({queryKey: ['course']});
        },
    });
}

export const useCreateAuthor = () => useAuthorMutation(createAuthor);
export const useUpdateAuthor = () => useAuthorMutation(updateAuthor);
export const useDeleteAuthor = () => useAuthorMutation(deleteAuthor);
