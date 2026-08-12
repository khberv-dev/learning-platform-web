import {Button} from '@gravity-ui/uikit';
import {useNavigate} from 'react-router-dom';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAuth} from '@/shared/auth/authContext.jsx';
import {homePathFor} from '@/shared/auth/roles.js';

function NotFound() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {roles, isAuthenticated} = useAuth();

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                minHeight: '100vh',
            }}
        >
            <div style={{fontSize: 48, fontWeight: 600}}>404</div>
            <div style={{color: 'var(--g-color-text-secondary)'}}>{t('common.notFound')}</div>
            <Button
                view="action"
                onClick={() => navigate(isAuthenticated ? homePathFor(roles) : '/login')}
            >
                {t('common.back')}
            </Button>
        </div>
    );
}

export default NotFound;
