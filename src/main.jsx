import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
// After Gravity's own styles - it overrides their brand tokens.
import './theme.css';
import './index.css';
import {createRoot} from 'react-dom/client';
import App from '@/app.jsx';
import AppProviders from '@/shared/providers/appProviders.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
    <AppProviders>
        <App/>
    </AppProviders>
);
