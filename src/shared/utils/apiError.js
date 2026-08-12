// NestJS error bodies come in two shapes: `{message: "Talaba topilmadi",
// statusCode: 404}` for thrown HttpExceptions, and `{message: [...], statusCode:
// 400}` when class-validator rejects a DTO (one string per failed constraint).
// Falls back to a caller-supplied message when neither matches - e.g. a network
// error with no response body at all.
export function extractApiErrorMessage(error, fallback) {
    const data = error?.response?.data;
    if (!data) return fallback;

    if (Array.isArray(data.message)) return data.message[0] ?? fallback;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;

    return fallback;
}

// The token is valid but the role guard rejected the route - distinct from
// other failures (500s, network errors) that a page's generic error state
// covers. Refreshing can't fix it, so api.js leaves 403s to reject normally
// and pages can swap in a dedicated "no access" state instead.
export function isForbiddenError(error) {
    return error?.response?.status === 403;
}

export function isNotFoundError(error) {
    return error?.response?.status === 404;
}
