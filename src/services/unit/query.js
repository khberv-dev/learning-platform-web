import {useInfoMutation} from "@/services/query.js";
import {createUnit, deleteUnit, updateUnit} from "@/services/unit/api.js";

export const useCreateUnit = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, dto}) => createUnit(courseId, dto),
})

export const useUpdateUnit = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, dto}) => updateUnit(courseId, unitId, dto),
})

export const useDeleteUnit = () => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId}) => deleteUnit(courseId, unitId),
})
