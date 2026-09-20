import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, SegmentedRadioGroup, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAuth} from '@/shared/auth/authContext.jsx';
import {useSignIn} from '@/services/auth/query.js';
import {homePathFor, isPanelRole, ROLE} from '@/shared/auth/roles.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import FormField from '@/ui/components/formField.jsx';

const PHONE_PATTERN = /^998\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;
const PHONE_PREFIX = '998';

// The mentor field has the country code pre-filled, so the user types only the
// 9 national digits, shown as `XX XXX XX XX`. A full number pasted with its
// 998 prefix is trimmed back to the national part (a bare leading 99 is a real
// operator code, so the prefix is only stripped once there are too many digits).
function formatNationalPhone(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.length > 9 && digits.startsWith(PHONE_PREFIX)) digits = digits.slice(PHONE_PREFIX.length);
    digits = digits.slice(0, 9);
    return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
        .filter(Boolean)
        .join(' ');
}

// Admins sign in with an email, mentors with a phone number.
const IDENTITY_BY_ROLE = {
    [ROLE.ADMIN]: {
        labelKey: 'auth.email',
        placeholder: 'admin@example.com',
        type: 'email',
        autoComplete: 'email',
        format: (value) => value,
        toIdentity: (value) => value.trim(),
        isValid: (value) => EMAIL_PATTERN.test(value),
    },
    [ROLE.MENTOR]: {
        labelKey: 'auth.phone',
        placeholder: '90 123 45 67',
        type: 'tel',
        autoComplete: 'tel-national',
        startContent: `+${PHONE_PREFIX}`,
        format: formatNationalPhone,
        toIdentity: (value) => `${PHONE_PREFIX}${value.replace(/\D/g, '')}`,
        isValid: (value) => PHONE_PATTERN.test(value),
    },
};

function Login() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {login} = useAuth();
    const signIn = useSignIn();
    const [role, setRole] = useState(ROLE.ADMIN);
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // The two roles take different identities, so a value typed under one tab
    // would only be wrong under the other; the password belongs to that
    // identity, so it is cleared too.
    const switchRole = (nextRole) => {
        setRole(nextRole);
        setIdentity('');
        setPassword('');
        setError(null);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);

        const field = IDENTITY_BY_ROLE[role];
        const normalized = field.toIdentity(identity);

        if (!field.isValid(normalized) || password.length < PASSWORD_MIN_LENGTH) {
            setError(t(role === ROLE.ADMIN ? 'auth.emailFormatError' : 'auth.phoneFormatError'));
            return;
        }

        signIn.mutate(
            {role, identity: normalized, password},
            {
                onSuccess: (data) => {
                    // sign-in returns the role inline. An unrecognised role has
                    // no panel here, so it's rejected before any token is
                    // persisted rather than being let in to bounce between
                    // guards.
                    if (!isPanelRole(data.role)) {
                        setError(t('auth.noRole'));
                        return;
                    }

                    login({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        role: data.role,
                    });
                    navigate(homePathFor(data.role), {replace: true});
                },
                onError: (err) => setError(extractApiErrorMessage(err, t('auth.error'))),
            }
        );
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: 24,
                background: 'var(--g-color-base-background)',
            }}
        >
            <Card view="outlined" style={{width: '100%', maxWidth: 400, padding: 32}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28}}>
                    {/* The real logo, matching the sidebar - not a stand-in
                        icon tinted with the brand colour. */}
                    <img
                        src="/brand.png"
                        alt="iTeach"
                        width={64}
                        height={64}
                        style={{display: 'block', marginBottom: 12}}
                    />
                    <h1 style={{fontSize: 20, fontWeight: 600, margin: 0}}>{t('auth.title')}</h1>
                    <p style={{fontSize: 13, color: 'var(--g-color-text-secondary)', marginTop: 6, textAlign: 'center'}}>
                        {t('auth.subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <SegmentedRadioGroup
                        size="l"
                        width="max"
                        value={role}
                        onUpdate={switchRole}
                    >
                        <SegmentedRadioGroup.Option value={ROLE.ADMIN}>{t('auth.roleAdmin')}</SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value={ROLE.MENTOR}>{t('auth.roleMentor')}</SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                    <FormField label={t(IDENTITY_BY_ROLE[role].labelKey)}>
                        <TextInput
                            size="l"
                            type={IDENTITY_BY_ROLE[role].type}
                            value={identity}
                            onUpdate={(value) => setIdentity(IDENTITY_BY_ROLE[role].format(value))}
                            placeholder={IDENTITY_BY_ROLE[role].placeholder}
                            startContent={
                                IDENTITY_BY_ROLE[role].startContent && (
                                    <span style={{paddingInlineStart: 8, color: 'var(--g-color-text-secondary)'}}>
                                        {IDENTITY_BY_ROLE[role].startContent}
                                    </span>
                                )
                            }
                            autoComplete={IDENTITY_BY_ROLE[role].autoComplete}
                        />
                    </FormField>
                    <FormField label={t('auth.password')}>
                        <TextInput
                            type="password"
                            size="l"
                            value={password}
                            onUpdate={setPassword}
                            autoComplete="current-password"
                        />
                    </FormField>

                    {error && (
                        <span style={{fontSize: 13, color: 'var(--g-color-text-danger)'}}>{error}</span>
                    )}

                    <Button type="submit" view="action" size="l" width="max" loading={signIn.isPending}>
                        {t('auth.submit')}
                    </Button>
                </form>
            </Card>
        </div>
    );
}

export default Login;
