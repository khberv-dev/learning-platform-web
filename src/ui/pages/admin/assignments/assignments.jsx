import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Select} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {ASSIGNMENT_STATUS, useAssignments} from '@/services/assignment/query.js';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import FormField from '@/ui/components/formField.jsx';
import {assignmentColumns} from '@/ui/pages/admin/assignments/assignmentColumns.jsx';

// The admin's assignment work queue: students ask for a mentor from the app,
// and each request waits here as `pending` until one is assigned - so the
// status filter starts on pending, the same way pending enrollments does.
function AdminAssignments() {
    const {t} = useI18n();
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [status, setStatus] = useState(ASSIGNMENT_STATUS.PENDING);

    const query = useAssignments({page, limit, status});

    return (
        <div className="page-fill">
            <PageHeader title={t('assignment.title')} description={t('assignment.note')}/>
            <PageSection
                className="page-fill__section"
                actions={
                    <FormField label={t('common.status')}>
                        <Select
                            value={[status]}
                            onUpdate={([value]) => {
                                setStatus(value);
                                setPage(1);
                            }}
                            width={190}
                        >
                            <Select.Option value="">{t('common.all')}</Select.Option>
                            <Select.Option value={ASSIGNMENT_STATUS.PENDING}>
                                {t('assignment.statusPending')}
                            </Select.Option>
                            <Select.Option value={ASSIGNMENT_STATUS.ACTIVE}>
                                {t('assignment.statusActive')}
                            </Select.Option>
                        </Select>
                    </FormField>
                }
            >
                <DataTable
                    query={query}
                    columns={assignmentColumns(t)}
                    page={page}
                    limit={limit}
                    onPageChange={(nextPage, nextLimit) => {
                        setPage(nextPage);
                        setLimit(nextLimit);
                    }}
                    onRowClick={(row) => navigate(`/admin/assignments/${row.id}`)}
                    emptyTitle={t('assignment.empty')}
                />
            </PageSection>
        </div>
    );
}

export default AdminAssignments;
