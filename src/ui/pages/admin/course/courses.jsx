import {useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Checkbox, Dialog, TextArea, TextInput} from '@gravity-ui/uikit';
import {ImageIcon, Plus} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCourses, useCreateCourse} from '@/services/course/query.js';
import {cdnUrl, formatDate} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import FormField from '@/ui/components/formField.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';

// A small thumbnail keeps the visual cue the card grid gave, without the grid.
function CourseThumb({course}) {
    const image = cdnUrl(course.image);

    return (
        <div
            style={{
                width: 56,
                height: 38,
                borderRadius: 6,
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--g-color-base-generic)',
                color: 'var(--g-color-text-secondary)',
            }}
        >
            {image ? (
                <img
                    src={image}
                    alt=""
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                />
            ) : (
                <ImageIcon size={16}/>
            )}
        </div>
    );
}

function AdminCourses() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const query = useCourses();
    const createCourse = useCreateCourse();
    const fileInputRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({title: '', description: '', isActive: true, image: null});

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const handleCreate = () => {
        if (!form.title.trim()) return;

        createCourse.mutate(
            {
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                isActive: form.isActive,
                image: form.image,
            },
            {
                onSuccess: (data) => {
                    toaster.add({name: 'course-created', theme: 'success', title: t('course.created')});
                    setOpen(false);
                    setForm({title: '', description: '', isActive: true, image: null});
                    navigate(`/admin/course/courses/${data.id}`);
                },
                onError: (error) =>
                    toaster.add({
                        name: 'course-create-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    const columns = [
        {
            id: 'title',
            name: t('course.name'),
            template: (row) => (
                <div style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0}}>
                    <CourseThumb course={row}/>
                    <div style={{minWidth: 0}}>
                        <div style={{fontWeight: 500}}>{row.title}</div>
                        <div
                            style={{
                                fontSize: 12,
                                color: 'var(--g-color-text-secondary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 420,
                            }}
                        >
                            {row.description || '—'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'unitsCount',
            name: t('course.units'),
            // The list response carries counts only - no units array to length.
            template: (row) => row.unitsCount ?? 0,
        },
        {
            id: 'lessonsCount',
            name: t('course.lessonsCount'),
            template: (row) => row.lessonsCount ?? 0,
        },
        {
            id: 'isActive',
            name: t('common.status'),
            template: (row) => <ActiveLabel active={row.isActive}/>,
        },
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            template: (row) => formatDate(row.createdAt),
        },
    ];

    return (
        <>
            <PageHeader
                title={t('course.title')}
                actions={
                    <Button view="action" onClick={() => setOpen(true)}>
                        <Button.Icon>
                            <Plus size={16}/>
                        </Button.Icon>
                        {t('course.create')}
                    </Button>
                }
            />

            <PageSection>
                {/* admin/courses returns a bare array, not a paginated envelope. */}
                <DataTable
                    query={query}
                    rows={query.data ?? []}
                    columns={columns}
                    onRowClick={(row) => navigate(`/admin/course/courses/${row.id}`)}
                />
            </PageSection>

            <Dialog open={open} onClose={() => setOpen(false)} size="m">
                <Dialog.Header caption={t('course.create')}/>
                <Dialog.Body>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <FormField label={t('course.name')} required>
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
                        <FormField label={t('course.image')}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <Button onClick={() => fileInputRef.current?.click()}>
                                    {t('course.image')}
                                </Button>
                                <span style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                                    {form.image?.name ?? '—'}
                                </span>
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
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setOpen(false)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={handleCreate}
                    textButtonApply={t('common.save')}
                    propsButtonApply={{loading: createCourse.isPending}}
                />
            </Dialog>
        </>
    );
}

export default AdminCourses;
