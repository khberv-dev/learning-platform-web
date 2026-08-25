import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Select, TextInput} from '@gravity-ui/uikit';
import {Search} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {STUDENT_LEVELS, useStudents} from '@/services/student/query.js';
import {useDebouncedValue} from '@/shared/hooks/useDebouncedValue.js';
import {formatDate, formatMoney} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import FormField from '@/ui/components/formField.jsx';

function AdminStudents() {
    const {t} = useI18n();
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('');
    const [active, setActive] = useState('');
    // Three-state API filter: true / false / null (all).
    const [hasCourse, setHasCourse] = useState(null);
    const [sort, setSort] = useState({sortBy: 'createdAt', sortOrder: 'DESC'});

    // Only the request is delayed - `page` resets on the keystroke itself
    // (below), so a search never lands on a page number the results don't have.
    const debouncedSearch = useDebouncedValue(search, 400);

    const query = useStudents({
        page,
        limit,
        search: debouncedSearch,
        level,
        isActive: active === '' ? undefined : active === 'active',
        hasCourse,
        ...sort,
    });

    // Any filter change invalidates the current page number.
    const withReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    // A column's `id` doubles as the API's `sortBy` value, so the name column
    // is keyed `firstName`. `isActive` has no sortable counterpart server-side,
    // so its header stays plain.
    const columns = [
        {
            id: 'firstName',
            name: t('student.title'),
            meta: {sort: true},
            template: (row) => <UserCell user={row.user}/>,
        },
        {
            id: 'level',
            name: t('student.level'),
            meta: {sort: true},
            template: (row) => (row.level ? String(row.level).toUpperCase() : '—'),
        },
        {
            id: 'points',
            name: t('student.points'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => row.points ?? 0,
        },
        {
            id: 'coins',
            name: t('student.coins'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => row.coins ?? 0,
        },
        {
            id: 'balance',
            name: t('student.balance'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => formatMoney(row.balance),
        },
        {
            id: 'activeCoursesCount',
            name: t('student.activeCourses'),
            template: (row) => row.activeCoursesCount ?? 0,
        },
        {
            id: 'isActive',
            name: t('common.status'),
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
            <PageHeader title={t('student.title')}/>
            <PageSection
                className="page-fill__section"
                actions={
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                        <FormField label={t('common.search')}>
                            <TextInput
                                value={search}
                                onUpdate={withReset(setSearch)}
                                placeholder={t('student.searchPlaceholder')}
                                hasClear
                                startContent={
                                    <Search
                                        size={15}
                                        style={{marginLeft: 8, color: 'var(--g-color-text-secondary)'}}
                                    />
                                }
                                style={{width: 240}}
                            />
                        </FormField>

                        <FormField label={t('student.level')}>
                            <Select value={[level]} onUpdate={([value]) => withReset(setLevel)(value)} width={160}>
                                <Select.Option value="">{t('student.allLevels')}</Select.Option>
                                {STUDENT_LEVELS.map((value) => (
                                    <Select.Option key={value} value={value}>
                                        {value}
                                    </Select.Option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label={t('common.accountStatus')}>
                            <Select value={[active]} onUpdate={([value]) => withReset(setActive)(value)} width={150}>
                                <Select.Option value="">{t('common.all')}</Select.Option>
                                <Select.Option value="active">{t('common.active')}</Select.Option>
                                <Select.Option value="inactive">{t('common.inactive')}</Select.Option>
                            </Select>
                        </FormField>

                        <FormField label={t('student.activeCourses')}>
                            <Select
                                value={[hasCourse === null ? '' : String(hasCourse)]}
                                onUpdate={([value]) => withReset(setHasCourse)(value === '' ? null : value === 'true')}
                                width={170}
                            >
                                <Select.Option value="">{t('common.all')}</Select.Option>
                                <Select.Option value="true">{t('student.withCourse')}</Select.Option>
                                <Select.Option value="false">{t('student.withoutCourse')}</Select.Option>
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
                    onRowClick={(row) => navigate(`/admin/users/students/${row.id}`)}
                />
            </PageSection>
        </div>
    );
}

export default AdminStudents;
