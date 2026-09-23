import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    changeMentorStatus,
    createMentor,
    getMentor,
    getMentors,
    getMySummary,
    updateMentor,
    uploadMentorAvatar,
    uploadMentorIntroVideo,
    uploadMyIntroVideo,
} from '@/services/mentor/api.js';

// Mentor status values come from the API's MentorStatus enum (lowercase on
// the wire, despite the uppercase Swagger examples).
export const MENTOR_STATUS = {
    ACTIVE: 'active',
    FIRED: 'fired',
    SUSPENDED: 'suspended',
};

// Whitelisted server-side; anything else is rejected rather than reaching SQL.
// Narrower than the student list - no points/coins/balance - but adds `role`,
// a mentor-only column (their own primary/support classification, distinct
// from GroupMentor.role which is per-group).
export const MENTOR_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'status',
    'role',
    'firstName',
    'lastName',
];

export const useMentors = (params) => {
    return useQuery({
        queryKey: ['mentor', 'list', params],
        queryFn: () => getMentors(params),
    });
};

export const useMentor = (id) => {
    return useQuery({
        queryKey: ['mentor', 'detail', id],
        queryFn: () => getMentor(id),
        enabled: Boolean(id),
    });
};

// Every mentor mutation invalidates the whole domain rather than a single key:
// a status change shows up in both the list row and the detail page, and the
// list is keyed by its pagination params so there's no single key to target.
function useMentorMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['mentor']}),
    });
}

export const useCreateMentor = () => useMentorMutation(createMentor);
export const useUpdateMentor = () => useMentorMutation(updateMentor);
export const useChangeMentorStatus = () => useMentorMutation(changeMentorStatus);
export const useUploadMentorIntroVideo = () => useMentorMutation(uploadMentorIntroVideo);
export const useUploadMentorAvatar = () => useMentorMutation(uploadMentorAvatar);

// ── Mentor self-service ──────────────────────────────────────────────────────

export const useMySummary = () => {
    return useQuery({
        queryKey: ['mentor', 'me', 'summary'],
        queryFn: getMySummary,
    });
};

export const useUploadMyIntroVideo = () => useMentorMutation(uploadMyIntroVideo);
