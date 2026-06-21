import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {submitTasks, getLessonTaskResults} from "@/services/task-submission/api.js";

export const useSubmitTasks = (opts) => useInfoMutation({
    mutationFn: (answers) => submitTasks(answers),
    onSuccess: opts?.onSuccess,
})

export const useGetLessonTaskResults = (lessonId) => useQuery({
    queryKey: ['task-submission', 'lesson', lessonId],
    queryFn: () => getLessonTaskResults(lessonId),
    enabled: !!lessonId,
})
