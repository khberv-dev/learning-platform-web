/* eslint-disable react-refresh/only-export-components -- context module intentionally exports both the provider and its hook */
import {createContext, useCallback, useContext, useMemo, useState} from 'react';

const STORAGE_KEY = 'themeMode';
const DEFAULT_MODE = 'light';

const ThemeModeContext = createContext(undefined);

// Light is the default: the panel is a daytime back-office tool, and the brand
// green was picked against a light background. The OS preference is
// deliberately not consulted - only an explicit in-app choice switches it.
function getInitialThemeMode() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return DEFAULT_MODE;
}

export function ThemeModeProvider({children}) {
    const [themeMode, setThemeModeState] = useState(getInitialThemeMode);

    const setThemeMode = useCallback((mode) => {
        if (mode !== 'light' && mode !== 'dark') return;
        localStorage.setItem(STORAGE_KEY, mode);
        setThemeModeState(mode);
    }, []);

    const toggleThemeMode = useCallback(() => {
        setThemeModeState((current) => {
            const next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({themeMode, setThemeMode, toggleThemeMode}),
        [themeMode, setThemeMode, toggleThemeMode]
    );

    return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
    const context = useContext(ThemeModeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within ThemeModeProvider');
    }
    return context;
}
