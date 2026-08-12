import {useState} from 'react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAssignments} from '@/services/assignment/query.js';
import {formatDate, fullName} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import StatusLabel from '@/ui/components/statusLabel.jsx';

// Admins get a read-only view of every student↔mentor pairing; accepting and
// rejecting is the mentor's call, on their own page.
function AdminAssignments() {
    const {t} = useI18n();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const query = useAssignments({page, limit});

    const columns = [
        {
            id: 'student',
            name: t('assignment.student'),
            template: (row) => fullName(row.student?.user) || '—',
        },
        {
            id: 'mentor',
            name: t('assignment.mentor'),
            template: (row) => fullName(row.teacher?.user) || '—',
        },
        {
            id: 'status',
            name: t('common.status'),
            template: (row) => <StatusLabel status={row.status} i18nPrefix="assignment"/>,
        },
        {
            id: 'period',
            name: t('assignment.period'),
            template: (row) => `${formatDate(row.startDate)} — ${formatDate(row.endDate)}`,
        },
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            template: (row) => formatDate(row.createdAt),
        },
    ];

    return (
        <>
            <PageHeader title={t('assignment.title')}/>
            <PageSection>
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
        </>
    );
}

export default AdminAssignments;
