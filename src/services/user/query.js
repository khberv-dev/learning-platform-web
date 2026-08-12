import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getMe, updateMyAvatar} from '@/services/user/api.js';

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMe,
    });
};

export const useUpdateMyAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateMyAvatar,
        // The endpoint returns the updated user, so seed the cache from the
        // response rather than paying for a second user/me round-trip.
        onSuccess: (data) => queryClient.setQueryData(['me'], data),
    });
};
