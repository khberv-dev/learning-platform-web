import {BrowserRouter} from 'react-router-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {ThemeProvider, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';
import {queryClient} from '@/services/query.js';
import {GRAVITY_LANG_BY_LOCALE, I18nProvider, useI18n} from '@/shared/i18n/i18nContext.jsx';
import {ThemeModeProvider, useThemeMode} from '@/shared/theme/themeModeContext.jsx';
import {AuthProvider} from '@/shared/auth/authContext.jsx';
import {toaster} from '@/shared/toaster.js';

// Reads the theme mode and locale contexts to configure Gravity UI, so both
// live in one place instead of every component threading them through.
function GravityThemeBridge({children}) {
    const {themeMode} = useThemeMode();
    const {locale} = useI18n();

    return (
        <ThemeProvider theme={themeMode} lang={GRAVITY_LANG_BY_LOCALE[locale]}>
            <ToasterProvider toaster={toaster}>
                {children}
                <ToasterComponent/>
            </ToasterProvider>
        </ThemeProvider>
    );
}

function AppProviders({children}) {
    return (
        <QueryClientProvider client={queryClient}>
            <I18nProvider>
                <ThemeModeProvider>
                    <AuthProvider>
                        <GravityThemeBridge>
                            <BrowserRouter>{children}</BrowserRouter>
                        </GravityThemeBridge>
                    </AuthProvider>
                </ThemeModeProvider>
            </I18nProvider>
        </QueryClientProvider>
    );
}

export default AppProviders;
