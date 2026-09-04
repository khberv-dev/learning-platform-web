import {useQuery} from '@tanstack/react-query';
import {getTaskSubmission} from '@/services/task-submission/api.js';

export const useTaskSubmission = (taskId) => {
    return useQuery({
        queryKey: ['task-submission', 'detail', taskId],
        queryFn: () => getTaskSubmission(taskId),
        enabled: Boolean(taskId),
    });
};
