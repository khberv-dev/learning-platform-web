import {useMutation} from '@tanstack/react-query';
import {createLiveLesson, uploadRecording} from '@/services/live-lesson/api.js';

// Both are fire-and-forget: there is no live-lesson list or history on this
// panel to invalidate afterwards (students read it back through their own
// `GET student/live-lessons/latest` and recording routes).
export const useCreateLiveLesson = () => useMutation({mutationFn: createLiveLesson});
export const useUploadRecording = () => useMutation({mutationFn: uploadRecording});
