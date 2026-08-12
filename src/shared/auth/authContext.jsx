/* eslint-disable react-refresh/only-export-components -- context module intentionally exports both the provider and its hook */
import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {primaryRole, ROLE} from '@/shared/auth/roles.js';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ROLES_KEY = 'roles';

const AuthContext = createContext(undefined);

function getInitialAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// sign-in returns the role list alongside the tokens, so it's cached here to
// let the route guards pick a panel on the very first render instead of
// flashing a redirect while `user/me` is still in flight. `user/me` remains
// authoritative - see syncRoles below.
function getInitialRoles() {
    try {
        const stored = JSON.parse(localStorage.getItem(ROLES_KEY));
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
}

export function AuthProvider({children}) {
    const [accessToken, setAccessToken] = useState(getInitialAccessToken);
    const [roles, setRoles] = useState(getInitialRoles);

    const login = useCallback(({accessToken: nextAccessToken, refreshToken, roles: nextRoles = []}) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(ROLES_KEY, JSON.stringify(nextRoles));
        setAccessToken(nextAccessToken);
        setRoles(nextRoles);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(ROLES_KEY);
        setAccessToken(null);
        setRoles([]);
    }, []);

    // Reconciles the cached list with what `user/me` reports, so a role granted
    // or revoked server-side takes effect without forcing a re-login. Compared
    // as sorted JSON to avoid an update loop on an equal-but-new array.
    const syncRoles = useCallback((nextRoles) => {
        if (!Array.isArray(nextRoles)) return;
        setRoles((current) => {
            const same = JSON.stringify([...current].sort()) === JSON.stringify([...nextRoles].sort());
            if (same) return current;
            localStorage.setItem(ROLES_KEY, JSON.stringify(nextRoles));
            return nextRoles;
        });
    }, []);

    const value = useMemo(
        () => ({
            isAuthenticated: Boolean(accessToken),
            roles,
            role: primaryRole(roles),
            isAdmin: roles.includes(ROLE.ADMIN),
            isMentor: roles.includes(ROLE.MENTOR),
            login,
            logout,
            syncRoles,
        }),
        [accessToken, roles, login, logout, syncRoles]
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
