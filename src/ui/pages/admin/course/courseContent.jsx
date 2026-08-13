import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Dialog, TextInput} from '@gravity-ui/uikit';
import {ChevronRight, Plus} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCreateUnit} from '@/services/course/query.js';
import {toOptionalNumber} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import DataTable from '@/ui/components/dataTable.jsx';

// The units list. Editing a unit, its lessons, tasks and questions each have
// their own page - this is only the entry point into that chain.
function CourseContent({course, query}) {
    const {t} = useI18n();
    const navigate = useNavigate();
    const createUnit = useCreateUnit();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [index, setIndex] = useState('');

    const courseId = course.id;
    const units = course.units ?? [];

    // New units land at the end by default: one past the highest index in use.
    // Untouched rows all sit at 0, so the first added becomes 1, then 2...
    const nextIndex = () => Math.max(0, ...units.map((unit) => unit.index ?? 0)) + 1;

    const submit = () => {
        const value = title.trim();
        if (!value) return;

        createUnit.mutate(
            {courseId, title: value, index: toOptionalNumber(index)},
            {
                onSuccess: () => {
                    toaster.add({name: 'unit-saved', theme: 'success', title: t('common.saved')});
                    setOpen(false);
                    setTitle('');
                },
                onError: (error) =>
                    toaster.add({
                        name: 'unit-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    const columns = [
        {
            id: 'index',
            name: t('course.index'),
            width: 80,
            // The list is already server-sorted by this, so it's shown to make
            // the ordering legible rather than to sort on the client.
            template: (row) => row.index ?? 0,
        },
        {id: 'title', name: t('course.unit'), template: (row) => row.title},
        {
            id: 'lessonsCount',
            name: t('course.lessonsCount'),
            template: (row) => row.lessonsCount ?? 0,
        },
        {
            id: 'open',
            name: '',
            align: 'end',
            template: () => <ChevronRight size={16} style={{color: 'var(--g-color-text-secondary)'}}/>,
        },
    ];

    return (
        <PageSection
            title={t('course.units')}
            description={`${t('course.units')}: ${course.unitsCount ?? units.length} · ${t('course.lessonsCount')}: ${course.lessonsCount ?? 0}`}
            actions={
                <Button
                    view="action"
                    onClick={() => {
                        setTitle('');
                        setIndex(String(nextIndex()));
                        setOpen(true);
                    }}
                >
                    <Button.Icon>
                        <Plus size={16}/>
                    </Button.Icon>
                    {t('course.addUnit')}
                </Button>
            }
        >
            <DataTable
                query={query}
                rows={units}
                columns={columns}
                onRowClick={(row) => navigate(`/admin/course/courses/${courseId}/units/${row.id}`)}
            />

            <Dialog open={open} onClose={() => setOpen(false)} size="s">
                <Dialog.Header caption={t('course.addUnit')}/>
                <Dialog.Body>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <FormField label={t('course.unitTitle')} required>
                            <TextInput size="l" value={title} onUpdate={setTitle}/>
                        </FormField>
                        <FormField label={t('course.index')} hint={t('course.indexHint')}>
                            <TextInput
                                size="l"
                                type="number"
                                value={index}
                                onUpdate={setIndex}
                                controlProps={{min: 0}}
                            />
                        </FormField>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setOpen(false)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={submit}
                    textButtonApply={t('common.save')}
                    propsButtonApply={{loading: createUnit.isPending}}
                />
            </Dialog>
        </PageSection>
    );
}

export default CourseContent;
