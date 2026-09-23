import {useState} from 'react';
import {Dialog, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCreateLiveLesson, useUploadRecording} from '@/services/live-lesson/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import {VIDEO_RULES} from '@/shared/utils/fileValidation.js';
import {useUploadProgress} from '@/shared/hooks/useUploadProgress.js';
import FormField from '@/ui/components/formField.jsx';
import FileDropCard from '@/ui/components/fileDropCard.jsx';

// "Go live" is create-only and fire-and-forget - there is no lesson row to
// show afterwards, just the push it sends to every student in the group.
function StartLiveLessonFields({groupId, onClose}) {
    const {t} = useI18n();
    const createLesson = useCreateLiveLesson();
    const [name, setName] = useState('');
    const [meetLink, setMeetLink] = useState('');
    const [error, setError] = useState(null);

    const submit = () => {
        if (!name.trim() || !meetLink.trim()) {
            setError(t('common.error'));
            return;
        }
        setError(null);

        createLesson.mutate(
            {name: name.trim(), meetLink: meetLink.trim(), groupId},
            {
                onSuccess: () => {
                    toaster.add({name: 'live-lesson-started', theme: 'success', title: t('liveLesson.started')});
                    onClose();
                },
                onError: (err) =>
                    toaster.add({
                        name: 'live-lesson-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(err, t('common.error')),
                    }),
            }
        );
    };

    return (
        <>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <FormField label={t('liveLesson.name')} required error={error}>
                        <TextInput size="l" value={name} onUpdate={setName} autoFocus/>
                    </FormField>
                    <FormField label={t('liveLesson.meetLink')} required hint={t('liveLesson.startHint')}>
                        <TextInput
                            size="l"
                            value={meetLink}
                            onUpdate={setMeetLink}
                            placeholder="https://meet.google.com/..."
                        />
                    </FormField>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={submit}
                textButtonCancel={t('common.cancel')}
                textButtonApply={t('liveLesson.start')}
                loading={createLesson.isPending}
            />
        </>
    );
}

export function StartLiveLessonDialog({open, groupId, onClose}) {
    const {t} = useI18n();

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={t('liveLesson.start')}/>
            {open && <StartLiveLessonFields groupId={groupId} onClose={onClose}/>}
        </Dialog>
    );
}

function UploadRecordingFields({groupId, onClose}) {
    const {t} = useI18n();
    const uploadRecording = useUploadRecording();
    const {progress, onUploadProgress} = useUploadProgress();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);

    const submit = () => {
        if (!title.trim() || !file) {
            toaster.add({name: 'recording-invalid', theme: 'danger', title: t('common.error')});
            return;
        }

        uploadRecording.mutate(
            {groupId, title: title.trim(), file, onUploadProgress},
            {
                onSuccess: () => {
                    toaster.add({name: 'recording-saved', theme: 'success', title: t('common.saved')});
                    onClose();
                },
                onError: (error) =>
                    toaster.add({
                        name: 'recording-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    return (
        <>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <FormField label={t('liveLesson.recordingTitle')} required>
                        <TextInput size="l" value={title} onUpdate={setTitle}/>
                    </FormField>
                    <FormField label={t('liveLesson.uploadRecording')} required>
                        <FileDropCard
                            value={file}
                            onChange={setFile}
                            accept="video/mp4"
                            rules={VIDEO_RULES}
                            progress={progress}
                            disabled={uploadRecording.isPending}
                        />
                    </FormField>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={submit}
                textButtonCancel={t('common.cancel')}
                textButtonApply={t('common.save')}
                loading={uploadRecording.isPending}
            />
        </>
    );
}

export function UploadRecordingDialog({open, groupId, onClose}) {
    const {t} = useI18n();

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={t('liveLesson.uploadRecording')}/>
            {open && <UploadRecordingFields groupId={groupId} onClose={onClose}/>}
        </Dialog>
    );
}
