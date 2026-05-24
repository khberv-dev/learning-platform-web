import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {getMe, uploadAvatar} from "@/services/user/api.js";

export const useGetMe = () => useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    enabled: !!localStorage.getItem('access_token'),
})

export const useUploadAvatar = (opts) => useInfoMutation({
    queryKey: ['user'],
    mutationFn: (file) => uploadAvatar(file),
    onSuccess: opts?.onSuccess,
})
