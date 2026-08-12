import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useStudents} from '@/services/student/query.js';
import {formatDate} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import UserCell from '@/ui/components/userCell.jsx';

function AdminStudents() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const query = useStudents({page, limit});

    const columns = [
        {
            id: 'user',
            name: t('student.title'),
            template: (row) => <UserCell user={row.user}/>,
        },
        {
            id: 'level',
            name: t('student.level'),
            template: (row) => (row.level ? String(row.level).toUpperCase() : '—'),
        },
        {id: 'points', name: t('student.points'), template: (row) => row.points ?? 0},
        {id: 'coins', name: t('student.coins'), template: (row) => row.coins ?? 0},
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            template: (row) => formatDate(row.createdAt),
        },
    ];

    return (
        <>
            <PageHeader title={t('student.title')}/>
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
                    onRowClick={(row) => navigate(`/admin/users/students/${row.id}`)}
                />
            </PageSection>
        </>
    );
}

export default AdminStudents;
