import {Alert, Button, Skeleton} from '@gravity-ui/uikit';
import {Inbox} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {extractApiErrorMessage, isForbiddenError} from '@/shared/utils/apiError.js';

export function LoadingState({rows = 4}) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {Array.from({length: rows}).map((_, index) => (
                <Skeleton key={index} style={{height: 40}}/>
            ))}
        </div>
    );
}

export function EmptyState({title, description}) {
    const {t} = useI18n();

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '48px 16px',
                color: 'var(--g-color-text-secondary)',
            }}
        >
            <Inbox size={32}/>
            <div style={{fontSize: 15, fontWeight: 500}}>{title ?? t('common.empty')}</div>
            {description && <div style={{fontSize: 13}}>{description}</div>}
        </div>
    );
}

// A 403 here means the role guard rejected the route, which a retry can never
// fix - so it gets its own copy and no retry button.
export function ErrorState({error, onRetry}) {
    const {t} = useI18n();

    if (isForbiddenError(error)) {
        return <Alert theme="warning" title={t('common.noAccess')}/>;
    }

    return (
        <Alert
            theme="danger"
            title={t('common.error')}
            message={extractApiErrorMessage(error, t('common.error'))}
            actions={onRetry ? <Button onClick={onRetry}>{t('common.retry')}</Button> : undefined}
        />
    );
}

// The list-page trio in one place: skeleton while loading, error alert on
// failure, empty state when the response has no rows.
export function QueryState({query, isEmpty, emptyTitle, children, rows}) {
    if (query.isPending) return <LoadingState rows={rows}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;
    if (isEmpty) return <EmptyState title={emptyTitle}/>;
    return children;
}
