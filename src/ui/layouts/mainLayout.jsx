import {useState} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAuth} from '@/shared/auth/authContext.jsx';
import {ROLE} from '@/shared/auth/roles.js';
import {useMe} from '@/services/user/query.js';
import {fullName} from '@/shared/utils/format.js';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import Sidebar from '@/ui/layouts/sidebar.jsx';
import {activePath, NAV_BY_ROLE, settingsPath} from '@/ui/layouts/navConfig.js';

function MainLayout({role}) {
    const [logoutOpen, setLogoutOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {t} = useI18n();
    const {logout} = useAuth();
    const {data: me} = useMe();

    const items = NAV_BY_ROLE[role] ?? [];
    const name = fullName(me) || me?.phoneNumber || '';

    return (
        <div style={{display: 'flex', minHeight: '100vh'}}>
            <Sidebar
                items={items}
                activeItemPath={activePath(items, location.pathname)}
                roleLabel={role === ROLE.ADMIN ? 'Admin' : 'Mentor'}
                user={me}
                userName={name}
                onLogout={() => setLogoutOpen(true)}
                onOpenSettings={() => navigate(settingsPath(items))}
            />

            <main style={{flex: 1, minWidth: 0, overflowX: 'hidden'}}>
                <div style={{padding: 24, maxWidth: 1440, margin: '0 auto'}}>
                    <Outlet/>
                </div>
            </main>

            <ConfirmDialog
                open={logoutOpen}
                title={t('auth.logoutConfirm')}
                confirmText={t('auth.logout')}
                onConfirm={logout}
                onClose={() => setLogoutOpen(false)}
            />
        </div>
    );
}

export default MainLayout;
