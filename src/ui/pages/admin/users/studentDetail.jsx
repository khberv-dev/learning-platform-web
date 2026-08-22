import {useState} from 'react';
import {useParams} from 'react-router-dom';
import {Button, Table} from '@gravity-ui/uikit';
import {KeyRound, Plus} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useStudent} from '@/services/student/query.js';
import {formatDate, formatMoney, formatPhone, fullName} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import EnrollStudentDialog from '@/ui/pages/admin/users/enrollStudentDialog.jsx';
import SetUserPasswordDialog from '@/ui/pages/admin/users/setUserPasswordDialog.jsx';

function AdminStudentDetail() {
    const {t} = useI18n();
    const {id} = useParams();
    const query = useStudent(id);
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    if (query.isPending) return <LoadingState rows={6}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const student = query.data;
    const name = fullName(student.user);

    const enrollmentColumns = [
        {
            id: 'course',
            name: t('enrollment.course'),
            template: (row) => row.course?.title ?? '—',
        },
        {
            id: 'status',
            name: t('common.status'),
            template: (row) => <StatusLabel status={row.status} i18nPrefix="enrollment"/>,
        },
        {id: 'start', name: t('enrollment.start'), template: (row) => formatDate(row.start)},
        {id: 'end', name: t('enrollment.end'), template: (row) => formatDate(row.end)},
    ];

    return (
        <>
            <PageHeader
                title={name}
                description={t('student.profile')}
                backTo="/admin/users/students"
                breadcrumbs={[
                    {title: t('student.title'), to: '/admin/users/students'},
                    {title: name},
                ]}
                actions={
                    <div style={{display: 'flex', gap: 8}}>
                        <Button onClick={() => setPasswordOpen(true)}>
                            <Button.Icon>
                                <KeyRound size={16}/>
                            </Button.Icon>
                            {t('user.setPassword')}
                        </Button>
                        <Button view="action" onClick={() => setEnrollOpen(true)}>
                            <Button.Icon>
                                <Plus size={16}/>
                            </Button.Icon>
                            {t('enrollment.create')}
                        </Button>
                    </div>
                }
            />

            <PageSection style={{marginBottom: 16}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <UserAvatar avatar={student.user?.avatar} name={name} size="xl"/>
                    <div>
                        <div style={{fontSize: 16, fontWeight: 600}}>{name}</div>
                        <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                            {formatPhone(student.user?.phoneNumber)}
                            {student.user?.email ? ` · ${student.user.email}` : ''}
                        </div>
                    </div>
                </div>
            </PageSection>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16,
                    marginBottom: 16,
                }}
            >
                <StatCard label={t('student.level')} value={String(student.level ?? '—').toUpperCase()}/>
                <StatCard label={t('student.points')} value={student.points ?? 0}/>
                <StatCard label={t('student.coins')} value={student.coins ?? 0}/>
                <StatCard label={t('student.balance')} value={formatMoney(student.balance)}/>
            </div>

            <PageSection title={t('student.enrollments')}>
                {student.enrollments?.length ? (
                    <Table
                        data={student.enrollments}
                        columns={enrollmentColumns}
                        getRowId={(row) => row.id}
                        width="max"
                    />
                ) : (
                    <EmptyState/>
                )}
            </PageSection>

            {/* The student is fixed by this page, so the dialog only asks for
                the course/plan and term. useCreateEnrollment invalidates
                ['student'], so the table above refetches on success. */}
            <EnrollStudentDialog
                open={enrollOpen}
                studentId={id}
                studentName={name}
                onClose={() => setEnrollOpen(false)}
            />
            <SetUserPasswordDialog
                open={passwordOpen}
                userId={student.user.id}
                userName={name}
                onClose={() => setPasswordOpen(false)}
            />
        </>
    );
}

export default AdminStudentDetail;
