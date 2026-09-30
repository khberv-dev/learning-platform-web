import {useState} from 'react';
import {Dialog, Select, TextArea, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {GENDER, useCreateAuthor, useUpdateAuthor} from '@/services/author/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import {IMAGE_RULES} from '@/shared/utils/fileValidation.js';
import {useUploadProgress} from '@/shared/hooks/useUploadProgress.js';
import FormField from '@/ui/components/formField.jsx';
import FileDropCard from '@/ui/components/fileDropCard.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';

// Create when `author` is absent, edit otherwise. Callers mount this only
// while it's open, so the fields seed from `author` without an effect.
// `gender` is required by the API (no default), unlike on a mentor.
function AuthorFormDialog({author, onClose, onSaved}) {
    const {t} = useI18n();
    const isEdit = Boolean(author);
    const createAuthor = useCreateAuthor();
    const updateAuthor = useUpdateAuthor();
    const mutation = isEdit ? updateAuthor : createAuthor;
    const upload = useUploadProgress();

    const [form, setForm] = useState({
        firstName: author?.firstName ?? '',
        lastName: author?.lastName ?? '',
        gender: author?.gender ?? '',
        description: author?.description ?? '',
        avatar: null,
    });
    const [errors, setErrors] = useState({});

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const submit = () => {
        const next = {};
        if (!form.firstName.trim()) next.firstName = t('common.error');
        if (!form.lastName.trim()) next.lastName = t('common.error');
        if (!form.gender) next.gender = t('common.error');
        setErrors(next);
        if (Object.keys(next).length) return;

        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            gender: form.gender,
            // On edit an emptied box is sent as '' so the text can be cleared;
            // on create it's simply left out.
            description: form.description.trim() || (isEdit ? '' : undefined),
            avatar: form.avatar,
            onUploadProgress: upload.onUploadProgress,
        };

        mutation.mutate(isEdit ? {id: author.id, ...payload} : payload, {
            onSuccess: (data) => {
                upload.reset();
                toaster.add({name: 'author-saved', theme: 'success', title: t('common.saved')});
                onSaved?.(data);
                onClose();
            },
            onError: (error) => {
                upload.reset();
                toaster.add({
                    name: 'author-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                });
            },
        });
    };

    return (
        <Dialog open onClose={mutation.isPending ? () => {} : onClose} size="m">
            <Dialog.Header caption={isEdit ? t('author.edit') : t('author.create')}/>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16}}>
                        <FormField label={t('author.firstName')} required error={errors.firstName}>
                            <TextInput size="l" value={form.firstName} onUpdate={setField('firstName')}/>
                        </FormField>
                        <FormField label={t('author.lastName')} required error={errors.lastName}>
                            <TextInput size="l" value={form.lastName} onUpdate={setField('lastName')}/>
                        </FormField>
                    </div>
                    <FormField label={t('mentor.gender')} required error={errors.gender}>
                        <Select
                            size="l"
                            width="max"
                            value={form.gender ? [form.gender] : []}
                            onUpdate={([value]) => setField('gender')(value)}
                        >
                            <Select.Option value={GENDER.MALE}>{t('mentor.genderMale')}</Select.Option>
                            <Select.Option value={GENDER.FEMALE}>{t('mentor.genderFemale')}</Select.Option>
                        </Select>
                    </FormField>
                    <FormField label={t('author.description')} hint={t('common.optional')}>
                        <TextArea
                            size="l"
                            minRows={3}
                            value={form.description}
                            onUpdate={setField('description')}
                        />
                    </FormField>
                    <FormField label={t('author.avatar')} hint={t('common.optional')}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                            {isEdit && !form.avatar && (
                                <UserAvatar
                                    avatar={author.avatar}
                                    name={`${author.firstName} ${author.lastName}`}
                                    size="xl"
                                />
                            )}
                            <div style={{flex: 1}}>
                                <FileDropCard
                                    value={form.avatar}
                                    onChange={setField('avatar')}
                                    accept="image/png,image/jpeg"
                                    rules={IMAGE_RULES}
                                    progress={upload.progress}
                                    disabled={mutation.isPending}
                                />
                            </div>
                        </div>
                    </FormField>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                textButtonCancel={t('common.cancel')}
                onClickButtonApply={submit}
                textButtonApply={t('common.save')}
                propsButtonApply={{loading: mutation.isPending}}
                propsButtonCancel={{disabled: mutation.isPending}}
            />
        </Dialog>
    );
}

export default AuthorFormDialog;
