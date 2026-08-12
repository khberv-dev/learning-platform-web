import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    createLiveLesson,
    deleteLiveLesson,
    getLiveLesson,
    getLiveLessons,
    updateLiveLesson,
    uploadRecording,
} from '@/services/live-lesson/api.js';

export const useLiveLessons = (params) => {
    return useQuery({
        queryKey: ['live-lesson', 'list', params],
        queryFn: () => getLiveLessons(params),
    });
};

export const useLiveLesson = (id) => {
    return useQuery({
        queryKey: ['live-lesson', 'detail', id],
        queryFn: () => getLiveLesson(id),
        enabled: Boolean(id),
    });
};

function useLiveLessonMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['live-lesson']});
            queryClient.invalidateQueries({queryKey: ['mentor', 'me']});
        },
    });
}

export const useCreateLiveLesson = () => useLiveLessonMutation(createLiveLesson);
export const useUpdateLiveLesson = () => useLiveLessonMutation(updateLiveLesson);
export const useDeleteLiveLesson = () => useLiveLessonMutation(deleteLiveLesson);
export const useUploadRecording = () => useLiveLessonMutation(uploadRecording);
