import {api} from "@/services/api.js";

export async function getMe() {
    const res = await api.get('user/me')
    return res.data
}
