import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Select, TextInput} from '@gravity-ui/uikit';
import {Plus, Search} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useGroups} from '@/services/group/query.js';
import {useDebouncedValue} from '@/shared/hooks/useDebouncedValue.js';
import {formatDate} from '@/shared/utils/format.js';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import FormField from '@/ui/components/formField.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import {GroupScheduleDays} from '@/ui/components/groupSchedule.jsx';
import GroupFormDialog from '@/ui/pages/admin/groups/groupFormDialog.jsx';

function AdminGroups() {
    const {t} = useI18n();
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState('');
    const [active, setActive] = useState('');
    const [sort, setSort] = useState({sortBy: 'createdAt', sortOrder: 'DESC'});
    const [createOpen, setCreateOpen] = useState(false);

    // Only the request is delayed - `page` resets on the keystroke itself.
    const debouncedSearch = useDebouncedValue(search, 400);

    const query = useGroups({
        page,
        limit,
        search: debouncedSearch,
        isActive: active === '' ? undefined : active === 'active',
        ...sort,
    });

    const withReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const columns = [
        {
            id: 'title',
            name: t('group.name'),
            meta: {sort: true},
            template: (row) => <span style={{fontWeight: 500}}>{row.title}</span>,
        },
        {
            id: 'primaryMentor',
            name: t('group.mentor'),
            template: (row) => <UserCell user={row.primaryMentor}/>,
        },
        {
            id: 'schedule',
            name: t('group.schedule'),
            template: (row) => <GroupScheduleDays value={row.schedule}/>,
        },
        {
            id: 'isActive',
            name: t('common.status'),
            template: (row) => <ActiveLabel active={row.isActive}/>,
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
                title={t('group.title')}
                actions={
                    <Button view="action" onClick={() => setCreateOpen(true)}>
                        <Button.Icon>
                            <Plus size={16}/>
                        </Button.Icon>
                        {t('group.create')}
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
                                placeholder={t('group.searchPlaceholder')}
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

                        <FormField label={t('common.status')}>
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
                    onRowClick={(row) => navigate(`/admin/groups/${row.id}`)}
                />
            </PageSection>

            <GroupFormDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSaved={(group) => navigate(`/admin/groups/${group.id}`)}
            />
        </div>
    );
}

export default AdminGroups;
