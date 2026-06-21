import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    getTeachers, getTeacher, getMyTeacherSummary,
    createTeacher, updateTeacher, changeTeacherStatus,
    uploadTeacherIntro, createFeedback,
    getMySchedule, setMySchedule,
} from "@/services/teacher/api.js";

export const useGetTeachers = (params = {}) => useQuery({
    queryKey: ['teacher', 'list', params.page ?? 1, params.limit ?? 10],
    queryFn: () => getTeachers(params),
})

export const useGetTeacher = (id) => useQuery({
    queryKey: ['teacher', 'detail', id],
    queryFn: () => getTeacher(id),
    enabled: !!id,
})

export const useGetMyTeacherSummary = () => useQuery({
    queryKey: ['teacher', 'me', 'summary'],
    queryFn: getMyTeacherSummary,
})

export const useCreateTeacher = (opts) => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: (data) => createTeacher(data),
    onSuccess: opts?.onSuccess,
})

export const useUpdateTeacher = (opts) => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: ({id, data}) => updateTeacher(id, data),
    onSuccess: opts?.onSuccess,
})

export const useChangeTeacherStatus = (opts) => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: ({id, status}) => changeTeacherStatus(id, status),
    onSuccess: opts?.onSuccess,
})

export const useUploadTeacherIntro = (opts) => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: (file) => uploadTeacherIntro(file),
    onSuccess: opts?.onSuccess,
})

export const useCreateTeacherFeedback = (opts) => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: ({teacherId, data}) => createFeedback(teacherId, data),
    onSuccess: opts?.onSuccess,
})

export const useGetMySchedule = () => useQuery({
    queryKey: ['teacher', 'me', 'schedule'],
    queryFn: getMySchedule,
})

export const useSetMySchedule = (opts) => useInfoMutation({
    queryKey: ['teacher', 'me', 'schedule'],
    mutationFn: (schedule) => setMySchedule(schedule),
    onSuccess: opts?.onSuccess,
})
