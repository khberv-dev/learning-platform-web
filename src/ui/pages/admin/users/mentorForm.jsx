import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCreateMentor, useMentor, useUpdateMentor} from '@/services/mentor/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

const PHONE_PATTERN = /^998\d{9}$/;
const PASSWORD_MIN_LENGTH = 6;

const EMPTY = {firstName: '', lastName: '', email: '', phoneNumber: '', profession: '', password: ''};

// The detail payload nests the account fields under `user`; the create and
// update DTOs take them flat.
function toFormValues(mentor) {
    if (!mentor) return EMPTY;
    return {
        firstName: mentor.user?.firstName ?? '',
        lastName: mentor.user?.lastName ?? '',
        email: mentor.user?.email ?? '',
        phoneNumber: mentor.user?.phoneNumber ?? '',
        profession: mentor.profession ?? '',
        password: '',
    };
}

function MentorFormFields({id, isEdit, initialValues}) {
    const {t} = useI18n();
    const navigate = useNavigate();
    const createMentor = useCreateMentor();
    const updateMentor = useUpdateMentor();
    const [form, setForm] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    const validate = () => {
        const next = {};
        if (!form.firstName.trim()) next.firstName = t('common.error');
        if (!PHONE_PATTERN.test(form.phoneNumber.replace(/\D/g, ''))) next.phoneNumber = t('auth.formatError');
        // On edit the password field is a deliberate no-op unless filled in -
        // an empty string would otherwise be sent and reset the account.
        if (!isEdit && form.password.length < PASSWORD_MIN_LENGTH) next.password = t('auth.formatError');
        if (isEdit && form.password && form.password.length < PASSWORD_MIN_LENGTH) {
            next.password = t('auth.formatError');
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validate()) return;

        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim() || undefined,
            email: form.email.trim() || undefined,
            phoneNumber: form.phoneNumber.replace(/\D/g, ''),
            profession: form.profession.trim() || undefined,
        };
        if (form.password) payload.password = form.password;

        const mutation = isEdit ? updateMentor : createMentor;
        mutation.mutate(isEdit ? {id, ...payload} : payload, {
            onSuccess: (data) => {
                toaster.add({
                    name: 'mentor-saved',
                    theme: 'success',
                    title: isEdit ? t('mentor.updated') : t('mentor.created'),
                });
                navigate(`/admin/users/mentors/${isEdit ? id : data.id}`);
            },
            onError: (error) => {
                toaster.add({
                    name: 'mentor-save-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                });
            },
        });
    };

    const pending = createMentor.isPending || updateMentor.isPending;

    return (
        <>
            <PageHeader
                title={isEdit ? t('mentor.edit') : t('mentor.create')}
                backTo={isEdit ? `/admin/users/mentors/${id}` : '/admin/users/mentors'}
                breadcrumbs={[
                    {title: t('mentor.title'), to: '/admin/users/mentors'},
                    ...(isEdit ? [{title: form.firstName || '…', to: `/admin/users/mentors/${id}`}] : []),
                    {title: isEdit ? t('common.edit') : t('mentor.create')},
                ]}
            />
            <PageSection style={{maxWidth: 560}}>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <FormField label={t('mentor.firstName')} required error={errors.firstName}>
                        <TextInput size="l" value={form.firstName} onUpdate={setField('firstName')}/>
                    </FormField>
                    <FormField label={t('mentor.lastName')}>
                        <TextInput size="l" value={form.lastName} onUpdate={setField('lastName')}/>
                    </FormField>
                    <FormField label={t('mentor.phone')} required error={errors.phoneNumber}>
                        <TextInput
                            size="l"
                            value={form.phoneNumber}
                            onUpdate={setField('phoneNumber')}
                            placeholder="998901234567"
                            inputMode="numeric"
                        />
                    </FormField>
                    <FormField label={t('mentor.email')}>
                        <TextInput size="l" type="email" value={form.email} onUpdate={setField('email')}/>
                    </FormField>
                    <FormField label={t('mentor.profession')}>
                        <TextInput size="l" value={form.profession} onUpdate={setField('profession')}/>
                    </FormField>
                    <FormField
                        label={t('mentor.password')}
                        required={!isEdit}
                        error={errors.password}
                        hint={isEdit ? t('common.optional') : undefined}
                    >
                        <TextInput
                            size="l"
                            type="password"
                            value={form.password}
                            onUpdate={setField('password')}
                            autoComplete="new-password"
                        />
                    </FormField>

                    <div style={{display: 'flex', gap: 8}}>
                        <Button type="submit" view="action" size="l" loading={pending}>
                            {t('common.save')}
                        </Button>
                        <Button size="l" onClick={() => navigate(-1)}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </form>
            </PageSection>
        </>
    );
}

// The fields component seeds its state straight from `initialValues`, and the
// `key` forces a fresh mount once the mentor arrives - so there's no effect
// syncing server data into form state.
function AdminMentorForm() {
    const {id} = useParams();
    const isEdit = Boolean(id);
    const mentorQuery = useMentor(id);

    if (isEdit && mentorQuery.isPending) return <LoadingState rows={6}/>;
    if (isEdit && mentorQuery.isError) {
        return <ErrorState error={mentorQuery.error} onRetry={mentorQuery.refetch}/>;
    }

    return (
        <MentorFormFields
            key={mentorQuery.data?.id ?? 'new'}
            id={id}
            isEdit={isEdit}
            initialValues={toFormValues(mentorQuery.data)}
        />
    );
}

export default AdminMentorForm;
