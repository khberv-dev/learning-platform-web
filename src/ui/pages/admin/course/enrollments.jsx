import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Label, Select} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {ENROLLMENT_STATUS, isEnrollmentExpired, useEnrollments} from '@/services/enrollment/query.js';
import {useCourses} from '@/services/course/query.js';
import {formatDate, fullName} from '@/shared/utils/format.js';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import FormField from '@/ui/components/formField.jsx';

// Read-only. Enrollments are opened from a student's own page, where the
// student is already fixed - see EnrollStudentDialog.
function AdminEnrollments() {
    const {t} = useI18n();
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [courseId, setCourseId] = useState('');
    const [status, setStatus] = useState('');
    const [expiry, setExpiry] = useState('');
    const [sort, setSort] = useState({sortBy: 'createdAt', sortOrder: 'DESC'});

    const courses = useCourses();
    const query = useEnrollments({
        page,
        limit,
        courseId,
        status,
        // The API takes a boolean; '' means "don't filter on the term at all".
        isExpired: expiry === '' ? undefined : expiry === 'expired',
        ...sort,
    });

    // Any filter change invalidates the current page number.
    const withReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const columns = [
        {
            id: 'student',
            name: t('enrollment.student'),
            template: (row) => fullName(row.student?.user) || '—',
        },
        {
            id: 'course',
            name: t('enrollment.course'),
            template: (row) => row.course?.title ?? '—',
        },
        {
            id: 'status',
            name: t('common.status'),
            meta: {sort: true},
            template: (row) => <StatusLabel status={row.status} i18nPrefix="enrollment"/>,
        },
        {
            id: 'term',
            name: t('enrollment.expiryFilter'),
            // The response no longer carries a computed `isExpired`, so it is
            // derived from `end` here - the same rule the server filters on
            // (`end < now`, active rows only). Only active rows have a term.
            template: (row) => {
                if (row.status !== ENROLLMENT_STATUS.ACTIVE) return '—';
                const expired = isEnrollmentExpired(row);
                return (
                    <Label theme={expired ? 'danger' : 'success'}>
                        {expired ? t('enrollment.expired') : t('enrollment.notExpired')}
                    </Label>
                );
            },
        },
        {
            id: 'start',
            name: t('enrollment.start'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => formatDate(row.start),
        },
        {
            id: 'end',
            name: t('enrollment.end'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => formatDate(row.end),
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
            <PageHeader title={t('enrollment.title')} description={t('enrollment.expiredNote')}/>

            <PageSection
                className="page-fill__section"
                actions={
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                        <FormField label={t('enrollment.course')}>
                            <Select
                                value={[courseId]}
                                onUpdate={([value]) => withReset(setCourseId)(value)}
                                width={200}
                                filterable
                                loading={courses.isPending}
                            >
                                <Select.Option value="">{t('common.all')}</Select.Option>
                                {(courses.data ?? []).map((course) => (
                                    <Select.Option key={course.id} value={course.id}>
                                        {course.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label={t('common.status')}>
                            <Select
                                value={[status]}
                                onUpdate={([value]) => withReset(setStatus)(value)}
                                width={170}
                            >
                                <Select.Option value="">{t('common.all')}</Select.Option>
                                <Select.Option value={ENROLLMENT_STATUS.CREATED}>
                                    {t('enrollment.statusCreated')}
                                </Select.Option>
                                <Select.Option value={ENROLLMENT_STATUS.ACTIVE}>
                                    {t('enrollment.statusActive')}
                                </Select.Option>
                                <Select.Option value={ENROLLMENT_STATUS.CANCELLED}>
                                    {t('enrollment.statusCancelled')}
                                </Select.Option>
                            </Select>
                        </FormField>

                        <FormField label={t('enrollment.expiryFilter')}>
                            <Select
                                value={[expiry]}
                                onUpdate={([value]) => withReset(setExpiry)(value)}
                                width={190}
                            >
                                <Select.Option value="">{t('enrollment.allTerms')}</Select.Option>
                                <Select.Option value="active">{t('enrollment.notExpired')}</Select.Option>
                                <Select.Option value="expired">{t('enrollment.expired')}</Select.Option>
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
                    onRowClick={(row) =>
                        row.student?.id && navigate(`/admin/users/students/${row.student.id}`)
                    }
                />
            </PageSection>
        </div>
    );
}

export default AdminEnrollments;
