import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button} from '@gravity-ui/uikit';
import {KeyRound, Plus} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useStudent} from '@/services/student/query.js';
import {useCourses} from '@/services/course/query.js';
import {formatDate, formatPhone, fullName} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import UserAvatar from '@/ui/components/userAvatar.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import CourseCell from '@/ui/components/courseCell.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import EnrollStudentDialog from '@/ui/pages/admin/users/enrollStudentDialog.jsx';
import SetUserPasswordDialog from '@/ui/pages/admin/users/setUserPasswordDialog.jsx';
import RelatedAssignments from '@/ui/pages/admin/assignments/relatedAssignments.jsx';

function AdminStudentDetail() {
    const {t} = useI18n();
    const {id} = useParams();
    const navigate = useNavigate();
    const query = useStudent(id);
    // The student payload carries each course as `{id, title}` only, so the
    // image, description and counts come from the (cached) course list.
    const courses = useCourses();
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    if (query.isPending) return <LoadingState rows={6}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const student = query.data;
    const name = fullName(student);

    const courseById = new Map((courses.data?.data ?? []).map((course) => [course.id, course]));
    const enrollments = (student.enrollments ?? []).map((enrollment) => ({
        ...enrollment,
        course: {...enrollment.course, ...courseById.get(enrollment.course?.id)},
    }));

    // Same columns as the courses list, with the enrollment's own status and
    // start in place of the course's. A row opens that enrollment's progress.
    const enrollmentColumns = [
        {
            id: 'course',
            name: t('course.name'),
            template: (row) => <CourseCell course={row.course}/>,
        },
        {id: 'unitsCount', name: t('course.units'), template: (row) => row.course?.unitsCount ?? '—'},
        {id: 'lessonsCount', name: t('course.lessonsCount'), template: (row) => row.course?.lessonsCount ?? '—'},
        {
            id: 'status',
            name: t('common.status'),
            template: (row) => <StatusLabel status={row.status} i18nPrefix="enrollment"/>,
        },
        {id: 'start', name: t('enrollment.start'), template: (row) => formatDate(row.start)},
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
                    <UserAvatar avatar={student.avatar} name={name} size="xl"/>
                    <div>
                        <div style={{fontSize: 16, fontWeight: 600}}>{name}</div>
                        <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                            {formatPhone(student.phoneNumber)}
                            {student.email ? ` · ${student.email}` : ''}
                            {student.gender
                                ? ` · ${t(student.gender === 'female' ? 'mentor.genderFemale' : 'mentor.genderMale')}`
                                : ''}
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
            </div>

            <PageSection title={t('student.enrollments')}>
                <DataTable
                    query={query}
                    rows={enrollments}
                    columns={enrollmentColumns}
                    onRowClick={(row) => navigate(`/admin/users/students/${id}/enrollments/${row.id}/progress`)}
                />
            </PageSection>

            <div style={{marginTop: 16}}>
                <RelatedAssignments studentId={id}/>
            </div>

            {/* The student is fixed by this page, so the dialog only asks for
                the course/plan. useCreateEnrollment invalidates ['student'],
                so the table above refetches on success. */}
            <EnrollStudentDialog
                open={enrollOpen}
                studentId={id}
                studentName={name}
                onClose={() => setEnrollOpen(false)}
            />
            <SetUserPasswordDialog
                open={passwordOpen}
                kind="student"
                accountId={student.id}
                userName={name}
                onClose={() => setPasswordOpen(false)}
            />
        </>
    );
}

export default AdminStudentDetail;
