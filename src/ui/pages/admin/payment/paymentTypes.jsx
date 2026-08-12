import {useRef, useState} from 'react';
import {Button, Checkbox, Dialog, TextInput} from '@gravity-ui/uikit';
import {Plus, Trash2} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useCreatePaymentType,
    useDeletePaymentType,
    usePaymentTypes,
    useUpdatePaymentType,
} from '@/services/payment-type/query.js';
import {cdnUrl} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import FormField from '@/ui/components/formField.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';

const EMPTY = {title: '', url: '', isActive: true, icon: null};

function AdminPaymentTypes() {
    const {t} = useI18n();
    const query = usePaymentTypes();
    const createType = useCreatePaymentType();
    const updateType = useUpdatePaymentType();
    const deleteType = useDeletePaymentType();
    const iconInputRef = useRef(null);

    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const submit = () => {
        const payload = {
            title: form.title.trim(),
            url: form.url.trim(),
            isActive: form.isActive,
            icon: form.icon,
        };

        if (!payload.title || !payload.url) {
            toaster.add({name: 'payment-type-invalid', theme: 'danger', title: t('common.error')});
            return;
        }

        const isEdit = dialog.mode === 'edit';
        const mutation = isEdit ? updateType : createType;

        mutation.mutate(isEdit ? {id: dialog.id, ...payload} : payload, {
            onSuccess: () => {
                toaster.add({name: 'payment-type-saved', theme: 'success', title: t('common.saved')});
                setDialog(null);
            },
            onError: (error) =>
                toaster.add({
                    name: 'payment-type-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    const columns = [
        {
            id: 'icon',
            name: t('paymentType.icon'),
            template: (row) =>
                row.icon ? (
                    <img
                        src={cdnUrl(row.icon)}
                        alt={row.title}
                        style={{width: 32, height: 32, objectFit: 'contain', borderRadius: 4}}
                    />
                ) : (
                    '—'
                ),
        },
        {id: 'title', name: t('paymentType.name'), template: (row) => row.title},
        {
            id: 'url',
            name: t('paymentType.url'),
            template: (row) => (
                // These are long templates full of $placeholder tokens - the
                // host is the only part worth scanning in a list. The full
                // value stays available on hover and in the edit dialog.
                <span
                    title={row.url}
                    style={{
                        display: 'inline-block',
                        maxWidth: 260,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'bottom',
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: 'var(--g-color-text-secondary)',
                    }}
                >
                    {row.url}
                </span>
            ),
        },
        {
            id: 'isActive',
            name: t('common.status'),
            template: (row) => <ActiveLabel active={row.isActive}/>,
        },
        {
            id: 'actions',
            name: t('common.actions'),
            template: (row) => (
                <div style={{display: 'flex', gap: 4}}>
                    <Button
                        size="s"
                        onClick={() => {
                            setForm({
                                title: row.title ?? '',
                                url: row.url ?? '',
                                isActive: Boolean(row.isActive),
                                icon: null,
                            });
                            setDialog({mode: 'edit', id: row.id});
                        }}
                    >
                        {t('common.edit')}
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
        <>
            <PageHeader
                title={t('paymentType.title')}
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
                        {t('paymentType.create')}
                    </Button>
                }
            />
            <PageSection>
                <DataTable query={query} rows={query.data ?? []} columns={columns}/>
            </PageSection>

            <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} size="m">
                <Dialog.Header
                    caption={dialog?.mode === 'edit' ? t('paymentType.edit') : t('paymentType.create')}
                />
                <Dialog.Body>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <FormField label={t('paymentType.name')} required>
                            <TextInput size="l" value={form.title} onUpdate={setField('title')}/>
                        </FormField>
                        <FormField label={t('paymentType.url')} required hint={t('paymentType.urlHint')}>
                            <TextInput size="l" value={form.url} onUpdate={setField('url')}/>
                        </FormField>
                        <FormField label={t('paymentType.icon')}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <Button onClick={() => iconInputRef.current?.click()}>
                                    {t('paymentType.icon')}
                                </Button>
                                <span style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                                    {form.icon?.name ?? '—'}
                                </span>
                                <input
                                    ref={iconInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{display: 'none'}}
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null;
                                        event.target.value = '';
                                        setField('icon')(file);
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
                    onClickButtonCancel={() => setDialog(null)}
                    textButtonCancel={t('common.cancel')}
                    onClickButtonApply={submit}
                    textButtonApply={t('common.save')}
                    propsButtonApply={{loading: createType.isPending || updateType.isPending}}
                />
            </Dialog>

            <ConfirmDialog
                open={Boolean(confirmDelete)}
                title={t('common.delete')}
                message={confirmDelete?.title}
                confirmText={t('common.delete')}
                loading={deleteType.isPending}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() =>
                    deleteType.mutate(confirmDelete.id, {
                        onSuccess: () => {
                            toaster.add({
                                name: 'payment-type-deleted',
                                theme: 'success',
                                title: t('common.deleted'),
                            });
                            setConfirmDelete(null);
                        },
                        onError: (error) =>
                            toaster.add({
                                name: 'payment-type-delete-failed',
                                theme: 'danger',
                                title: extractApiErrorMessage(error, t('common.error')),
                            }),
                    })
                }
            />
        </>
    );
}

export default AdminPaymentTypes;
