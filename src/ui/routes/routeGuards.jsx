import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {Spin} from '@gravity-ui/uikit';
import {useEffect} from 'react';
import {useAuth} from '@/shared/auth/authContext.jsx';
import {homePathFor, primaryRole} from '@/shared/auth/roles.js';
import {useMe} from '@/services/user/query.js';

function FullPageSpinner() {
    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
            <Spin size="l"/>
        </div>
    );
}

export function GuestRoute() {
    const {isAuthenticated, roles} = useAuth();

    // A token whose account has no panel role (a student's, or a role revoked
    // server-side) must fall through to the login form. Redirecting on
    // `isAuthenticated` alone would send it to homePathFor's '/login' fallback
    // and re-enter this guard forever.
    if (isAuthenticated && primaryRole(roles)) {
        return <Navigate to={homePathFor(roles)} replace/>;
    }

    return <Outlet/>;
}

// "/" belongs to whichever panel the account can actually reach.
export function RootRedirect() {
    const {isAuthenticated, roles} = useAuth();
    return <Navigate to={isAuthenticated ? homePathFor(roles) : '/login'} replace/>;
}

export function PrivateRoute() {
    const {isAuthenticated} = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location.pathname}}/>;
    }

    return <Outlet/>;
}

// Gates a panel on one role. The cached role list (seeded from the sign-in
// response) decides immediately; `user/me` is the authority and re-syncs it, so
// a role revoked server-side bounces the user on the next load rather than
// leaving them in a panel whose every request 403s.
export function RoleRoute({role}) {
    const {roles, syncRoles} = useAuth();
    const me = useMe();

    useEffect(() => {
        if (me.data?.roles) syncRoles(me.data.roles);
    }, [me.data, syncRoles]);

    // No cached roles yet (e.g. a hard refresh into a deep link before me
    // resolves) - wait rather than guessing wrong and bouncing to /login.
    if (roles.length === 0 && me.isPending) {
        return <FullPageSpinner/>;
    }

    if (!roles.includes(role)) {
        const target = primaryRole(roles) ? homePathFor(roles) : '/login';
        return <Navigate to={target} replace/>;
    }

    return <Outlet/>;
}
