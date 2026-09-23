import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    addGroupStudents,
    addSupportMentor,
    assignPrimaryMentor,
    createGroup,
    getGroup,
    getGroups,
    getMyGroup,
    getMyGroups,
    removeGroupMentor,
    removeGroupStudent,
    setGroupActive,
    swapGroupStudent,
    updateGroup,
} from '@/services/group/api.js';

export const GROUP_MENTOR_ROLE = {
    PRIMARY: 'primary',
    SUPPORT: 'support',
};

// Whitelisted server-side.
export const GROUP_SORT_FIELDS = ['createdAt', 'updatedAt', 'title'];

export const useGroups = (params) => {
    return useQuery({
        queryKey: ['group', 'list', params],
        queryFn: () => getGroups(params),
    });
};

export const useGroup = (id) => {
    return useQuery({
        queryKey: ['group', 'detail', id],
        queryFn: () => getGroup(id),
        enabled: Boolean(id),
    });
};

// 100 is the API's own cap on `limit`, comfortably covering every group a
// mentor leads or supports in one request - a mentor's own groups page has no
// pagination UI, unlike the admin list.
export const useMyGroups = () => {
    return useQuery({
        queryKey: ['group', 'me'],
        queryFn: () => getMyGroups({page: 1, limit: 100}),
    });
};

// The full detail shape, unlike the list above - a mentor's own single-group
// page.
export const useMyGroup = (id) => {
    return useQuery({
        queryKey: ['group', 'me', id],
        queryFn: () => getMyGroup(id),
        enabled: Boolean(id),
    });
};

// Every mutation invalidates the whole domain: a roster change shows up in the
// detail page, the list, and a mentor's own groups, and those are keyed by
// params there is no single key to patch. Student rows may carry their group,
// so the student domain is refreshed as well, and so is chat: each group owns
// a room whose header (primary mentor, student count) and access follow the
// roster.
function useGroupMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['group']});
            queryClient.invalidateQueries({queryKey: ['student']});
            queryClient.invalidateQueries({queryKey: ['chat']});
        },
    });
}

export const useCreateGroup = () => useGroupMutation(createGroup);
export const useUpdateGroup = () => useGroupMutation(updateGroup);
export const useSetGroupActive = () => useGroupMutation(setGroupActive);
export const useAddGroupStudents = () => useGroupMutation(addGroupStudents);
export const useRemoveGroupStudent = () => useGroupMutation(removeGroupStudent);
export const useSwapGroupStudent = () => useGroupMutation(swapGroupStudent);
export const useAssignPrimaryMentor = () => useGroupMutation(assignPrimaryMentor);
export const useAddSupportMentor = () => useGroupMutation(addSupportMentor);
export const useRemoveGroupMentor = () => useGroupMutation(removeGroupMentor);
