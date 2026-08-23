import {apiClient} from '@/services/api.js';

// Most pushes are sent by the API itself on events (enrollment, new lesson,
// mentor assigned). This is the one manual path: an admin writes the message
// and picks who gets it.
//
// `audience` is required server-side precisely so a blast to everyone can never
// be a forgotten field, and there is no separate "send to one user" route -
// that is a `phones` list of one.
export async function sendPush({title, body, audience, phoneNumbers, isPermanent}) {
    const payload = {title, body, audience, isPermanent};
    if (phoneNumbers?.length) payload.phoneNumbers = phoneNumbers;

    // Delivery happens inside the request (chunks of 500 go sequentially), so a
    // large audience makes for a slow response - the caller must wait on it.
    const res = await apiClient.post('admin/notifications/push', payload);
    return res.data;
}
