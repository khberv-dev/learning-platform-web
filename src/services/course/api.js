import {apiClient} from '@/services/api.js';

// Course and lesson writes are multipart because they can carry a file in the
// same request. Booleans have to be stringified ("true"/"false") - the DTO's
// @Transform compares against the string form - and null/undefined keys are
// dropped so a PATCH never blanks a field the form didn't touch.
function asForm(payload, fileField, file) {
    const form = new FormData();

    Object.entries(payload ?? {}).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        form.append(key, typeof value === 'boolean' ? String(value) : value);
    });

    if (file) form.append(fileField, file);

    return form;
}

// ── Course ───────────────────────────────────────────────────────────────────

// Paginated. Rows carry `unitsCount` and `lessonsCount` only - neither units
// nor lessons are included. 100 is the API's own cap on `limit`; callers that
// need every course (a picker, the running "next index") request that many in
// one shot rather than building pagination UI around what used to be a bare
// array.
export async function getCourses({page = 1, limit = 100} = {}) {
    const res = await apiClient.get('admin/courses', {params: {page, limit}});
    return res.data;
}

// Includes `units[]`, but each unit carries only a `lessonsCount` - the
// lessons themselves come from getLessons().
export async function getCourse(id) {
    const res = await apiClient.get(`admin/courses/${id}`);
    return res.data;
}

export async function createCourse({image, onUploadProgress, ...payload}) {
    const res = await apiClient.post('admin/courses', asForm(payload, 'image', image), {onUploadProgress});
    return res.data;
}

export async function updateCourse({id, image, onUploadProgress, ...payload}) {
    const res = await apiClient.patch(`admin/courses/${id}`, asForm(payload, 'image', image), {onUploadProgress});
    return res.data;
}

export async function deleteCourse(id) {
    await apiClient.delete(`admin/courses/${id}`);
}

// ── Unit ─────────────────────────────────────────────────────────────────────

// `index` is the admin-set display order (int, default 0). Lists come back
// sorted by `index ASC, createdAt ASC`, so equal indexes keep insertion order.
export async function createUnit({courseId, ...payload}) {
    const res = await apiClient.post(`admin/courses/${courseId}/units`, payload);
    return res.data;
}

export async function updateUnit({courseId, unitId, ...payload}) {
    const res = await apiClient.patch(`admin/courses/${courseId}/units/${unitId}`, payload);
    return res.data;
}

export async function deleteUnit({courseId, unitId}) {
    await apiClient.delete(`admin/courses/${courseId}/units/${unitId}`);
}

// ── Lesson ───────────────────────────────────────────────────────────────────

// Lessons are no longer embedded in the course payload - the course detail
// carries only each unit's `lessonsCount`, so the tree loads a unit's lessons
// from here when it's expanded. Paginated; 100 is the API's own cap on
// `limit` and comfortably covers every lesson a unit has in one request - the
// page has no pagination UI.
export async function getLessons({courseId, unitId, page = 1, limit = 100}) {
    const res = await apiClient.get(`admin/courses/${courseId}/units/${unitId}/lessons`, {
        params: {page, limit},
    });
    return res.data;
}

export async function createLesson({courseId, unitId, media, onUploadProgress, ...payload}) {
    const res = await apiClient.post(
        `admin/courses/${courseId}/units/${unitId}/lessons`,
        asForm(payload, 'media', media),
        {onUploadProgress}
    );
    return res.data;
}

// Text fields only - replacing the video goes through uploadLessonMedia.
export async function updateLesson({courseId, unitId, lessonId, ...payload}) {
    const res = await apiClient.patch(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}`,
        payload
    );
    return res.data;
}

export async function uploadLessonMedia({courseId, unitId, lessonId, media, onUploadProgress}) {
    const res = await apiClient.patch(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/media`,
        asForm({}, 'media', media),
        {onUploadProgress}
    );
    return res.data;
}

export async function deleteLessonMedia({courseId, unitId, lessonId}) {
    await apiClient.delete(`admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/media`);
}

export async function deleteLesson({courseId, unitId, lessonId}) {
    await apiClient.delete(`admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}`);
}

// ── Task ─────────────────────────────────────────────────────────────────────

// Paginated; 100 is the API's own cap on `limit` and comfortably covers every
// task a lesson has in one request - the page has no pagination UI.
export async function getTasks({courseId, unitId, lessonId, page = 1, limit = 100}) {
    const res = await apiClient.get(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks`,
        {params: {page, limit}}
    );
    return res.data;
}

// ── Task questions ───────────────────────────────────────────────────────────

// Questions live in a jsonb array with no ids of their own, so each one is
// addressed by its position. These endpoints exist so adding or editing a
// single question doesn't mean resubmitting (and revalidating) the whole array.
export async function addTaskQuestion({courseId, unitId, lessonId, taskId, ...question}) {
    const res = await apiClient.post(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${taskId}/questions`,
        question
    );
    return res.data;
}

export async function updateTaskQuestion({courseId, unitId, lessonId, taskId, index, ...question}) {
    const res = await apiClient.patch(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${taskId}/questions/${index}`,
        question
    );
    return res.data;
}

export async function deleteTaskQuestion({courseId, unitId, lessonId, taskId, index}) {
    const res = await apiClient.delete(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${taskId}/questions/${index}`
    );
    return res.data;
}

// `questions` is optional - a task can be created empty and filled in after.
export async function createTask({courseId, unitId, lessonId, ...payload}) {
    const res = await apiClient.post(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks`,
        payload
    );
    return res.data;
}

export async function updateTask({courseId, unitId, lessonId, taskId, ...payload}) {
    const res = await apiClient.patch(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${taskId}`,
        payload
    );
    return res.data;
}

// Audio or image. The API derives `contentType` from the uploaded file's mime
// type - passing a plain string as the task's `file` instead marks it "text".
export async function uploadTaskFile({courseId, unitId, lessonId, taskId, file, onUploadProgress}) {
    const res = await apiClient.patch(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${taskId}/file`,
        asForm({}, 'file', file),
        {onUploadProgress}
    );
    return res.data;
}

export async function deleteTask({courseId, unitId, lessonId, taskId}) {
    await apiClient.delete(
        `admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${taskId}`
    );
}
