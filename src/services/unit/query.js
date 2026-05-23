import {useInfoMutation} from "@/services/query.js";
import {createUnit, updateUnit, deleteUnit} from "@/services/unit/api.js";

export const useCreateUnit = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, data}) => createUnit(courseId, data),
    onSuccess: opts?.onSuccess,
})

export const useUpdateUnit = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId, data}) => updateUnit(courseId, unitId, data),
    onSuccess: opts?.onSuccess,
})

export const useDeleteUnit = (opts) => useInfoMutation({
    queryKey: ['course'],
    mutationFn: ({courseId, unitId}) => deleteUnit(courseId, unitId),
    onSuccess: opts?.onSuccess,
})
