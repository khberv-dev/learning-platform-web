import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    getGroups, getGroup,
    createGroup, updateGroup, deactivateGroup,
    addStudentToGroup, removeStudentFromGroup,
} from "@/services/group/api.js";

export const useGetGroups = (params = {}) => useQuery({
    queryKey: ['group', 'list', params.page ?? 1, params.limit ?? 10],
    queryFn: () => getGroups(params),
})

export const useGetGroup = (id) => useQuery({
    queryKey: ['group', 'detail', id],
    queryFn: () => getGroup(id),
    enabled: !!id,
})

export const useCreateGroup = (opts) => useInfoMutation({
    queryKey: ['group'],
    mutationFn: (data) => createGroup(data),
    onSuccess: opts?.onSuccess,
})

export const useUpdateGroup = (opts) => useInfoMutation({
    queryKey: ['group'],
    mutationFn: ({id, data}) => updateGroup(id, data),
    onSuccess: opts?.onSuccess,
})

export const useDeactivateGroup = (opts) => useInfoMutation({
    queryKey: ['group'],
    mutationFn: (id) => deactivateGroup(id),
    onSuccess: opts?.onSuccess,
})

export const useAddStudentToGroup = (opts) => useInfoMutation({
    queryKey: ['group'],
    mutationFn: ({groupId, studentId}) => addStudentToGroup(groupId, studentId),
    onSuccess: opts?.onSuccess,
})

export const useRemoveStudentFromGroup = (opts) => useInfoMutation({
    queryKey: ['group'],
    mutationFn: ({groupId, studentId}) => removeStudentFromGroup(groupId, studentId),
    onSuccess: opts?.onSuccess,
})
