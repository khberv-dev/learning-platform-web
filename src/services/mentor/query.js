import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    changeMentorStatus,
    createMentor,
    getMentor,
    getMentors,
    getMySchedule,
    getMySummary,
    setMySchedule,
    updateMentor,
    uploadMentorIntroVideo,
    uploadMyIntroVideo,
} from '@/services/mentor/api.js';

// Mentor status values come from the API's TeacherStatus enum (lowercase on
// the wire, despite the uppercase Swagger examples).
export const MENTOR_STATUS = {
    ACTIVE: 'active',
    FIRED: 'fired',
    SUSPENDED: 'suspended',
};

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

// ── Mentor self-service ──────────────────────────────────────────────────────

export const useMySummary = () => {
    return useQuery({
        queryKey: ['mentor', 'me', 'summary'],
        queryFn: getMySummary,
    });
};

export const useMySchedule = () => {
    return useQuery({
        queryKey: ['mentor', 'me', 'schedule'],
        queryFn: getMySchedule,
    });
};

export const useSetMySchedule = () => useMentorMutation(setMySchedule);
export const useUploadMyIntroVideo = () => useMentorMutation(uploadMyIntroVideo);
