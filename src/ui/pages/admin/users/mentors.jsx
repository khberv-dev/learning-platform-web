import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Select, TextInput} from '@gravity-ui/uikit';
import {Plus, Search} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {MENTOR_STATUS, useMentors} from '@/services/mentor/query.js';
import {useDebouncedValue} from '@/shared/hooks/useDebouncedValue.js';
import {formatDate} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import StatusLabel, {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import FormField from '@/ui/components/formField.jsx';

function AdminMentors() {
    const {t} = useI18n();
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [active, setActive] = useState('');
    const [sort, setSort] = useState({sortBy: 'createdAt', sortOrder: 'DESC'});

    // Only the request is delayed - `page` resets on the keystroke itself
    // (below), so a search never lands on a page number the results don't have.
    const debouncedSearch = useDebouncedValue(search, 400);

    const query = useMentors({
        page,
        limit,
        search: debouncedSearch,
        status,
        isActive: active === '' ? undefined : active === 'active',
        ...sort,
    });

    // Any filter change invalidates the current page number.
    const withReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const columns = [
        {
            id: 'firstName',
            name: t('mentor.title'),
            meta: {sort: true},
            template: (row) => <UserCell user={row.user}/>,
        },
        {
            id: 'profession',
            name: t('mentor.profession'),
            meta: {sort: true},
            template: (row) => row.profession || '—',
        },
        {
            id: 'status',
            name: t('common.status'),
            meta: {sort: true},
            template: (row) => <StatusLabel status={row.status} i18nPrefix="mentor"/>,
        },
        {
            // The mentor's employment status and whether their account can sign
            // in are separate things, and both are filterable.
            id: 'isActive',
            name: t('mentor.accountStatus'),
            template: (row) => <ActiveLabel active={row.user?.isActive}/>,
        },
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => formatDate(row.createdAt),
        },
    ];

    return (
        <div className="page-fill">
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
            <PageSection
                className="page-fill__section"
                actions={
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                        <FormField label={t('common.search')}>
                            <TextInput
                                value={search}
                                onUpdate={withReset(setSearch)}
                                placeholder={t('mentor.searchPlaceholder')}
                                hasClear
                                startContent={
                                    <Search
                                        size={15}
                                        style={{marginLeft: 8, color: 'var(--g-color-text-secondary)'}}
                                    />
                                }
                                style={{width: 250}}
                            />
                        </FormField>

                        <FormField label={t('mentor.status')}>
                            <Select
                                value={[status]}
                                onUpdate={([value]) => withReset(setStatus)(value)}
                                width={180}
                            >
                                <Select.Option value="">{t('mentor.allStatuses')}</Select.Option>
                                <Select.Option value={MENTOR_STATUS.ACTIVE}>
                                    {t('mentor.statusActive')}
                                </Select.Option>
                                <Select.Option value={MENTOR_STATUS.SUSPENDED}>
                                    {t('mentor.statusSuspended')}
                                </Select.Option>
                                <Select.Option value={MENTOR_STATUS.FIRED}>
                                    {t('mentor.statusFired')}
                                </Select.Option>
                            </Select>
                        </FormField>

                        <FormField label={t('common.accountStatus')}>
                            <Select
                                value={[active]}
                                onUpdate={([value]) => withReset(setActive)(value)}
                                width={150}
                            >
                                <Select.Option value="">{t('common.all')}</Select.Option>
                                <Select.Option value="active">{t('common.active')}</Select.Option>
                                <Select.Option value="inactive">{t('common.inactive')}</Select.Option>
                            </Select>
                        </FormField>
                    </div>
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
                    sortBy={sort.sortBy}
                    sortOrder={sort.sortOrder}
                    onSortChange={(sortBy, sortOrder) => {
                        setSort({sortBy, sortOrder});
                        setPage(1);
                    }}
                    onRowClick={(row) => navigate(`/admin/users/mentors/${row.id}`)}
                />
            </PageSection>
        </div>
    );
}

export default AdminMentors;
