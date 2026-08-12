/* eslint-disable react-refresh/only-export-components -- context module intentionally exports both the provider and its hook */
import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import uz from '@/shared/i18n/locales/uz.js';
import ru from '@/shared/i18n/locales/ru.js';

const LOCALES = {uz, ru};
const DEFAULT_LOCALE = 'uz';
const STORAGE_KEY = 'locale';

// Gravity UI (and its date utils) only ship 'en'/'ru' - there is no 'uz'.
// Map our 'uz' app locale onto 'en' as the closest fallback.
export const GRAVITY_LANG_BY_LOCALE = {uz: 'en', ru: 'ru'};

export const LOCALE_OPTIONS = [
    {value: 'uz', content: "O'zbekcha"},
    {value: 'ru', content: 'Русский'},
];

const I18nContext = createContext(undefined);

function getInitialLocale() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && LOCALES[stored] ? stored : DEFAULT_LOCALE;
}

function resolveKey(dictionary, key) {
    return key.split('.').reduce((value, part) => value?.[part], dictionary);
}

function interpolate(template, vars) {
    if (!vars) return template;
    return Object.entries(vars).reduce(
        (result, [name, value]) => result.replaceAll(`{{${name}}}`, value),
        template
    );
}

export function I18nProvider({children}) {
    const [locale, setLocaleState] = useState(getInitialLocale);

    const setLocale = useCallback((nextLocale) => {
        if (!LOCALES[nextLocale]) return;
        localStorage.setItem(STORAGE_KEY, nextLocale);
        setLocaleState(nextLocale);
    }, []);

    // Falls back to the default locale before giving up and echoing the key,
    // so a key missing only from ru still renders readable Uzbek text.
    const t = useCallback(
        (key, vars) => {
            const template = resolveKey(LOCALES[locale], key) ?? resolveKey(LOCALES[DEFAULT_LOCALE], key);
            if (typeof template !== 'string') return key;
            return interpolate(template, vars);
        },
        [locale]
    );

    const value = useMemo(() => ({locale, setLocale, t}), [locale, setLocale, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}
