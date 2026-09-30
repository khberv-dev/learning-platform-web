import {apiClient} from '@/services/api.js';

// Downloadable lesson attachments (PDF / Word). There is no update route - a
// wrong file is deleted and uploaded again. The API derives `type` (`pdf` /
// `doc`) from the file itself, and `url` comes back as a signed link.

// Paginated; 100 is the API's own cap on `limit` and comfortably covers every
// material a lesson has in one request - the section has no pagination UI.
export async function getMaterials({lessonId, page = 1, limit = 100}) {
    const res = await apiClient.get(`admin/lessons/${lessonId}/materials`, {params: {page, limit}});
    return res.data;
}

export async function createMaterial({lessonId, name, file, onUploadProgress}) {
    const form = new FormData();
    form.append('name', name);
    form.append('file', file);
    const res = await apiClient.post(`admin/lessons/${lessonId}/materials`, form, {onUploadProgress});
    return res.data;
}

export async function deleteMaterial({lessonId, materialId}) {
    await apiClient.delete(`admin/lessons/${lessonId}/materials/${materialId}`);
}
