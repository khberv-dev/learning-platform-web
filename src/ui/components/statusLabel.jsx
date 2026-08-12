import {Label} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';

// Every status enum in the API maps to one of Gravity's label themes. Grouped
// here so a status renders the same way on a list row and a detail page.
const THEMES = {
    // TeacherStatus
    active: 'success',
    fired: 'danger',
    suspended: 'warning',
    // PaymentStatus / EnrollmentStatus
    created: 'info',
    paid: 'success',
    cancelled: 'danger',
    // AssignmentStatus
    pending: 'warning',
    rejected: 'danger',
};

// For plain `isActive` booleans (courses, payment types), which have no status
// enum behind them - passing one through StatusLabel would borrow unrelated
// vocabulary like "cancelled".
export function ActiveLabel({active}) {
    const {t} = useI18n();

    return (
        <Label theme={active ? 'success' : 'unknown'}>
            {active ? t('common.active') : t('common.inactive')}
        </Label>
    );
}

function StatusLabel({status, i18nPrefix}) {
    const {t} = useI18n();

    if (!status) return '—';

    const key = String(status).toLowerCase();
    const label = i18nPrefix
        ? t(`${i18nPrefix}.status${key.charAt(0).toUpperCase()}${key.slice(1)}`)
        : key;

    return <Label theme={THEMES[key] ?? 'unknown'}>{label}</Label>;
}

export default StatusLabel;
