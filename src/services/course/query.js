import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    getCourses, getCourse, getAvailableCourses, getMyCourses,
    createCourse, updateCourse, deleteCourse,
} from "@/services/course/api.js";

export const useGetCourses = () => useQuery({
    queryKey: ['course', 'list'],
    queryFn: getCourses,
})

export const useGetCourse = (id) => useQuery({
    queryKey: ['course', 'detail', id],
    queryFn: () => getCourse(id),
    enabled: !!id,
})

export const useGetAvailableCourses = () => useQuery({
    queryKey: ['course', 'available'],
    queryFn: getAvailableCourses,
})

export const useGetMyCourses = () => useQuery({
    queryKey: ['course', 'me'],
    queryFn: getMyCourses,
})

export const useCreateCourse = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: (data) => createCourse(data),
    onSuccess: opts?.onSuccess,
})

export const useUpdateCourse = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({id, data}) => updateCourse(id, data),
    onSuccess: opts?.onSuccess,
})

export const useDeleteCourse = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: (id) => deleteCourse(id),
    onSuccess: opts?.onSuccess,
})
