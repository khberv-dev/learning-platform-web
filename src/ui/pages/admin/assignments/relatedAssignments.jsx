import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAssignments} from '@/services/assignment/query.js';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {assignmentColumns} from '@/ui/pages/admin/assignments/assignmentColumns.jsx';

// A person's 1-to-1 assignments on their own admin page - the list endpoint
// filtered by `studentId` or `mentorId`, minus the column that page already
// fixes. Rows open the assignment itself.
function RelatedAssignments({studentId, mentorId}) {
    const {t} = useI18n();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const query = useAssignments({page, limit, studentId, mentorId});

    return (
        <PageSection title={t('assignment.title')}>
            <DataTable
                query={query}
                columns={assignmentColumns(t, {hide: studentId ? ['student'] : ['mentor']})}
                page={page}
                limit={limit}
                onPageChange={(nextPage, nextLimit) => {
                    setPage(nextPage);
                    setLimit(nextLimit);
                }}
                onRowClick={(row) => navigate(`/admin/assignments/${row.id}`)}
                emptyTitle={t('assignment.noneForPerson')}
            />
        </PageSection>
    );
}

export default RelatedAssignments;
