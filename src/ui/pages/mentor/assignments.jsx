import {useState} from 'react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useMyAssignments} from '@/services/assignment/query.js';
import {formatDate} from '@/shared/utils/format.js';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import {AssignmentScheduleView} from '@/ui/components/assignmentSchedule.jsx';
import SubscriptionTerm from '@/ui/components/subscriptionTerm.jsx';

// The 1-to-1 students this mentor currently holds. Read-only - only an admin
// assigns or reassigns, and the API has no mentor detail route, so rows don't
// open anywhere.
function MentorAssignments() {
    const {t} = useI18n();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const query = useMyAssignments({page, limit});

    const columns = [
        {id: 'student', name: t('assignment.student'), template: (row) => <UserCell user={row.student}/>},
        {id: 'course', name: t('assignment.course'), template: (row) => row.subscription?.course?.title ?? '—'},
        {
            id: 'schedule',
            name: t('assignment.schedule'),
            template: (row) => <AssignmentScheduleView schedule={row.schedule}/>,
        },
        {id: 'start', name: t('assignment.start'), template: (row) => formatDate(row.start)},
        {
            id: 'subscription',
            name: t('assignment.subscription'),
            template: (row) => <SubscriptionTerm subscription={row.subscription}/>,
        },
    ];

    return (
        <div className="page-fill">
            <PageHeader title={t('assignment.myTitle')} description={t('assignment.myNote')}/>
            <PageSection className="page-fill__section">
                <DataTable
                    query={query}
                    columns={columns}
                    page={page}
                    limit={limit}
                    onPageChange={(nextPage, nextLimit) => {
                        setPage(nextPage);
                        setLimit(nextLimit);
                    }}
                    emptyTitle={t('assignment.myEmpty')}
                />
            </PageSection>
        </div>
    );
}

export default MentorAssignments;
