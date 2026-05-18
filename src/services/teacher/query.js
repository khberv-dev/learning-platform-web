import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    addTeacherFeedback,
    changeTeacherStatus,
    createTeacher,
    getActiveTeachers,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    updateTeacherIntroVideo,
} from "@/services/teacher/api.js";

export const useGetAllTeachers = () => useQuery({
    queryKey: ['teacher', 'all'],
    queryFn: getAllTeachers,
})

export const useGetTeacher = (id) => useQuery({
    queryKey: ['teacher', 'one', id],
    queryFn: () => getTeacherById(id),
    enabled: !!id,
})

export const useGetActiveTeachers = () => useQuery({
    queryKey: ['teacher', 'active'],
    queryFn: getActiveTeachers,
})

export const useCreateTeacher = () => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: createTeacher,
})

export const useUpdateTeacher = () => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: ({id, data}) => updateTeacher(id, data),
})

export const useChangeTeacherStatus = () => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: ({id, status}) => changeTeacherStatus(id, status),
})

export const useAddTeacherFeedback = () => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: ({id, data}) => addTeacherFeedback(id, data),
})

export const useUpdateTeacherIntroVideo = () => useInfoMutation({
    queryKey: ['teacher'],
    mutationFn: (file) => updateTeacherIntroVideo(file),
})
