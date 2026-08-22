import {useState} from 'react';
import {Dialog, TextInput} from '@gravity-ui/uikit';
import {useSetUserPassword} from '@/services/user/query.js';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import FormField from '@/ui/components/formField.jsx';

const PASSWORD_MIN_LENGTH = 6;

function SetUserPasswordDialog({open, userId, userName, onClose}) {
    const {t} = useI18n();
    const mutation = useSetUserPassword();
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [errors, setErrors] = useState({});

    const resetAndClose = () => {
        setPassword('');
        setConfirmation('');
        setErrors({});
        onClose();
    };

    const close = () => {
        if (!mutation.isPending) resetAndClose();
    };

    const submit = () => {
        const next = {};
        if (password.length < PASSWORD_MIN_LENGTH) next.password = t('user.passwordMinLength');
        if (confirmation !== password) next.confirmation = t('user.passwordMismatch');
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        mutation.mutate(
            {id: userId, password},
            {
                onSuccess: () => {
                    toaster.add({name: 'user-password', theme: 'success', title: t('user.passwordChanged')});
                    resetAndClose();
                },
                onError: (error) =>
                    toaster.add({
                        name: 'user-password-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    return (
        <Dialog open={open} onClose={close} size="s">
            <Dialog.Header caption={t('user.setPassword')}/>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                        {t('user.setPasswordFor', {name: userName})}
                    </div>
                    <FormField label={t('user.newPassword')} required error={errors.password}>
                        <TextInput
                            size="l"
                            type="password"
                            value={password}
                            onUpdate={setPassword}
                            autoComplete="new-password"
                        />
                    </FormField>
                    <FormField label={t('user.confirmPassword')} required error={errors.confirmation}>
                        <TextInput
                            size="l"
                            type="password"
                            value={confirmation}
                            onUpdate={setConfirmation}
                            autoComplete="new-password"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') submit();
                            }}
                        />
                    </FormField>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={close}
                onClickButtonApply={submit}
                textButtonCancel={t('common.cancel')}
                textButtonApply={t('common.save')}
                loading={mutation.isPending}
            />
        </Dialog>
    );
}

export default SetUserPasswordDialog;
