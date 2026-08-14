import {useState} from 'react';
import {Button, Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {Check, X} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useAcceptAssignment,
    useAssignmentHistory,
    usePendingAssignments,
    useRejectAssignment,
} from '@/services/assignment/query.js';
import {formatDate, fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import StatusLabel from '@/ui/components/statusLabel.jsx';

function MentorAssignments() {
    const {t} = useI18n();
    const [tab, setTab] = useState('pending');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

    const pending = usePendingAssignments();
    const history = useAssignmentHistory({page, limit});
    const acceptAssignment = useAcceptAssignment();
    const rejectAssignment = useRejectAssignment();

    const decide = (mutation, id, successKey) => {
        mutation.mutate(id, {
            onSuccess: () =>
                toaster.add({name: 'assignment-decided', theme: 'success', title: t(successKey)}),
            onError: (error) =>
                toaster.add({
                    name: 'assignment-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    const studentColumn = {
        id: 'student',
        name: t('assignment.student'),
        template: (row) => fullName(row.student?.user) || '—',
    };

    const periodColumn = {
        id: 'period',
        name: t('assignment.period'),
        template: (row) => `${formatDate(row.startDate)} — ${formatDate(row.endDate)}`,
    };

    const pendingColumns = [
        studentColumn,
        periodColumn,
        {
            id: 'actions',
            name: t('common.actions'),
            template: (row) => (
                <div style={{display: 'flex', gap: 6}}>
                    <Button
                        size="s"
                        view="outlined-success"
                        loading={acceptAssignment.isPending}
                        onClick={() => decide(acceptAssignment, row.id, 'assignment.accepted')}
                    >
                        <Button.Icon>
                            <Check size={14}/>
                        </Button.Icon>
                        {t('assignment.accept')}
                    </Button>
                    <Button
                        size="s"
                        view="outlined-danger"
                        loading={rejectAssignment.isPending}
                        onClick={() => decide(rejectAssignment, row.id, 'assignment.rejected')}
                    >
                        <Button.Icon>
                            <X size={14}/>
                        </Button.Icon>
                        {t('assignment.reject')}
                    </Button>
                </div>
            ),
        },
    ];

    const historyColumns = [
        studentColumn,
        {
            id: 'status',
            name: t('common.status'),
            template: (row) => <StatusLabel status={row.status} i18nPrefix="assignment"/>,
        },
        periodColumn,
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            template: (row) => formatDate(row.createdAt),
        },
    ];

    return (
        <div className="page-fill">
            <PageHeader title={t('assignment.title')}/>

            {/* The tab strip is fixed height; the active panel takes what's
                left so its table can scroll inside the card. */}
            <TabProvider value={tab} onUpdate={setTab}>
                <TabList style={{marginBottom: 16, flexShrink: 0}}>
                    <Tab value="pending">{t('assignment.pending')}</Tab>
                    <Tab value="history">{t('assignment.history')}</Tab>
                </TabList>

                <TabPanel value="pending" className="page-fill__panel">
                    <PageSection className="page-fill__section">
                        {/* `assignments/pending` returns a bare array, not a
                            paginated envelope - hence `rows`, not pagination. */}
                        <DataTable
                            query={pending}
                            rows={pending.data ?? []}
                            columns={pendingColumns}
                            emptyTitle={t('assignment.noPending')}
                        />
                    </PageSection>
                </TabPanel>

                <TabPanel value="history" className="page-fill__panel">
                    <PageSection className="page-fill__section">
                        <DataTable
                            query={history}
                            columns={historyColumns}
                            page={page}
                            limit={limit}
                            onPageChange={(nextPage, nextLimit) => {
                                setPage(nextPage);
                                setLimit(nextLimit);
                            }}
                        />
                    </PageSection>
                </TabPanel>
            </TabProvider>
        </div>
    );
}

export default MentorAssignments;
