import {useState} from 'react';
import {Button, Select} from '@gravity-ui/uikit';
import {Check, X} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    PENDING_ENROLLMENT_STATUS,
    usePendingEnrollments,
    useRejectPendingEnrollment,
} from '@/services/enrollment/query.js';
import {useCourses} from '@/services/course/query.js';
import {formatDate} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import {DEFAULT_PAGE_SIZE} from '@/shared/pagination.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import AcceptPendingEnrollmentDialog from '@/ui/pages/admin/course/acceptPendingEnrollmentDialog.jsx';

// Enrolment requests an external service (CRM, terminal) queued for approval.
// The page is a work queue, so it opens on the open ones rather than on every
// request ever made - the filter still reaches the resolved ones.
function AdminPendingEnrollments() {
    const {t} = useI18n();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [courseId, setCourseId] = useState('');
    const [status, setStatus] = useState(PENDING_ENROLLMENT_STATUS.CREATED);
    const [sort, setSort] = useState({sortBy: 'createdAt', sortOrder: 'DESC'});
    const [accepting, setAccepting] = useState(null);
    const [rejecting, setRejecting] = useState(null);

    const courses = useCourses();
    const query = usePendingEnrollments({page, limit, courseId, status, ...sort});
    const rejectPending = useRejectPendingEnrollment();

    // Any filter change invalidates the current page number.
    const withReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const confirmReject = () => {
        rejectPending.mutate(rejecting.id, {
            onSuccess: () => {
                toaster.add({
                    name: 'pending-rejected',
                    theme: 'success',
                    title: t('pendingEnrollment.rejected'),
                });
                setRejecting(null);
            },
            onError: (error) =>
                toaster.add({
                    name: 'pending-reject-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    const columns = [
        {
            id: 'student',
            name: t('pendingEnrollment.student'),
            // The request points at the user account, not the Student row, so
            // there is no student page to link to from here.
            template: (row) => <UserCell user={row.user}/>,
        },
        {
            id: 'course',
            name: t('pendingEnrollment.course'),
            template: (row) => row.course?.title ?? '—',
        },
        {
            id: 'status',
            name: t('common.status'),
            meta: {sort: true},
            template: (row) => <StatusLabel status={row.status} i18nPrefix="pendingEnrollment"/>,
        },
        {
            id: 'start',
            name: t('pendingEnrollment.start'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => formatDate(row.start),
        },
        {
            id: 'end',
            name: t('pendingEnrollment.end'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => formatDate(row.end),
        },
        {
            id: 'createdAt',
            name: t('common.createdAt'),
            meta: {sort: true, defaultSortOrder: 'desc'},
            template: (row) => formatDate(row.createdAt),
        },
        {
            id: 'actions',
            name: t('common.actions'),
            // Only an open request can be decided; a resolved one keeps its row
            // for the record.
            template: (row) => {
                if (row.status !== PENDING_ENROLLMENT_STATUS.CREATED) return null;

                return (
                    <div style={{display: 'flex', gap: 6}}>
                        <Button size="s" view="outlined-success" onClick={() => setAccepting(row)}>
                            <Button.Icon>
                                <Check size={14}/>
                            </Button.Icon>
                            {t('pendingEnrollment.accept')}
                        </Button>
                        <Button size="s" view="outlined-danger" onClick={() => setRejecting(row)}>
                            <Button.Icon>
                                <X size={14}/>
                            </Button.Icon>
                            {t('pendingEnrollment.reject')}
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="page-fill">
            <PageHeader
                title={t('pendingEnrollment.title')}
                description={t('pendingEnrollment.note')}
            />

            <PageSection
                className="page-fill__section"
                actions={
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                        <Select
                            value={[courseId]}
                            onUpdate={([value]) => withReset(setCourseId)(value)}
                            width={200}
                            filterable
                            loading={courses.isPending}
                            placeholder={t('pendingEnrollment.course')}
                        >
                            <Select.Option value="">{t('common.all')}</Select.Option>
                            {(courses.data ?? []).map((course) => (
                                <Select.Option key={course.id} value={course.id}>
                                    {course.title}
                                </Select.Option>
                            ))}
                        </Select>

                        <Select
                            value={[status]}
                            onUpdate={([value]) => withReset(setStatus)(value)}
                            width={190}
                            placeholder={t('common.status')}
                        >
                            <Select.Option value="">{t('common.all')}</Select.Option>
                            <Select.Option value={PENDING_ENROLLMENT_STATUS.CREATED}>
                                {t('pendingEnrollment.statusCreated')}
                            </Select.Option>
                            <Select.Option value={PENDING_ENROLLMENT_STATUS.ACCEPTED}>
                                {t('pendingEnrollment.statusAccepted')}
                            </Select.Option>
                            <Select.Option value={PENDING_ENROLLMENT_STATUS.REJECTED}>
                                {t('pendingEnrollment.statusRejected')}
                            </Select.Option>
                        </Select>
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
                    emptyTitle={t('pendingEnrollment.noPending')}
                />
            </PageSection>

            {/* Keyed on the request so each dialog opens with an empty plan
                rather than the previous row's. */}
            {accepting && (
                <AcceptPendingEnrollmentDialog
                    key={accepting.id}
                    open
                    pending={accepting}
                    onClose={() => setAccepting(null)}
                />
            )}

            <ConfirmDialog
                open={Boolean(rejecting)}
                title={t('pendingEnrollment.reject')}
                message={t('pendingEnrollment.rejectConfirm')}
                confirmText={t('pendingEnrollment.reject')}
                loading={rejectPending.isPending}
                onConfirm={confirmReject}
                onClose={() => setRejecting(null)}
            />
        </div>
    );
}

export default AdminPendingEnrollments;
