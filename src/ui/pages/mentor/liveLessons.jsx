import {useState} from 'react';
import {Button, Dialog, Select, TextInput} from '@gravity-ui/uikit';
import {ExternalLink, Pencil, Plus, Trash2, Upload} from 'lucide-react';
import dayjs from 'dayjs';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useCreateLiveLesson,
    useDeleteLiveLesson,
    useLiveLessons,
    useUpdateLiveLesson,
    useUploadRecording,
} from '@/services/live-lesson/query.js';
import {useAssignmentHistory} from '@/services/assignment/query.js';
import {ASSIGNMENT_STATUS} from '@/services/assignment/query.js';
import {formatDateTime, fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import FormField from '@/ui/components/formField.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';

const EMPTY = {name: '', meetLink: '', startTime: '', endTime: '', assignmentId: ''};

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time; the API speaks ISO.
function toLocalInput(value) {
    return value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '';
}

function MentorLiveLessons() {
    const {t} = useI18n();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const query = useLiveLessons({page, limit});
    const createLesson = useCreateLiveLesson();
    const updateLesson = useUpdateLiveLesson();
    const deleteLesson = useDeleteLiveLesson();
    const uploadRecording = useUploadRecording();

    // Only accepted assignments can host a lesson, so the picker is filtered
    // down to the active ones.
    const assignments = useAssignmentHistory({page: 1, limit: 100});
    const activeAssignments = (assignments.data?.data ?? []).filter(
        (assignment) => assignment.status === ASSIGNMENT_STATUS.ACTIVE
    );

    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [recordingFor, setRecordingFor] = useState(null);
    const [recordingTitle, setRecordingTitle] = useState('');
    const [recordingFile, setRecordingFile] = useState(null);

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const submit = () => {
        const isEdit = dialog.mode === 'edit';

        if (!form.name.trim() || !form.meetLink.trim() || !form.startTime || !form.endTime) {
            toaster.add({name: 'live-lesson-invalid', theme: 'danger', title: t('common.error')});
            return;
        }
        if (!isEdit && !form.assignmentId) {
            toaster.add({name: 'live-lesson-invalid', theme: 'danger', title: t('common.error')});
            return;
        }

        const payload = {
            name: form.name.trim(),
            meetLink: form.meetLink.trim(),
            startTime: new Date(form.startTime).toISOString(),
            endTime: new Date(form.endTime).toISOString(),
        };

        const mutation = isEdit ? updateLesson : createLesson;

        mutation.mutate(
            isEdit ? {id: dialog.id, ...payload} : {...payload, assignmentId: form.assignmentId},
            {
                onSuccess: () => {
                    toaster.add({
                        name: 'live-lesson-saved',
                        theme: 'success',
                        title: isEdit ? t('liveLesson.updated') : t('liveLesson.created'),
                    });
                    setDialog(null);
                },
                onError: (error) =>
                    toaster.add({
                        name: 'live-lesson-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    const submitRecording = () => {
        if (!recordingTitle.trim() || !recordingFile) {
            toaster.add({name: 'recording-invalid', theme: 'danger', title: t('common.error')});
            return;
        }

        uploadRecording.mutate(
            {
                assignmentId: recordingFor.assignment?.id,
                title: recordingTitle.trim(),
                file: recordingFile,
            },
            {
                onSuccess: () => {
                    toaster.add({name: 'recording-saved', theme: 'success', title: t('common.saved')});
                    setRecordingFor(null);
                    setRecordingTitle('');
                    setRecordingFile(null);
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

    const columns = [
        {id: 'name', name: t('liveLesson.name'), template: (row) => row.name},
        {
            id: 'student',
            name: t('assignment.student'),
            template: (row) => fullName(row.assignment?.student?.user) || '—',
        },
        {
            id: 'startTime',
            name: t('liveLesson.startTime'),
            template: (row) => formatDateTime(row.startTime),
        },
        {
            id: 'endTime',
            name: t('liveLesson.endTime'),
            template: (row) => formatDateTime(row.endTime),
        },
        {
            id: 'actions',
            name: t('common.actions'),
            template: (row) => (
                <div style={{display: 'flex', gap: 4}}>
                    <Button size="s" href={row.meetLink} target="_blank" rel="noreferrer">
                        <Button.Icon>
                            <ExternalLink size={14}/>
                        </Button.Icon>
                        {t('liveLesson.join')}
                    </Button>
                    <Button
                        size="s"
                        onClick={() => {
                            setRecordingFor(row);
                            setRecordingTitle(row.name ?? '');
                            setRecordingFile(null);
                        }}
                        aria-label={t('liveLesson.uploadRecording')}
                    >
                        <Button.Icon>
                            <Upload size={14}/>
                        </Button.Icon>
                    </Button>
                    <Button
                        size="s"
                        onClick={() => {
                            setForm({
                                name: row.name ?? '',
                                meetLink: row.meetLink ?? '',
                                startTime: toLocalInput(row.startTime),
                                endTime: toLocalInput(row.endTime),
                                assignmentId: row.assignment?.id ?? '',
                            });
                            setDialog({mode: 'edit', id: row.id});
                        }}
                    >
                        <Button.Icon>
                            <Pencil size={14}/>
                        </Button.Icon>
                    </Button>
                    <Button size="s" view="flat-danger" onClick={() => setConfirmDelete(row)}>
                        <Button.Icon>
                            <Trash2 size={14}/>
                        </Button.Icon>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="page-fill">
            <PageHeader
                title={t('liveLesson.title')}
                actions={
                    <Button
                        view="action"
                        onClick={() => {
                            setForm(EMPTY);
                            setDialog({mode: 'create'});
                        }}
                    >
                        <Button.Icon>
                            <Plus size={16}/>
                        </Button.Icon>
                        {t('liveLesson.create')}
                    </Button>
                }
            />
            <PageSection className="page-fill__section">
                <DataTable
                    query={query}
                    columns={columns}
                    page={page}
                    limit={limit}
                    onPageChange={(nextPage, nextLimit) => {
                        setPage(nextPage);
                        setLimit(nextLimit);
                    }}
                />
            </PageSection>

            <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} size="m">
                <Dialog.Header
                    caption={dialog?.mode === 'edit' ? t('liveLesson.edit') : t('liveLesson.create')}
                />
                <Dialog.Body>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <FormField label={t('liveLesson.name')} required>
                            <TextInput size="l" value={form.name} onUpdate={setField('name')}/>
                        </FormField>
                        <FormField label={t('liveLesson.meetLink')} required>
                            <TextInput
                                size="l"
                                value={form.meetLink}
                                onUpdate={setField('meetLink')}
                                placeholder="https://meet.google.com/..."
                            />
                        </FormField>
                        {dialog?.mode === 'create' && (
                            <FormField label={t('liveLesson.assignment')} required>
                                <Select
                                    size="l"
                                    width="max"
                                    value={form.assignmentId ? [form.assignmentId] : []}
                                    onUpdate={([value]) => setField('assignmentId')(value)}
                                    loading={assignments.isPending}
                                >
                                    {activeAssignments.map((assignment) => (
                                        <Select.Option key={assignment.id} value={assignment.id}>
                                            {fullName(assignment.student?.user) || assignment.id}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </FormField>
                        )}
                        <FormField label={t('liveLesson.startTime')} required>
                            <TextInput
                                size="l"
                                type="datetime-local"
                                value={form.startTime}
                                onUpdate={setField('startTime')}
                            />
                        </FormField>
                        <FormField label={t('liveLesson.endTime')} required>
                            <TextInput
                                size="l"
                                type="datetime-local"
                                value={form.endTime}
                                onUpdate={setField('endTime')}
                            />
                        </FormField>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setDialog(null)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={submit}
                    textButtonApply={t('common.save')}
                    propsButtonApply={{loading: createLesson.isPending || updateLesson.isPending}}
                />
            </Dialog>

            <Dialog open={Boolean(recordingFor)} onClose={() => setRecordingFor(null)} size="s">
                <Dialog.Header caption={t('liveLesson.uploadRecording')}/>
                <Dialog.Body>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <FormField label={t('liveLesson.recordingTitle')} required>
                            <TextInput size="l" value={recordingTitle} onUpdate={setRecordingTitle}/>
                        </FormField>
                        <FormField label={t('liveLesson.uploadRecording')} required>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(event) => setRecordingFile(event.target.files?.[0] ?? null)}
                            />
                        </FormField>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setRecordingFor(null)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={submitRecording}
                    textButtonApply={t('common.save')}
                    propsButtonApply={{loading: uploadRecording.isPending}}
                />
            </Dialog>

            <ConfirmDialog
                open={Boolean(confirmDelete)}
                title={t('common.delete')}
                message={t('liveLesson.deleteConfirm')}
                confirmText={t('common.delete')}
                loading={deleteLesson.isPending}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() =>
                    deleteLesson.mutate(confirmDelete.id, {
                        onSuccess: () => {
                            toaster.add({
                                name: 'live-lesson-deleted',
                                theme: 'success',
                                title: t('common.deleted'),
                            });
                            setConfirmDelete(null);
                        },
                        onError: (error) =>
                            toaster.add({
                                name: 'live-lesson-delete-failed',
                                theme: 'danger',
                                title: extractApiErrorMessage(error, t('common.error')),
                            }),
                    })
                }
            />
        </div>
    );
}

export default MentorLiveLessons;
