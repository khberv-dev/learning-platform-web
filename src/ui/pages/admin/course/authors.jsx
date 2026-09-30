import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@gravity-ui/uikit';
import {Plus} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {GENDER, useAuthors} from '@/services/author/query.js';
import {formatDate} from '@/shared/utils/format.js';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import AuthorFormDialog from '@/ui/pages/admin/course/authorFormDialog.jsx';

// The API offers no search, filter or sort here - newest first, paged.
function AdminAuthors() {
    const {t} = useI18n();
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [creating, setCreating] = useState(false);

    const query = useAuthors({page, limit});

    const columns = [
        {
            id: 'name',
            name: t('author.name'),
            // Authors carry no phone/email, so the second line is the bio.
            template: (row) => (
                <UserCell
                    user={row}
                    secondary={
                        <span
                            style={{
                                display: 'inline-block',
                                maxWidth: 360,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'bottom',
                            }}
                        >
                            {row.description || '—'}
                        </span>
                    }
                />
            ),
        },
        {
            id: 'gender',
            name: t('mentor.gender'),
            template: (row) => t(row.gender === GENDER.FEMALE ? 'mentor.genderFemale' : 'mentor.genderMale'),
        },
        {id: 'createdAt', name: t('common.createdAt'), template: (row) => formatDate(row.createdAt)},
    ];

    return (
        <div className="page-fill">
            <PageHeader
                title={t('author.title')}
                description={t('author.note')}
                actions={
                    <Button view="action" onClick={() => setCreating(true)}>
                        <Button.Icon>
                            <Plus size={16}/>
                        </Button.Icon>
                        {t('author.create')}
                    </Button>
                }
            />
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
                    onRowClick={(row) => navigate(`/admin/course/authors/${row.id}`)}
                    emptyTitle={t('author.empty')}
                />
            </PageSection>

            {creating && (
                <AuthorFormDialog
                    onClose={() => setCreating(false)}
                    onSaved={(author) => navigate(`/admin/course/authors/${author.id}`)}
                />
            )}
        </div>
    );
}

export default AdminAuthors;
