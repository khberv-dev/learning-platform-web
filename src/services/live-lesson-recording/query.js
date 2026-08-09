import {useQuery} from "@tanstack/react-query";
import {useInfoMutation} from "@/services/query.js";
import {
    uploadLiveLessonRecording,
    getMyLiveLessonRecordings,
    getLiveLessonRecordingsByAssignment,
    getLiveLessonRecording,
} from "@/services/live-lesson-recording/api.js";

export const useUploadLiveLessonRecording = (opts) => useInfoMutation({
    queryKey: ['live-lesson-recording'],
    mutationFn: ({assignmentId, title, file, onProgress}) =>
        uploadLiveLessonRecording(assignmentId, {title, file, onProgress}),
    onSuccess: opts?.onSuccess,
})

export const useGetMyLiveLessonRecordings = () => useQuery({
    queryKey: ['live-lesson-recording', 'my'],
    queryFn: () => getMyLiveLessonRecordings(),
})

export const useGetLiveLessonRecordingsByAssignment = (assignmentId) => useQuery({
    queryKey: ['live-lesson-recording', 'by-assignment', assignmentId],
    queryFn: () => getLiveLessonRecordingsByAssignment(assignmentId),
    enabled: !!assignmentId,
})

export const useGetLiveLessonRecording = (id) => useQuery({
    queryKey: ['live-lesson-recording', 'detail', id],
    queryFn: () => getLiveLessonRecording(id),
    enabled: !!id,
})
