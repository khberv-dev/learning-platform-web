import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAuth} from '@/shared/auth/authContext.jsx';
import {useSignIn} from '@/services/auth/query.js';
import {homePathFor, primaryRole} from '@/shared/auth/roles.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import FormField from '@/ui/components/formField.jsx';

const PHONE_PATTERN = /^998\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

function Login() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {login} = useAuth();
    const signIn = useSignIn();
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);

        const normalized = identity.trim();
        const validIdentity = normalized.includes('@')
            ? EMAIL_PATTERN.test(normalized)
            : PHONE_PATTERN.test(normalized.replace(/\D/g, ''));

        if (!validIdentity || password.length < PASSWORD_MIN_LENGTH) {
            setError(t('auth.formatError'));
            return;
        }

        signIn.mutate(
            {identity: normalized, password},
            {
                onSuccess: (data) => {
                    // sign-in returns the role list inline. A student-only
                    // account has no panel here, so it's rejected before any
                    // token is persisted rather than being let in to bounce
                    // between guards.
                    if (!primaryRole(data.roles)) {
                        setError(t('auth.noRole'));
                        return;
                    }

                    login({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        roles: data.roles,
                    });
                    navigate(homePathFor(data.roles), {replace: true});
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
                    <FormField label={t('auth.identity')}>
                        <TextInput
                            size="l"
                            value={identity}
                            onUpdate={setIdentity}
                            placeholder={t('auth.identityPlaceholder')}
                            autoComplete="username"
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
