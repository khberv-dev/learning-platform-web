import {api} from "@/services/api.js";

export async function signIn(data) {
    const res = await api.post('auth/sign-in', data)
    return res.data
}

export async function signUp(data) {
    const res = await api.post('auth/sign-up', data)
    return res.data
}
