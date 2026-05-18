import {useQuery} from "@tanstack/react-query";
import {getMe} from "@/services/user/api.js";

export const useGetMe = () => useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('access_token'),
    staleTime: 60_000,
})
