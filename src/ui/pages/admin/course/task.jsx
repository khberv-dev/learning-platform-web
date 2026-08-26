import {useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Dialog, Label, TextArea, TextInput} from '@gravity-ui/uikit';
import {ChevronRight, FileText, Plus, Trash2, Upload} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useCourse,
    useDeleteTask,
    useDeleteTaskQuestion,
    useLesson,
    useTask,
    useUnit,
    useUpdateTask,
    useUploadTaskFile,
} from '@/services/course/query.js';
import {cdnUrl} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

function TaskNameForm({base, initialName}) {
    const {t} = useI18n();
    const updateTask = useUpdateTask();
    const [name, setName] = useState(initialName);

    const submit = (event) => {
        event.preventDefault();
        updateTask.mutate(
            {...base, name: name.trim() || null},
            {
                onSuccess: () =>
                    toaster.add({name: 'task-saved', theme: 'success', title: t('common.saved')}),
                onError: (error) =>
                    toaster.add({
                        name: 'task-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    return (
        <form onSubmit={submit} style={{display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 560}}>
            <div style={{flex: 1}}>
                <FormField label={t('course.taskName')} hint={t('common.optional')}>
                    <TextInput size="l" value={name} onUpdate={setName}/>
                </FormField>
            </div>
            <Button type="submit" view="action" size="l" loading={updateTask.isPending}>
                {t('common.save')}
            </Button>
        </form>
    );
}

function AdminTask() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {courseId, unitId, lessonId, taskId} = useParams();

    const taskQuery = useTask({courseId, unitId, lessonId, taskId});
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const deleteQuestion = useDeleteTaskQuestion();
    const uploadFile = useUploadTaskFile();

    const fileInputRef = useRef(null);
    const [confirmDeleteTask, setConfirmDeleteTask] = useState(false);
    const [confirmDeleteQuestion, setConfirmDeleteQuestion] = useState(null);
    const [textDialogOpen, setTextDialogOpen] = useState(false);
    const [textContent, setTextContent] = useState('');

    const courseQuery = useCourse(courseId);
    const unitQuery = useUnit({courseId, unitId});
    const lessonQuery = useLesson({courseId, unitId, lessonId});

    const base = {courseId, unitId, lessonId, taskId};
    const coursePath = `/admin/course/courses/${courseId}`;
    const unitPath = `${coursePath}/units/${unitId}`;
    const lessonPath = `${unitPath}/lessons/${lessonId}`;
    const taskPath = `${lessonPath}/tasks/${taskId}`;

    const handleFilePicked = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        uploadFile.mutate(
            {...base, file},
            {
                onSuccess: () =>
                    toaster.add({name: 'task-file', theme: 'success', title: t('common.saved')}),
                onError: (error) =>
                    toaster.add({
                        name: 'task-file-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    const openTextDialog = () => {
        setTextContent(taskQuery.data?.contentType === 'text' ? taskQuery.data.file ?? '' : '');
        setTextDialogOpen(true);
    };

    const saveTextContent = () => {
        updateTask.mutate(
            {...base, file: textContent.trim() || null},
            {
                onSuccess: () => {
                    setTextDialogOpen(false);
                    toaster.add({name: 'task-text', theme: 'success', title: t('common.saved')});
                },
                onError: (error) =>
                    toaster.add({
                        name: 'task-text-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    if (taskQuery.isPending) return <LoadingState rows={6}/>;
    if (taskQuery.isError) return <ErrorState error={taskQuery.error} onRetry={taskQuery.refetch}/>;
    if (!taskQuery.data) return <ErrorState error={{response: {status: 404}}}/>;

    const task = taskQuery.data;
    const questions = task.questions ?? [];

    const columns = [
        {
            id: 'index',
            name: '#',
            width: 48,
            template: (row) => row.index + 1,
        },
        {
            id: 'question',
            name: t('course.question'),
            template: (row) => row.question || '—',
        },
        {
            id: 'options',
            name: t('course.options'),
            template: (row) =>
                row.options?.length ? (
                    <div style={{display: 'flex', gap: 4, flexWrap: 'wrap'}}>
                        {row.options.map((option, index) => (
                            <Label key={index} size="xs">
                                {option}
                            </Label>
                        ))}
                    </div>
                ) : (
                    '—'
                ),
        },
        {
            id: 'answer',
            name: t('course.answer'),
            template: (row) => row.answer || '—',
        },
        {
            id: 'actions',
            name: '',
            align: 'end',
            template: (row) => (
                <div style={{display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end'}}>
                    <Button
                        size="s"
                        view="flat-danger"
                        onClick={(event) => {
                            // The row itself navigates - keep the delete button
                            // from triggering that too.
                            event.stopPropagation();
                            setConfirmDeleteQuestion(row.index);
                        }}
                    >
                        <Button.Icon>
                            <Trash2 size={14}/>
                        </Button.Icon>
                    </Button>
                    <ChevronRight size={16} style={{color: 'var(--g-color-text-secondary)'}}/>
                </div>
            ),
        },
    ];

    // Index is the row identity here, since the entries carry no id.
    const rows = questions.map((question, index) => ({...question, index}));

    return (
        <>
            <PageHeader
                title={task.name || t('course.task')}
                description={t('course.task')}
                backTo={lessonPath}
                breadcrumbs={[
                    {title: t('course.title'), to: '/admin/course/courses'},
                    {title: courseQuery.data?.title ?? '…', to: coursePath},
                    {title: unitQuery.data?.title ?? '…', to: unitPath},
                    {title: lessonQuery.data?.title ?? '…', to: lessonPath},
                    {title: task.name || t('course.task')},
                ]}
                actions={
                    <Button view="outlined-danger" onClick={() => setConfirmDeleteTask(true)}>
                        <Button.Icon>
                            <Trash2 size={16}/>
                        </Button.Icon>
                        {t('common.delete')}
                    </Button>
                }
            />

            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <PageSection title={t('course.task')}>
                    <TaskNameForm key={task.name ?? ''} base={base} initialName={task.name ?? ''}/>
                </PageSection>

                <PageSection
                    title={t('course.file')}
                    description={t('course.contentType') + ': ' + (task.contentType ?? '—')}
                    actions={
                        <div style={{display: 'flex', gap: 8}}>
                            <Button onClick={openTextDialog} loading={updateTask.isPending}>
                                <Button.Icon>
                                    <FileText size={16}/>
                                </Button.Icon>
                                {task.contentType === 'text' ? t('course.editText') : t('course.addText')}
                            </Button>
                            <Button onClick={() => fileInputRef.current?.click()} loading={uploadFile.isPending}>
                                <Button.Icon>
                                    <Upload size={16}/>
                                </Button.Icon>
                                {t('course.uploadFile')}
                            </Button>
                        </div>
                    }
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,image/*"
                        style={{display: 'none'}}
                        onChange={handleFilePicked}
                    />
                    {task.file && task.contentType === 'picture' && (
                        <img
                            src={cdnUrl(task.file)}
                            alt=""
                            style={{maxWidth: 320, borderRadius: 8, display: 'block'}}
                        />
                    )}
                    {task.file && task.contentType === 'audio' && (
                        <audio src={cdnUrl(task.file)} controls style={{width: '100%', maxWidth: 320}}/>
                    )}
                    {task.file && task.contentType === 'text' && (
                        <div style={{fontSize: 14, whiteSpace: 'pre-wrap'}}>{task.file}</div>
                    )}
                    {!task.file && (
                        <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                            {t('common.empty')}
                        </div>
                    )}
                </PageSection>

                {/* "Add question" opens an empty form; the question is only
                    created once it's filled in, so no blank entry is ever
                    written - which the API rightly rejects. */}
                <PageSection
                    title={t('course.questions')}
                    actions={
                        <Button view="action" onClick={() => navigate(`${taskPath}/questions/new`)}>
                            <Button.Icon>
                                <Plus size={16}/>
                            </Button.Icon>
                            {t('course.addQuestion')}
                        </Button>
                    }
                >
                    <DataTable
                        query={taskQuery}
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => String(row.index)}
                        onRowClick={(row) => navigate(`${taskPath}/questions/${row.index}`)}
                        emptyTitle={t('course.noQuestions')}
                    />
                </PageSection>
            </div>

            <Dialog open={textDialogOpen} onClose={() => setTextDialogOpen(false)} size="m">
                <Dialog.Header caption={task.contentType === 'text' ? t('course.editText') : t('course.addText')}/>
                <Dialog.Body>
                    <FormField label={t('course.textContent')} required>
                        <TextArea
                            size="l"
                            minRows={8}
                            value={textContent}
                            onUpdate={setTextContent}
                            autoFocus
                        />
                    </FormField>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setTextDialogOpen(false)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={saveTextContent}
                    textButtonApply={t('common.save')}
                    propsButtonApply={{loading: updateTask.isPending, disabled: !textContent.trim()}}
                />
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteTask}
                title={t('common.delete')}
                message={t('course.deleteTaskConfirm')}
                confirmText={t('common.delete')}
                loading={deleteTask.isPending}
                onClose={() => setConfirmDeleteTask(false)}
                onConfirm={() =>
                    deleteTask.mutate(base, {
                        onSuccess: () => {
                            toaster.add({
                                name: 'task-deleted',
                                theme: 'success',
                                title: t('common.deleted'),
                            });
                            navigate(lessonPath);
                        },
                        onError: (error) =>
                            toaster.add({
                                name: 'task-delete-failed',
                                theme: 'danger',
                                title: extractApiErrorMessage(error, t('common.error')),
                            }),
                    })
                }
            />

            <ConfirmDialog
                open={confirmDeleteQuestion !== null}
                title={t('common.delete')}
                message={t('course.deleteQuestionConfirm')}
                confirmText={t('common.delete')}
                loading={deleteQuestion.isPending}
                onClose={() => setConfirmDeleteQuestion(null)}
                onConfirm={() =>
                    deleteQuestion.mutate(
                        {...base, index: confirmDeleteQuestion},
                        {
                            onSuccess: () => {
                                toaster.add({
                                    name: 'question-deleted',
                                    theme: 'success',
                                    title: t('common.deleted'),
                                });
                                setConfirmDeleteQuestion(null);
                            },
                            onError: (error) =>
                                toaster.add({
                                    name: 'question-delete-failed',
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

export default AdminTask;
