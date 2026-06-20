import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {getLiveLessons, getLiveLesson, createLiveLesson, updateLiveLesson, deleteLiveLesson} from "@/services/live-lesson/api.js";

export const useGetLiveLessons = (params = {}) => useQuery({
    queryKey: ['live-lesson', 'list', params.page ?? 1, params.limit ?? 10],
    queryFn: () => getLiveLessons(params),
})

export const useGetLiveLesson = (id) => useQuery({
    queryKey: ['live-lesson', 'detail', id],
    queryFn: () => getLiveLesson(id),
    enabled: !!id,
})

export const useCreateLiveLesson = (opts) => useInfoMutation({
    queryKey: ['live-lesson'],
    mutationFn: (data) => createLiveLesson(data),
    onSuccess: opts?.onSuccess,
})

export const useUpdateLiveLesson = (opts) => useInfoMutation({
    queryKey: ['live-lesson'],
    mutationFn: ({id, data}) => updateLiveLesson(id, data),
    onSuccess: opts?.onSuccess,
})

export const useDeleteLiveLesson = (opts) => useInfoMutation({
    queryKey: ['live-lesson'],
    mutationFn: (id) => deleteLiveLesson(id),
    onSuccess: opts?.onSuccess,
})
