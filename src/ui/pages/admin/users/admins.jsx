import {useState} from 'react';
import {Button, Label, Select, TextInput} from '@gravity-ui/uikit';
import {Plus, Search} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAdmins} from '@/services/admin/query.js';
import {useMe} from '@/services/user/query.js';
import {useDebouncedValue} from '@/shared/hooks/useDebouncedValue.js';
import {formatDate} from '@/shared/utils/format.js';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import FormField from '@/ui/components/formField.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import AdminFormDialog from '@/ui/pages/admin/users/adminFormDialog.jsx';

// Admin accounts - superadmins only. Plain admins never see the nav entry,
// and a bookmarked URL lands on the no-access state instead of a 403 toast.
// There's no detail page or delete: a row opens the edit dialog, and an
// account is switched off rather than removed.
function AdminsList({me}) {
    const {t} = useI18n();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState('');
    const [kind, setKind] = useState('');
    const [active, setActive] = useState('');
    const [dialog, setDialog] = useState(null);

    // Only the request is delayed - `page` resets on the keystroke itself.
    const debouncedSearch = useDebouncedValue(search, 400);

    const query = useAdmins({
        page,
        limit,
        search: debouncedSearch,
        isSuperadmin: kind === '' ? undefined : kind === 'superadmin',
        isActive: active === '' ? undefined : active === 'active',
    });

    const withReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const columns = [
        {
            id: 'name',
            name: t('admin.name'),
            // Admins have an email and no phone, which is what UserCell shows.
            template: (row) => (
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <UserCell user={row}/>
                    {row.id === me.id && (
                        <Label theme="info" size="xs">
                            {t('admin.you')}
                        </Label>
                    )}
                </div>
            ),
        },
        {
            id: 'isSuperadmin',
            name: t('admin.role'),
            template: (row) =>
                row.isSuperadmin ? (
                    <Label theme="success">{t('admin.superadmin')}</Label>
                ) : (
                    <Label theme="normal">{t('admin.admin')}</Label>
                ),
        },
        {id: 'isActive', name: t('common.status'), template: (row) => <ActiveLabel active={row.isActive}/>},
        {id: 'createdAt', name: t('common.createdAt'), template: (row) => formatDate(row.createdAt)},
    ];

    return (
        <div className="page-fill">
            <PageHeader
                title={t('admin.title')}
                description={t('admin.note')}
                actions={
                    <Button view="action" onClick={() => setDialog({mode: 'create'})}>
                        <Button.Icon>
                            <Plus size={16}/>
                        </Button.Icon>
                        {t('admin.create')}
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
                                placeholder={t('admin.searchPlaceholder')}
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
                        <FormField label={t('admin.role')}>
                            <Select value={[kind]} onUpdate={([value]) => withReset(setKind)(value)} width={170}>
                                <Select.Option value="">{t('common.all')}</Select.Option>
                                <Select.Option value="superadmin">{t('admin.superadmin')}</Select.Option>
                                <Select.Option value="admin">{t('admin.admin')}</Select.Option>
                            </Select>
                        </FormField>
                        <FormField label={t('common.status')}>
                            <Select value={[active]} onUpdate={([value]) => withReset(setActive)(value)} width={150}>
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
                    onRowClick={(row) => setDialog({mode: 'edit', admin: row})}
                    emptyTitle={t('admin.empty')}
                />
            </PageSection>

            <AdminFormDialog
                open={Boolean(dialog)}
                admin={dialog?.admin}
                isSelf={dialog?.admin?.id === me.id}
                onClose={() => setDialog(null)}
            />
        </div>
    );
}

function AdminAdmins() {
    const meQuery = useMe();

    if (meQuery.isPending) return <LoadingState rows={6}/>;
    if (meQuery.isError) return <ErrorState error={meQuery.error} onRetry={meQuery.refetch}/>;
    if (!meQuery.data?.isSuperadmin) return <ErrorState error={{response: {status: 403}}}/>;

    return <AdminsList me={meQuery.data}/>;
}

export default AdminAdmins;
