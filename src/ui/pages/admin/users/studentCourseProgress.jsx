import {Progress} from '@gravity-ui/uikit';
import {BookOpen, CalendarDays, CheckCircle2, Layers3} from 'lucide-react';
import {useParams} from 'react-router-dom';
import {useEnrollmentProgress} from '@/services/enrollment/query.js';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {formatDate} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

function ProgressValue({value, size = 's'}) {
    const normalizedValue = Math.max(0, Math.min(100, Number(value) || 0));

    return (
        <>
            <Progress value={normalizedValue} size={size} theme={normalizedValue === 100 ? 'success' : 'default'}/>
            <span className="progress-percent">{normalizedValue}%</span>
        </>
    );
}

function AdminStudentCourseProgress() {
    const {t} = useI18n();
    const {studentId, enrollmentId} = useParams();
    const query = useEnrollmentProgress({studentId, enrollmentId});
    const studentPath = `/admin/users/students/${studentId}`;

    if (query.isPending) return <LoadingState rows={7}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const progress = query.data;
    const units = progress.course?.units ?? [];
    const lessons = units.flatMap((unit) => unit.lessons ?? []);
    const completedLessons = lessons.reduce(
        (total, lesson) => total + (lesson.progress === 100 ? 1 : 0),
        0,
    );

    return (
        <>
            <PageHeader
                title={progress.course?.title ?? t('student.courseProgress')}
                description={t('student.progressDescription')}
                backTo={studentPath}
                breadcrumbs={[
                    {title: t('student.title'), to: '/admin/users/students'},
                    {title: t('student.profile'), to: studentPath},
                    {title: t('student.courseProgress')},
                ]}
                actions={<StatusLabel status={progress.status} i18nPrefix="enrollment"/>}
            />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16,
                    marginBottom: 16,
                }}
            >
                <StatCard
                    icon={BookOpen}
                    label={t('student.overallProgress')}
                    value={`${progress.course?.progress ?? 0}%`}
                />
                <StatCard icon={Layers3} label={t('student.unitsCompleted')} value={units.length}/>
                <StatCard
                    icon={CheckCircle2}
                    label={t('student.lessonsCompleted')}
                    value={`${completedLessons}/${lessons.length}`}
                />
                <StatCard
                    icon={CalendarDays}
                    label={t('student.term')}
                    value={`${formatDate(progress.start)} — ${formatDate(progress.end)}`}
                />
            </div>

            <PageSection title={t('student.courseProgress')}>
                {units.length ? (
                    <div>
                        {units.map((unit) => (
                            <details className="progress-unit" key={unit.id} open>
                                <summary className="progress-unit__summary">
                                    <span className="progress-unit__title">
                                        {unit.index}. {unit.title}
                                    </span>
                                    <ProgressValue value={unit.progress}/>
                                </summary>
                                <div className="progress-unit__lessons">
                                    {unit.lessons?.length ? (
                                        unit.lessons.map((lesson) => (
                                            <div className="progress-lesson" key={lesson.id}>
                                                <span>
                                                    {lesson.index}. {lesson.title}
                                                </span>
                                                <ProgressValue value={lesson.progress}/>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState title={t('student.noLessons')}/>
                                    )}
                                </div>
                            </details>
                        ))}
                    </div>
                ) : (
                    <EmptyState title={t('student.noUnits')}/>
                )}
            </PageSection>
        </>
    );
}

export default AdminStudentCourseProgress;
