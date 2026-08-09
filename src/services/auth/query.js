import {useInfoMutation} from "@/services/query.js";
import {signIn, signUp, sendOtp, recoverPassword} from "@/services/auth/api.js";

const persistTokens = (data) => {
    if (data?.accessToken) localStorage.setItem('access_token', data.accessToken)
    if (data?.refreshToken) localStorage.setItem('refresh_token', data.refreshToken)
}

export const useSignIn = (opts) => useInfoMutation({
    queryKey: ['user'],
    mutationFn: (data) => signIn(data),
    onSuccess: (data) => {
        persistTokens(data)
        opts?.onSuccess?.(data)
    },
})

export const useSignUp = (opts) => useInfoMutation({
    queryKey: ['user'],
    mutationFn: (data) => signUp(data),
    onSuccess: (data) => {
        persistTokens(data)
        opts?.onSuccess?.(data)
    },
})

export const useSendOtp = (opts) => useInfoMutation({
    mutationFn: (phoneNumber) => sendOtp(phoneNumber),
    onSuccess: opts?.onSuccess,
    onError: opts?.onError,
})

export const useRecoverPassword = (opts) => useInfoMutation({
    mutationFn: (data) => recoverPassword(data),
    onSuccess: opts?.onSuccess,
})
