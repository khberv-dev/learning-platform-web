import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@gravity-ui/uikit';
import {Plus} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useMentors} from '@/services/mentor/query.js';
import {formatDate} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import UserCell from '@/ui/components/userCell.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';

function AdminMentors() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const query = useMentors({page, limit});

    const columns = [
        {
            id: 'user',
            name: t('mentor.title'),
            template: (row) => <UserCell user={row.user}/>,
        },
        {
            id: 'profession',
            name: t('mentor.profession'),
            template: (row) => row.profession || '—',
        },
        {
            id: 'status',
            name: t('common.status'),
            template: (row) => <StatusLabel status={row.status} i18nPrefix="mentor"/>,
        },
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            template: (row) => formatDate(row.createdAt),
        },
    ];

    return (
        <>
            <PageHeader
                title={t('mentor.title')}
                actions={
                    <Button view="action" onClick={() => navigate('/admin/users/mentors/new')}>
                        <Button.Icon>
                            <Plus size={16}/>
                        </Button.Icon>
                        {t('mentor.create')}
                    </Button>
                }
            />
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
                    onRowClick={(row) => navigate(`/admin/users/mentors/${row.id}`)}
                />
            </PageSection>
        </>
    );
}

export default AdminMentors;
