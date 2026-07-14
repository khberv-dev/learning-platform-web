import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {listMaterials, createMaterial, deleteMaterial} from "@/services/material/api.js";

export const useListMaterials = (lessonId) => useQuery({
    queryKey: ['material', lessonId],
    queryFn: () => listMaterials(lessonId),
    enabled: !!lessonId,
})

export const useCreateMaterial = (opts) => useInfoMutation({
    queryKey: ['material'],
    mutationFn: ({lessonId, name, file, onProgress}) => createMaterial(lessonId, name, file, onProgress),
    onSuccess: opts?.onSuccess,
})

export const useDeleteMaterial = (opts) => useInfoMutation({
    queryKey: ['material'],
    mutationFn: ({lessonId, materialId}) => deleteMaterial(lessonId, materialId),
    onSuccess: opts?.onSuccess,
})
