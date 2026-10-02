import {useState} from 'react';
import {Dialog, Switch, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCreateAdmin, useUpdateAdmin} from '@/services/admin/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import FormField from '@/ui/components/formField.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

function SwitchRow({label, hint, checked, onUpdate, disabled}) {
    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <Switch checked={checked} onUpdate={onUpdate} disabled={disabled}/>
                <span style={{fontSize: 14}}>{label}</span>
            </div>
            {hint && (
                <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)', marginTop: 4, marginLeft: 46}}>
                    {hint}
                </div>
            )}
        </div>
    );
}

// Create when `admin` is absent, edit otherwise. Mounted only while open, so
// the fields seed from `admin` without an effect.
//
// `isSelf` locks the two switches a superadmin may not flip on their own row
// (the API 400s turning off your own superadmin flag or account) - which is
// also what guarantees a superadmin always remains.
function AdminFormFields({admin, isSelf, onClose}) {
    const {t} = useI18n();
    const isEdit = Boolean(admin);
    const createAdmin = useCreateAdmin();
    const updateAdmin = useUpdateAdmin();
    const mutation = isEdit ? updateAdmin : createAdmin;

    const [form, setForm] = useState({
        firstName: admin?.firstName ?? '',
        lastName: admin?.lastName ?? '',
        email: admin?.email ?? '',
        password: '',
        isSuperadmin: admin?.isSuperadmin ?? false,
        isActive: admin?.isActive ?? true,
    });
    const [errors, setErrors] = useState({});

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const submit = () => {
        const email = form.email.trim().toLowerCase();
        const next = {};
        if (!form.firstName.trim()) next.firstName = t('common.error');
        if (!EMAIL_PATTERN.test(email)) next.email = t('admin.emailError');
        // On edit an empty password field leaves the current one alone.
        if (!isEdit && form.password.length < PASSWORD_MIN_LENGTH) next.password = t('admin.passwordError');
        if (isEdit && form.password && form.password.length < PASSWORD_MIN_LENGTH) {
            next.password = t('admin.passwordError');
        }
        setErrors(next);
        if (Object.keys(next).length) return;

        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim() || undefined,
            email,
            isSuperadmin: form.isSuperadmin,
        };
        if (form.password) payload.password = form.password;
        // Create always starts active; the DTO only takes `isActive` on update.
        if (isEdit) payload.isActive = form.isActive;

        mutation.mutate(isEdit ? {id: admin.id, ...payload} : payload, {
            onSuccess: () => {
                toaster.add({name: 'admin-saved', theme: 'success', title: t('common.saved')});
                onClose();
            },
            onError: (error) =>
                toaster.add({
                    name: 'admin-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    return (
        <>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16}}>
                        <FormField label={t('admin.firstName')} required error={errors.firstName}>
                            <TextInput size="l" value={form.firstName} onUpdate={setField('firstName')}/>
                        </FormField>
                        <FormField label={t('admin.lastName')} hint={t('common.optional')}>
                            <TextInput size="l" value={form.lastName} onUpdate={setField('lastName')}/>
                        </FormField>
                    </div>
                    <FormField label={t('admin.email')} required error={errors.email}>
                        <TextInput size="l" type="email" value={form.email} onUpdate={setField('email')}/>
                    </FormField>
                    <FormField
                        label={t('admin.password')}
                        required={!isEdit}
                        error={errors.password}
                        hint={isEdit ? t('admin.passwordKeepHint') : t('admin.passwordHint')}
                    >
                        <TextInput
                            size="l"
                            type="password"
                            autoComplete="new-password"
                            value={form.password}
                            onUpdate={setField('password')}
                        />
                    </FormField>
                    <SwitchRow
                        label={t('admin.superadmin')}
                        hint={isSelf ? t('admin.selfLockHint') : t('admin.superadminHint')}
                        checked={form.isSuperadmin}
                        onUpdate={setField('isSuperadmin')}
                        disabled={isSelf}
                    />
                    {isEdit && (
                        <SwitchRow
                            label={t('admin.accountActive')}
                            hint={isSelf ? t('admin.selfLockHint') : t('admin.accountActiveHint')}
                            checked={form.isActive}
                            onUpdate={setField('isActive')}
                            disabled={isSelf}
                        />
                    )}
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={submit}
                textButtonCancel={t('common.cancel')}
                textButtonApply={t('common.save')}
                loading={mutation.isPending}
            />
        </>
    );
}

function AdminFormDialog({open, admin, isSelf = false, onClose}) {
    const {t} = useI18n();

    return (
        <Dialog open={open} onClose={onClose} size="m">
            <Dialog.Header caption={t(admin ? 'admin.edit' : 'admin.create')}/>
            {open && <AdminFormFields admin={admin} isSelf={isSelf} onClose={onClose}/>}
        </Dialog>
    );
}

export default AdminFormDialog;
