import {api} from "@/services/api.js";

export async function getMe() {
    const res = await api.get('user/me')
    return res.data
}

export async function uploadAvatar(file, onProgress) {
    const form = new FormData()
    form.append('avatar', file)
    const res = await api.patch(
        'user/me/avatar',
        form,
        {onUploadProgress: e => onProgress?.(Math.round((e.loaded / e.total) * 100))},
    )
    return res.data
}
