import {useInfoMutation} from "@/services/query.js";
import {signIn, signUp} from "@/services/auth/api.js";

const persistTokens = (data) => {
    localStorage.setItem('access_token', data.accessToken)
    localStorage.setItem('refresh_token', data.refreshToken)
}

export const useSignIn = () => useInfoMutation({
    queryKey: ['user'],
    mutationFn: (data) => signIn(data),
    onSuccess: persistTokens,
})

export const useSignUp = () => useInfoMutation({
    queryKey: ['user'],
    mutationFn: (data) => signUp(data),
    onSuccess: persistTokens,
})
