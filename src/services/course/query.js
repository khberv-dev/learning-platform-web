import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    createCourse,
    deleteCourse,
    getActiveCourses,
    getAllCourses,
    getAvailableCourses,
    getCourseById,
    getMyCourses,
    updateCourse,
} from "@/services/course/api.js";

export const useGetAllCourses = () => useQuery({
    queryKey: ['course', 'all'],
    queryFn: getAllCourses,
})

export const useGetCourse = (id) => useQuery({
    queryKey: ['course', 'one', id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
})

export const useGetActiveCourses = () => useQuery({
    queryKey: ['course', 'active'],
    queryFn: getActiveCourses,
})

export const useGetAvailableCourses = () => useQuery({
    queryKey: ['course', 'available'],
    queryFn: getAvailableCourses,
})

export const useGetMyCourses = () => useQuery({
    queryKey: ['course', 'me'],
    queryFn: getMyCourses,
})

export const useCreateCourse = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({dto, image}) => createCourse(dto, image),
})

export const useUpdateCourse = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({id, dto, image}) => updateCourse(id, dto, image),
})

export const useDeleteCourse = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: (id) => deleteCourse(id),
})
