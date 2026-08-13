import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Dialog, TextArea, TextInput} from '@gravity-ui/uikit';
import {ChevronRight, Plus, Trash2} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useCourse,
    useCreateLesson,
    useDeleteUnit,
    useLessons,
    useUnit,
    useUpdateUnit,
} from '@/services/course/query.js';
import {toOptionalNumber} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

function UnitTitleForm({courseId, unitId, initialValues}) {
    const {t} = useI18n();
    const updateUnit = useUpdateUnit();
    const [title, setTitle] = useState(initialValues.title);
    const [index, setIndex] = useState(initialValues.index);

    const submit = (event) => {
        event.preventDefault();
        const value = title.trim();
        if (!value) return;

        updateUnit.mutate(
            {courseId, unitId, title: value, index: toOptionalNumber(index)},
            {
                onSuccess: () =>
                    toaster.add({name: 'unit-saved', theme: 'success', title: t('common.saved')}),
                onError: (error) =>
                    toaster.add({
                        name: 'unit-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    return (
        <PageSection title={t('course.unit')}>
            <form onSubmit={submit} style={{display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 620}}>
                <div style={{flex: 1}}>
                    <FormField label={t('course.unitTitle')} required>
                        <TextInput size="l" value={title} onUpdate={setTitle}/>
                    </FormField>
                </div>
                <div style={{width: 110}}>
                    <FormField label={t('course.index')}>
                        <TextInput
                            size="l"
                            type="number"
                            value={index}
                            onUpdate={setIndex}
                            controlProps={{min: 0}}
                        />
                    </FormField>
                </div>
                <Button type="submit" view="action" size="l" loading={updateUnit.isPending}>
                    {t('common.save')}
                </Button>
            </form>
        </PageSection>
    );
}

function AdminUnit() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {courseId, unitId} = useParams();

    const courseQuery = useCourse(courseId);
    const unitQuery = useUnit({courseId, unitId});
    const lessonsQuery = useLessons({courseId, unitId});
    const createLesson = useCreateLesson();
    const deleteUnit = useDeleteUnit();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({title: '', description: '', index: '', media: null});
    const [confirmOpen, setConfirmOpen] = useState(false);

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    // New lessons land at the end by default - one past the highest in use.
    const nextIndex = () =>
        Math.max(0, ...(lessonsQuery.data ?? []).map((lesson) => lesson.index ?? 0)) + 1;

    const submitLesson = () => {
        const title = form.title.trim();
        if (!title) return;

        createLesson.mutate(
            {
                courseId,
                unitId,
                title,
                description: form.description.trim() || undefined,
                index: toOptionalNumber(form.index),
                media: form.media,
            },
            {
                onSuccess: () => {
                    toaster.add({name: 'lesson-saved', theme: 'success', title: t('common.saved')});
                    setDialogOpen(false);
                    setForm({title: '', description: '', index: '', media: null});
                },
                onError: (error) =>
                    toaster.add({
                        name: 'lesson-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    if (unitQuery.isPending) return <LoadingState rows={6}/>;
    if (unitQuery.isError) return <ErrorState error={unitQuery.error} onRetry={unitQuery.refetch}/>;
    if (!unitQuery.data) return <ErrorState error={{response: {status: 404}}}/>;

    const unit = unitQuery.data;

    const columns = [
        {
            id: 'index',
            name: t('course.index'),
            width: 80,
            template: (row) => row.index ?? 0,
        },
        {id: 'title', name: t('course.lesson'), template: (row) => row.title},
        {
            id: 'description',
            name: t('course.description'),
            template: (row) => row.description || '—',
        },
        {
            id: 'media',
            name: t('course.media'),
            template: (row) => (row.media ? t('common.yes') : t('common.no')),
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
                title={unit.title}
                description={t('course.unit')}
                backTo={`/admin/course/courses/${courseId}`}
                breadcrumbs={[
                    {title: t('course.title'), to: '/admin/course/courses'},
                    {title: courseQuery.data?.title ?? '…', to: `/admin/course/courses/${courseId}`},
                    {title: unit.title},
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
                {/* Keyed on the loaded values so the fields re-seed if the unit
                    changes elsewhere, without an effect syncing state. */}
                <UnitTitleForm
                    key={`${unit.title}|${unit.index ?? 0}`}
                    courseId={courseId}
                    unitId={unitId}
                    initialValues={{title: unit.title ?? '', index: String(unit.index ?? 0)}}
                />

                <PageSection
                    title={t('course.lessons')}
                    actions={
                        <Button
                            view="action"
                            onClick={() => {
                                setForm({title: '', description: '', index: String(nextIndex()), media: null});
                                setDialogOpen(true);
                            }}
                        >
                            <Button.Icon>
                                <Plus size={16}/>
                            </Button.Icon>
                            {t('course.addLesson')}
                        </Button>
                    }
                >
                    <DataTable
                        query={lessonsQuery}
                        rows={lessonsQuery.data ?? []}
                        columns={columns}
                        onRowClick={(row) =>
                            navigate(
                                `/admin/course/courses/${courseId}/units/${unitId}/lessons/${row.id}`
                            )
                        }
                    />
                </PageSection>
            </div>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="m">
                <Dialog.Header caption={t('course.addLesson')}/>
                <Dialog.Body>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <FormField label={t('course.lessonTitle')} required>
                            <TextInput size="l" value={form.title} onUpdate={setField('title')}/>
                        </FormField>
                        <FormField label={t('course.description')}>
                            <TextArea
                                size="l"
                                minRows={3}
                                value={form.description}
                                onUpdate={setField('description')}
                            />
                        </FormField>
                        <FormField label={t('course.index')} hint={t('course.indexHint')}>
                            <TextInput
                                size="l"
                                type="number"
                                value={form.index}
                                onUpdate={setField('index')}
                                controlProps={{min: 0}}
                            />
                        </FormField>
                        <FormField label={t('course.media')} hint={t('common.optional')}>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(event) => setField('media')(event.target.files?.[0] ?? null)}
                            />
                        </FormField>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setDialogOpen(false)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={submitLesson}
                    textButtonApply={t('common.save')}
                    propsButtonApply={{loading: createLesson.isPending}}
                />
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                title={t('common.delete')}
                message={t('course.deleteUnitConfirm')}
                confirmText={t('common.delete')}
                loading={deleteUnit.isPending}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() =>
                    deleteUnit.mutate(
                        {courseId, unitId},
                        {
                            onSuccess: () => {
                                toaster.add({
                                    name: 'unit-deleted',
                                    theme: 'success',
                                    title: t('common.deleted'),
                                });
                                navigate(`/admin/course/courses/${courseId}`);
                            },
                            onError: (error) =>
                                toaster.add({
                                    name: 'unit-delete-failed',
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

export default AdminUnit;
