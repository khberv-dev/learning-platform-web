import {apiClient} from '@/services/api.js';

// Authors are display-only people credited on a course - not accounts, no
// sign-in, no link to Mentor. Writes are multipart because an avatar can ride
// along; null/undefined keys are dropped so a PATCH never blanks a field the
// form didn't touch.
function asForm(payload, avatar) {
    const form = new FormData();

    Object.entries(payload ?? {}).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        form.append(key, value);
    });

    if (avatar) form.append('avatar', avatar);

    return form;
}

// Paginated, newest first. 100 is the API's own cap on `limit` - the course
// author picker asks for that many to choose from.
export async function getAuthors({page = 1, limit = 15} = {}) {
    const res = await apiClient.get('admin/authors', {params: {page, limit}});
    return res.data;
}

// Includes `courses[]` ({id, title, image, isActive}) - the list rows don't.
export async function getAuthor(id) {
    const res = await apiClient.get(`admin/authors/${id}`);
    return res.data;
}

export async function createAuthor({avatar, onUploadProgress, ...payload}) {
    const res = await apiClient.post('admin/authors', asForm(payload, avatar), {onUploadProgress});
    return res.data;
}

// Answers with the detail shape, courses included.
export async function updateAuthor({id, avatar, onUploadProgress, ...payload}) {
    const res = await apiClient.patch(`admin/authors/${id}`, asForm(payload, avatar), {onUploadProgress});
    return res.data;
}

// Unlinks the author from every course it was credited on; the courses stay.
export async function deleteAuthor(id) {
    await apiClient.delete(`admin/authors/${id}`);
}
