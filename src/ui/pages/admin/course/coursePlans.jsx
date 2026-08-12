import {useState} from 'react';
import {Button, Checkbox, Dialog, Switch, TextInput} from '@gravity-ui/uikit';
import {Plus, Trash2} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useActivatePlan,
    useCreatePlan,
    useDeactivatePlan,
    useDeletePlan,
    usePlans,
    useUpdatePlan,
} from '@/services/plan/query.js';
import {formatMoney} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import DataTable from '@/ui/components/dataTable.jsx';

const EMPTY = {title: '', price: '', month: '', hasMentor: false, isActive: true};

// A course carries no price of its own - every price/duration pair lives on a
// plan, which is also what decides whether a mentor gets attached.
function CoursePlans({courseId}) {
    const {t} = useI18n();
    const query = usePlans(courseId);
    const createPlan = useCreatePlan();
    const updatePlan = useUpdatePlan();
    const activatePlan = useActivatePlan();
    const deactivatePlan = useDeactivatePlan();
    const deletePlan = useDeletePlan();

    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const openCreate = () => {
        setForm(EMPTY);
        setDialog({mode: 'create'});
    };

    const openEdit = (plan) => {
        setForm({
            title: plan.title ?? '',
            price: String(plan.price ?? ''),
            month: String(plan.month ?? ''),
            hasMentor: Boolean(plan.hasMentor),
            isActive: Boolean(plan.isActive),
        });
        setDialog({mode: 'edit', planId: plan.id});
    };

    const handleSubmit = () => {
        const payload = {
            title: form.title.trim(),
            price: Number(form.price),
            month: Number(form.month),
            hasMentor: form.hasMentor,
            isActive: form.isActive,
        };

        if (!payload.title || !Number.isInteger(payload.price) || !Number.isInteger(payload.month)) {
            toaster.add({name: 'plan-invalid', theme: 'danger', title: t('common.error')});
            return;
        }

        const isEdit = dialog.mode === 'edit';
        const mutation = isEdit ? updatePlan : createPlan;

        mutation.mutate(
            isEdit ? {courseId, planId: dialog.planId, ...payload} : {courseId, ...payload},
            {
                onSuccess: () => {
                    toaster.add({name: 'plan-saved', theme: 'success', title: t('common.saved')});
                    setDialog(null);
                },
                onError: (error) =>
                    toaster.add({
                        name: 'plan-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    const handleToggleActive = (plan) => {
        const mutation = plan.isActive ? deactivatePlan : activatePlan;
        mutation.mutate({courseId, planId: plan.id});
    };

    const columns = [
        {id: 'title', name: t('plan.name'), template: (row) => row.title},
        {id: 'price', name: t('plan.price'), template: (row) => formatMoney(row.price)},
        {id: 'month', name: t('plan.month'), template: (row) => row.month},
        {
            id: 'hasMentor',
            name: t('plan.hasMentor'),
            template: (row) => (row.hasMentor ? t('common.yes') : t('common.no')),
        },
        {
            id: 'isActive',
            name: t('common.status'),
            template: (row) => (
                <Switch
                    checked={Boolean(row.isActive)}
                    onUpdate={() => handleToggleActive(row)}
                />
            ),
        },
        {
            id: 'actions',
            name: t('common.actions'),
            template: (row) => (
                <div style={{display: 'flex', gap: 4}}>
                    <Button size="s" onClick={() => openEdit(row)}>
                        {t('common.edit')}
                    </Button>
                    <Button
                        size="s"
                        view="flat-danger"
                        onClick={() => setConfirmDelete(row)}
                        aria-label={t('common.delete')}
                    >
                        <Button.Icon>
                            <Trash2 size={14}/>
                        </Button.Icon>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <PageSection
            title={t('plan.title')}
            actions={
                <Button view="action" onClick={openCreate}>
                    <Button.Icon>
                        <Plus size={16}/>
                    </Button.Icon>
                    {t('plan.create')}
                </Button>
            }
        >
            <DataTable query={query} rows={query.data ?? []} columns={columns}/>

            <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} size="s">
                <Dialog.Header caption={dialog?.mode === 'edit' ? t('plan.edit') : t('plan.create')}/>
                <Dialog.Body>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <FormField label={t('plan.name')} required>
                            <TextInput size="l" value={form.title} onUpdate={setField('title')}/>
                        </FormField>
                        <FormField label={t('plan.price')} required>
                            <TextInput
                                size="l"
                                type="number"
                                value={form.price}
                                onUpdate={setField('price')}
                            />
                        </FormField>
                        <FormField label={t('plan.month')} required>
                            <TextInput
                                size="l"
                                type="number"
                                value={form.month}
                                onUpdate={setField('month')}
                            />
                        </FormField>
                        <Checkbox checked={form.hasMentor} onUpdate={setField('hasMentor')}>
                            {t('plan.hasMentor')}
                        </Checkbox>
                        <Checkbox checked={form.isActive} onUpdate={setField('isActive')}>
                            {t('course.isActive')}
                        </Checkbox>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setDialog(null)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={handleSubmit}
                    textButtonApply={t('common.save')}
                    propsButtonApply={{loading: createPlan.isPending || updatePlan.isPending}}
                />
            </Dialog>

            <ConfirmDialog
                open={Boolean(confirmDelete)}
                title={t('common.delete')}
                message={confirmDelete?.title}
                confirmText={t('common.delete')}
                loading={deletePlan.isPending}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() =>
                    deletePlan.mutate(
                        {courseId, planId: confirmDelete.id},
                        {
                            onSuccess: () => {
                                toaster.add({
                                    name: 'plan-deleted',
                                    theme: 'success',
                                    title: t('common.deleted'),
                                });
                                setConfirmDelete(null);
                            },
                            onError: (error) =>
                                toaster.add({
                                    name: 'plan-delete-failed',
                                    theme: 'danger',
                                    title: extractApiErrorMessage(error, t('common.error')),
                                }),
                        }
                    )
                }
            />
        </PageSection>
    );
}

export default CoursePlans;
