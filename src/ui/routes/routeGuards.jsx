import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {Spin} from '@gravity-ui/uikit';
import {useEffect} from 'react';
import {useAuth} from '@/shared/auth/authContext.jsx';
import {homePathFor, isPanelRole} from '@/shared/auth/roles.js';
import {useMe} from '@/services/user/query.js';

function FullPageSpinner() {
    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
            <Spin size="l"/>
        </div>
    );
}

export function GuestRoute() {
    const {isAuthenticated, role} = useAuth();

    // A token with no recognised role must fall through to the login form.
    // Redirecting on `isAuthenticated` alone would send it to homePathFor's
    // '/login' fallback and re-enter this guard forever.
    if (isAuthenticated && isPanelRole(role)) {
        return <Navigate to={homePathFor(role)} replace/>;
    }

    return <Outlet/>;
}

// "/" belongs to whichever panel the account can actually reach.
export function RootRedirect() {
    const {isAuthenticated, role} = useAuth();
    return <Navigate to={isAuthenticated ? homePathFor(role) : '/login'} replace/>;
}

export function PrivateRoute() {
    const {isAuthenticated} = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location.pathname}}/>;
    }

    return <Outlet/>;
}

// Gates a panel on one role. The cached role (seeded from the sign-in
// response) decides immediately; `me` is the authority and re-syncs it, so a
// stale cache bounces the user on the next load rather than leaving them in a
// panel whose every request 403s.
export function RoleRoute({role}) {
    const {role: currentRole, syncRole} = useAuth();
    const me = useMe();

    useEffect(() => {
        if (me.data?.role) syncRole(me.data.role);
    }, [me.data, syncRole]);

    // The role is always cached at sign-in; a token without one (e.g. left over
    // from a student account) goes back to the login form.
    if (currentRole !== role) {
        return <Navigate to={homePathFor(currentRole)} replace/>;
    }

    return <Outlet/>;
}
