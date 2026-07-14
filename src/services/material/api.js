import {api} from "@/services/api.js";

export async function listMaterials(lessonId) {
    const res = await api.get(`lessons/${lessonId}/materials`)
    return res.data
}

export async function createMaterial(lessonId, name, file, onProgress) {
    const form = new FormData()
    form.append('name', name)
    form.append('file', file)
    const res = await api.post(
        `admin/lessons/${lessonId}/materials`,
        form,
        {onUploadProgress: e => onProgress?.(Math.round((e.loaded / e.total) * 100))},
    )
    return res.data
}

export async function deleteMaterial(lessonId, materialId) {
    const res = await api.delete(`admin/lessons/${lessonId}/materials/${materialId}`)
    return res.data
}
