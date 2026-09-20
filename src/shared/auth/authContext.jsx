/* eslint-disable react-refresh/only-export-components -- context module intentionally exports both the provider and its hook */
import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {isPanelRole, ROLE} from '@/shared/auth/roles.js';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ROLE_KEY = 'role';

const AuthContext = createContext(undefined);

function getInitialAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// sign-in returns the role alongside the tokens, so it's cached here to let
// the route guards pick a panel on the very first render instead of flashing a
// redirect while `me` is still in flight. `me` remains authoritative - see
// syncRole below.
function getInitialRole() {
    const stored = localStorage.getItem(ROLE_KEY);
    return isPanelRole(stored) ? stored : null;
}

export function AuthProvider({children}) {
    const [accessToken, setAccessToken] = useState(getInitialAccessToken);
    const [role, setRole] = useState(getInitialRole);

    const login = useCallback(({accessToken: nextAccessToken, refreshToken, role: nextRole}) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(ROLE_KEY, nextRole);
        setAccessToken(nextAccessToken);
        setRole(nextRole);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        setAccessToken(null);
        setRole(null);
    }, []);

    // Reconciles the cached role with what `me` reports.
    const syncRole = useCallback((nextRole) => {
        if (!isPanelRole(nextRole)) return;
        setRole((current) => {
            if (current === nextRole) return current;
            localStorage.setItem(ROLE_KEY, nextRole);
            return nextRole;
        });
    }, []);

    const value = useMemo(
        () => ({
            isAuthenticated: Boolean(accessToken),
            role,
            isAdmin: role === ROLE.ADMIN,
            isMentor: role === ROLE.MENTOR,
            login,
            logout,
            syncRole,
        }),
        [accessToken, role, login, logout, syncRole]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
