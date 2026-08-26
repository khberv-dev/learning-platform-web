import {useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Dialog, Label, TextArea, TextInput} from '@gravity-ui/uikit';
import {ChevronRight, Plus, Trash2, Upload} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useCourse,
    useCreateTask,
    useDeleteLesson,
    useDeleteLessonMedia,
    useLesson,
    useTasks,
    useUnit,
    useUpdateLesson,
    useUploadLessonMedia,
} from '@/services/course/query.js';
import {cdnUrl, toOptionalNumber} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

function LessonForm({courseId, unitId, lessonId, initialValues}) {
    const {t} = useI18n();
    const updateLesson = useUpdateLesson();
    const [form, setForm] = useState(initialValues);

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const submit = (event) => {
        event.preventDefault();
        const title = form.title.trim();
        if (!title) return;

        // Text fields only - the video goes through its own endpoint.
        updateLesson.mutate(
            {
                courseId,
                unitId,
                lessonId,
                title,
                description: form.description.trim() || undefined,
                index: toOptionalNumber(form.index),
            },
            {
                onSuccess: () =>
                    toaster.add({name: 'lesson-saved', theme: 'success', title: t('common.saved')}),
                onError: (error) =>
                    toaster.add({
                        name: 'lesson-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    return (
        <form onSubmit={submit} style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560}}>
            <FormField label={t('course.lessonTitle')} required>
                <TextInput size="l" value={form.title} onUpdate={setField('title')}/>
            </FormField>
            <FormField label={t('course.description')}>
                <TextArea size="l" minRows={3} value={form.description} onUpdate={setField('description')}/>
            </FormField>
            <div style={{maxWidth: 160}}>
                <FormField label={t('course.index')} hint={t('course.indexHint')}>
                    <TextInput
                        size="l"
                        type="number"
                        value={form.index}
                        onUpdate={setField('index')}
                        controlProps={{min: 0}}
                    />
                </FormField>
            </div>
            <div>
                <Button type="submit" view="action" size="l" loading={updateLesson.isPending}>
                    {t('common.save')}
                </Button>
            </div>
        </form>
    );
}

function AdminLesson() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {courseId, unitId, lessonId} = useParams();

    const courseQuery = useCourse(courseId);
    const unitQuery = useUnit({courseId, unitId});
    const lessonQuery = useLesson({courseId, unitId, lessonId});
    const tasksQuery = useTasks({courseId, unitId, lessonId});
    const createTask = useCreateTask();
    const deleteLesson = useDeleteLesson();
    const deleteMedia = useDeleteLessonMedia();
    const uploadMedia = useUploadLessonMedia();

    const mediaInputRef = useRef(null);
    const [taskName, setTaskName] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMediaDelete, setConfirmMediaDelete] = useState(false);

    const handleMediaPicked = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        uploadMedia.mutate(
            {courseId, unitId, lessonId, media: file},
            {
                onSuccess: () =>
                    toaster.add({name: 'media-uploaded', theme: 'success', title: t('common.saved')}),
                onError: (error) =>
                    toaster.add({
                        name: 'media-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    // Created empty and filled in on its own page - `questions` is optional,
    // so no placeholder entry is needed.
    const submitTask = () => {
        createTask.mutate(
            {
                courseId,
                unitId,
                lessonId,
                name: taskName.trim() || undefined,
            },
            {
                onSuccess: (task) => {
                    toaster.add({name: 'task-created', theme: 'success', title: t('common.saved')});
                    setDialogOpen(false);
                    setTaskName('');
                    navigate(
                        `/admin/course/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${task.id}`
                    );
                },
                onError: (error) =>
                    toaster.add({
                        name: 'task-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    if (lessonQuery.isPending) return <LoadingState rows={6}/>;
    if (lessonQuery.isError) return <ErrorState error={lessonQuery.error} onRetry={lessonQuery.refetch}/>;
    if (!lessonQuery.data) return <ErrorState error={{response: {status: 404}}}/>;

    const lesson = lessonQuery.data;

    const columns = [
        {
            id: 'name',
            name: t('course.task'),
            template: (row) => row.name || t('course.task'),
        },
        {
            id: 'questions',
            name: t('course.questionsCount'),
            template: (row) => row.questions?.length ?? 0,
        },
        {
            id: 'contentType',
            name: t('course.contentType'),
            template: (row) => (row.contentType ? <Label size="xs">{row.contentType}</Label> : '—'),
        },
        {
            id: 'open',
            name: '',
            align: 'end',
            template: () => <ChevronRight size={16} style={{color: 'var(--g-color-text-secondary)'}}/>,
        },
    ];

    return (
        <>
            <PageHeader
                title={lesson.title}
                description={t('course.lesson')}
                backTo={`/admin/course/courses/${courseId}/units/${unitId}`}
                breadcrumbs={[
                    {title: t('course.title'), to: '/admin/course/courses'},
                    {title: courseQuery.data?.title ?? '…', to: `/admin/course/courses/${courseId}`},
                    {
                        title: unitQuery.data?.title ?? '…',
                        to: `/admin/course/courses/${courseId}/units/${unitId}`,
                    },
                    {title: lesson.title},
                ]}
                actions={
                    <Button view="outlined-danger" onClick={() => setConfirmOpen(true)}>
                        <Button.Icon>
                            <Trash2 size={16}/>
                        </Button.Icon>
                        {t('common.delete')}
                    </Button>
                }
            />

            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <PageSection title={t('course.lesson')}>
                    <LessonForm
                        key={`${lesson.title}|${lesson.description ?? ''}|${lesson.index ?? 0}`}
                        courseId={courseId}
                        unitId={unitId}
                        lessonId={lessonId}
                        initialValues={{
                            title: lesson.title ?? '',
                            description: lesson.description ?? '',
                            index: String(lesson.index ?? 0),
                        }}
                    />
                </PageSection>

                <PageSection
                    title={t('course.media')}
                    actions={
                        <div style={{display: 'flex', gap: 8}}>
                            <Button onClick={() => mediaInputRef.current?.click()} loading={uploadMedia.isPending}>
                                <Button.Icon>
                                    <Upload size={16}/>
                                </Button.Icon>
                                {lesson.media ? t('course.replaceVideo') : t('course.uploadVideo')}
                            </Button>
                            {lesson.media && (
                                <Button view="outlined-danger" onClick={() => setConfirmMediaDelete(true)}>
                                    <Button.Icon>
                                        <Trash2 size={16}/>
                                    </Button.Icon>
                                    {t('course.deleteVideo')}
                                </Button>
                            )}
                        </div>
                    }
                >
                    <input
                        ref={mediaInputRef}
                        type="file"
                        accept="video/*"
                        style={{display: 'none'}}
                        onChange={handleMediaPicked}
                    />
                    {lesson.media ? (
                        <video
                            src={cdnUrl(lesson.media)}
                            controls
                            style={{width: '100%', maxWidth: 480, borderRadius: 8}}
                        />
                    ) : (
                        <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                            {t('common.empty')}
                        </div>
                    )}
                </PageSection>

                <PageSection
                    title={t('course.tasks')}
                    actions={
                        <Button view="action" onClick={() => setDialogOpen(true)}>
                            <Button.Icon>
                                <Plus size={16}/>
                            </Button.Icon>
                            {t('course.addTask')}
                        </Button>
                    }
                >
                    <DataTable
                        query={tasksQuery}
                        rows={tasksQuery.data ?? []}
                        columns={columns}
                        onRowClick={(row) =>
                            navigate(
                                `/admin/course/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${row.id}`
                            )
                        }
                    />
                </PageSection>
            </div>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="s">
                <Dialog.Header caption={t('course.addTask')}/>
                <Dialog.Body>
                    <FormField label={t('course.taskName')} hint={t('common.optional')}>
                        <TextInput size="l" value={taskName} onUpdate={setTaskName}/>
                    </FormField>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setDialogOpen(false)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={submitTask}
                    textButtonApply={t('common.create')}
                    propsButtonApply={{loading: createTask.isPending}}
                />
            </Dialog>

            <ConfirmDialog
                open={confirmMediaDelete}
                title={t('course.deleteVideo')}
                message={t('course.deleteVideoConfirm')}
                confirmText={t('common.delete')}
                loading={deleteMedia.isPending}
                onClose={() => setConfirmMediaDelete(false)}
                onConfirm={() =>
                    deleteMedia.mutate(
                        {courseId, unitId, lessonId},
                        {
                            onSuccess: () => {
                                setConfirmMediaDelete(false);
                                toaster.add({
                                    name: 'lesson-media-deleted',
                                    theme: 'success',
                                    title: t('common.deleted'),
                                });
                            },
                            onError: (error) =>
                                toaster.add({
                                    name: 'lesson-media-delete-failed',
                                    theme: 'danger',
                                    title: extractApiErrorMessage(error, t('common.error')),
                                }),
                        }
                    )
                }
            />

            <ConfirmDialog
                open={confirmOpen}
                title={t('common.delete')}
                message={t('course.deleteLessonConfirm')}
                confirmText={t('common.delete')}
                loading={deleteLesson.isPending}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() =>
                    deleteLesson.mutate(
                        {courseId, unitId, lessonId},
                        {
                            onSuccess: () => {
                                toaster.add({
                                    name: 'lesson-deleted',
                                    theme: 'success',
                                    title: t('common.deleted'),
                                });
                                navigate(`/admin/course/courses/${courseId}/units/${unitId}`);
                            },
                            onError: (error) =>
                                toaster.add({
                                    name: 'lesson-delete-failed',
                                    theme: 'danger',
                                    title: extractApiErrorMessage(error, t('common.error')),
                                }),
                        }
                    )
                }
            />
        </>
    );
}

export default AdminLesson;
