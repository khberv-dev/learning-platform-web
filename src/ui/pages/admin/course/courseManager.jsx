import {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Checkbox, TabProvider, TabList, Tab, TabPanel, TextArea, TextInput} from '@gravity-ui/uikit';
import {Trash2} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCourse, useDeleteCourse, useUpdateCourse} from '@/services/course/query.js';
import {cdnUrl} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import CourseContent from '@/ui/pages/admin/course/courseContent.jsx';
import CoursePlans from '@/ui/pages/admin/course/coursePlans.jsx';

function CourseSettings({course}) {
    const {t} = useI18n();
    const updateCourse = useUpdateCourse();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        title: course.title ?? '',
        description: course.description ?? '',
        isActive: Boolean(course.isActive),
        image: null,
    });

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const submit = (event) => {
        event.preventDefault();
        updateCourse.mutate(
            {
                id: course.id,
                title: form.title.trim(),
                description: form.description.trim(),
                isActive: form.isActive,
                image: form.image,
            },
            {
                onSuccess: () => {
                    toaster.add({name: 'course-updated', theme: 'success', title: t('course.updated')});
                    setField('image')(null);
                },
                onError: (error) =>
                    toaster.add({
                        name: 'course-update-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    // Derived rather than stored in state, so the effect below only has to
    // revoke - a local preview URL leaks a blob for the page's lifetime
    // otherwise.
    const localPreview = useMemo(
        () => (form.image ? URL.createObjectURL(form.image) : null),
        [form.image]
    );

    useEffect(() => {
        if (!localPreview) return undefined;
        return () => URL.revokeObjectURL(localPreview);
    }, [localPreview]);

    const preview = localPreview ?? cdnUrl(course.image);

    return (
        <PageSection title={t('course.edit')}>
            <form onSubmit={submit} style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560}}>
                <FormField label={t('course.name')} required>
                    <TextInput size="l" value={form.title} onUpdate={setField('title')}/>
                </FormField>
                <FormField label={t('course.description')}>
                    <TextArea size="l" minRows={4} value={form.description} onUpdate={setField('description')}/>
                </FormField>
                <FormField label={t('course.image')}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                        {preview && (
                            <img
                                src={preview}
                                alt=""
                                style={{width: 96, height: 64, objectFit: 'cover', borderRadius: 6}}
                            />
                        )}
                        <Button onClick={() => fileInputRef.current?.click()}>{t('course.image')}</Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{display: 'none'}}
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                event.target.value = '';
                                setField('image')(file);
                            }}
                        />
                    </div>
                </FormField>
                <Checkbox checked={form.isActive} onUpdate={setField('isActive')}>
                    {t('course.isActive')}
                </Checkbox>
                <div>
                    <Button type="submit" view="action" size="l" loading={updateCourse.isPending}>
                        {t('common.save')}
                    </Button>
                </div>
            </form>
        </PageSection>
    );
}

function AdminCourseManager() {
    const {t} = useI18n();
    const {id} = useParams();
    const navigate = useNavigate();
    const query = useCourse(id);
    const deleteCourse = useDeleteCourse();
    const [tab, setTab] = useState('content');
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (query.isPending) return <LoadingState rows={6}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const course = query.data;

    return (
        <>
            <PageHeader
                title={course.title}
                description={course.description}
                backTo="/admin/course/courses"
                breadcrumbs={[
                    {title: t('course.title'), to: '/admin/course/courses'},
                    {title: course.title},
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

            <TabProvider value={tab} onUpdate={setTab}>
                <TabList style={{marginBottom: 16}}>
                    <Tab value="content">{t('course.units')}</Tab>
                    <Tab value="plans">{t('plan.title')}</Tab>
                    <Tab value="settings">{t('settings.title')}</Tab>
                </TabList>
                <TabPanel value="content">
                    <CourseContent course={course} query={query}/>
                </TabPanel>
                <TabPanel value="plans">
                    <CoursePlans courseId={course.id}/>
                </TabPanel>
                <TabPanel value="settings">
                    <CourseSettings course={course}/>
                </TabPanel>
            </TabProvider>

            <ConfirmDialog
                open={confirmOpen}
                title={t('common.delete')}
                message={t('course.deleteConfirm')}
                confirmText={t('common.delete')}
                loading={deleteCourse.isPending}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() =>
                    deleteCourse.mutate(course.id, {
                        onSuccess: () => {
                            toaster.add({
                                name: 'course-deleted',
                                theme: 'success',
                                title: t('common.deleted'),
                            });
                            navigate('/admin/course/courses');
                        },
                        onError: (error) =>
                            toaster.add({
                                name: 'course-delete-failed',
                                theme: 'danger',
                                title: extractApiErrorMessage(error, t('common.error')),
                            }),
                    })
                }
            />
        </>
    );
}

export default AdminCourseManager;
