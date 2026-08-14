import {useState} from 'react';
import {Alert, Select} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {PAYMENT_STATUS, usePayments} from '@/services/payment/query.js';
import {cdnUrl, formatDateTime, formatMoney, fullName} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import StatusLabel from '@/ui/components/statusLabel.jsx';

// A payment type is recognised by its logo first, so the icon leads and the
// title follows. Pending payments have no type attached yet, and a type may
// have been created without an icon - both fall back rather than leaving a gap.
function PaymentTypeCell({paymentType}) {
    if (!paymentType) return '—';

    const icon = cdnUrl(paymentType.icon);

    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
            {icon && (
                <img
                    src={icon}
                    alt=""
                    style={{
                        width: 20,
                        height: 20,
                        objectFit: 'contain',
                        borderRadius: 4,
                        flexShrink: 0,
                    }}
                />
            )}
            <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {paymentType.title ?? '—'}
            </span>
        </div>
    );
}

// Read-only by design - see the note rendered at the top of the page.
function AdminPayments() {
    const {t} = useI18n();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [status, setStatus] = useState('');
    const query = usePayments({page, limit, status});

    const columns = [
        {
            id: 'user',
            name: t('payment.user'),
            template: (row) => fullName(row.user) || '—',
        },
        {
            id: 'course',
            name: t('payment.course'),
            template: (row) => row.enrollment?.course?.title ?? '—',
        },
        {
            id: 'amount',
            name: t('payment.amount'),
            template: (row) => formatMoney(row.amount),
        },
        {
            id: 'paymentType',
            name: t('payment.type'),
            template: (row) => <PaymentTypeCell paymentType={row.paymentType}/>,
        },
        {
            id: 'status',
            name: t('common.status'),
            template: (row) => <StatusLabel status={row.status} i18nPrefix="payment"/>,
        },
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            template: (row) => formatDateTime(row.createdAt),
        },
    ];

    return (
        <div className="page-fill">
            <PageHeader title={t('payment.title')}/>

            <Alert theme="info" message={t('payment.readOnlyNote')} style={{marginBottom: 16}}/>

            <PageSection
                className="page-fill__section"
                actions={
                    <Select
                        value={[status]}
                        onUpdate={([value]) => {
                            setStatus(value);
                            setPage(1);
                        }}
                        width={200}
                        placeholder={t('common.all')}
                    >
                        <Select.Option value="">{t('common.all')}</Select.Option>
                        <Select.Option value={PAYMENT_STATUS.CREATED}>
                            {t('payment.statusCreated')}
                        </Select.Option>
                        <Select.Option value={PAYMENT_STATUS.PAID}>
                            {t('payment.statusPaid')}
                        </Select.Option>
                        <Select.Option value={PAYMENT_STATUS.CANCELLED}>
                            {t('payment.statusCancelled')}
                        </Select.Option>
                    </Select>
                }
            >
                <DataTable
                    query={query}
                    columns={columns}
                    page={page}
                    limit={limit}
                    onPageChange={(nextPage, nextLimit) => {
                        setPage(nextPage);
                        setLimit(nextLimit);
                    }}
                />
            </PageSection>
        </div>
    );
}

export default AdminPayments;
