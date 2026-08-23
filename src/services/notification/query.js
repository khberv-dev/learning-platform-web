import {useMutation} from '@tanstack/react-query';
import {sendPush} from '@/services/notification/api.js';

export const PUSH_AUDIENCE = {
    ALL: 'all',
    STUDENTS: 'students',
    TEACHERS: 'teachers',
    PHONES: 'phones',
};

// Matches the DTO's own cap - the API rejects a longer list outright.
export const MAX_PUSH_PHONE_NUMBERS = 500;

// Nothing is cached in the admin panel, so nothing is invalidated. A permanent
// push is stored for recipients, but its history is exposed only to students.
// The mutation result *is* the delivery report
// (`devices`, `sent`, `failed`, `removedTokens`, plus `notFound` and
// `withoutDevice` for a `phones` send), which the page renders.
export const useSendPush = () => {
    return useMutation({mutationFn: sendPush});
};
