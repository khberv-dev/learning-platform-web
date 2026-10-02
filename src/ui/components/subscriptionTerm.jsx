import {Label} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {formatDate} from '@/shared/utils/format.js';

// The subscription's paid term; an expired one is flagged, since nothing on
// the server ends an assignment when its subscription runs out.
function SubscriptionTerm({subscription}) {
    const {t} = useI18n();
    if (!subscription) return '—';

    const expired = subscription.end && new Date(subscription.end) <= new Date();

    return (
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'}}>
            {formatDate(subscription.start)} – {formatDate(subscription.end)}
            {expired && (
                <Label theme="danger" size="xs">
                    {t('assignment.expired')}
                </Label>
            )}
        </span>
    );
}

export default SubscriptionTerm;
