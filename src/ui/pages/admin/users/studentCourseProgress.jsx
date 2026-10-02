import {Progress} from '@gravity-ui/uikit';
import {BookOpen, CalendarDays, CheckCircle2, ChevronRight, Layers3} from 'lucide-react';
import {Link, useParams} from 'react-router-dom';
import {useEnrollmentProgress} from '@/services/enrollment/query.js';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {formatDate} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

function ProgressValue({value, size = 's'}) {
    const percent = clampPercent(value);

    return (
        <>
            <Progress value={percent} size={size} theme={percent === 100 ? 'success' : 'default'}/>
            <span className="progress-percent">{percent}%</span>
        </>
    );
}

// One lesson as a card in its unit's grid; the whole card opens that lesson's
// task answers.
function LessonCard({lesson, to}) {
    const {t} = useI18n();
    const percent = clampPercent(lesson.progress);
    const complete = percent === 100;

    return (
        <Link
            className="progress-lesson"
            data-complete={complete ? 'true' : undefined}
            to={to}
            title={t('lessonResults.openResults')}
        >
            <div className="progress-lesson__head">
                <span className="progress-lesson__index">{lesson.index}</span>
                <span className="progress-lesson__title">{lesson.title}</span>
                {complete && <CheckCircle2 size={16} className="progress-lesson__done"/>}
            </div>
            <div className="progress-lesson__bar">
                <div className="progress-lesson__caption">
                    <span>{t('student.lessonProgress')}</span>
                    <span className="progress-percent">{percent}%</span>
                </div>
                <Progress value={percent} size="s" theme={complete ? 'success' : 'default'}/>
            </div>
        </Link>
    );
}

// A unit is a collapsed <details> card - the summary carries its own progress,
// so the page reads as a compact outline until a unit is opened.
function UnitCard({unit, lessonPath}) {
    const {t} = useI18n();
    const lessons = unit.lessons ?? [];
    const completed = lessons.filter((lesson) => clampPercent(lesson.progress) === 100).length;

    return (
        <details className="progress-unit">
            <summary className="progress-unit__summary">
                <ChevronRight size={16} className="progress-unit__chevron"/>
                <span className="progress-unit__title">
                    {unit.index}. {unit.title}
                </span>
                <span className="progress-unit__count">
                    {completed}/{lessons.length}
                </span>
                <ProgressValue value={unit.progress}/>
            </summary>
            {lessons.length ? (
                <div className="progress-unit__lessons">
                    {lessons.map((lesson) => (
                        <LessonCard key={lesson.id} lesson={lesson} to={lessonPath(lesson.id)}/>
                    ))}
                </div>
            ) : (
                <div style={{padding: '0 16px 16px'}}>
                    <EmptyState title={t('student.noLessons')}/>
                </div>
            )}
        </details>
    );
}

function AdminStudentCourseProgress() {
    const {t} = useI18n();
    const {studentId, enrollmentId} = useParams();
    const query = useEnrollmentProgress({studentId, enrollmentId});
    const studentPath = `/admin/users/students/${studentId}`;
    // Lesson cards drill into that lesson's task answers, which hang off the
    // same student + enrollment pair this page is already scoped to.
    const basePath = `${studentPath}/enrollments/${enrollmentId}`;

    if (query.isPending) return <LoadingState rows={7}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const progress = query.data;
    const units = progress.course?.units ?? [];
    const lessons = units.flatMap((unit) => unit.lessons ?? []);
    const completedLessons = lessons.filter((lesson) => clampPercent(lesson.progress) === 100).length;

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
                <StatCard icon={CalendarDays} label={t('student.term')} value={formatDate(progress.start)}/>
            </div>

            <PageSection title={t('student.courseProgress')}>
                {units.length ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                        {units.map((unit) => (
                            <UnitCard
                                key={unit.id}
                                unit={unit}
                                lessonPath={(lessonId) => `${basePath}/lessons/${lessonId}`}
                            />
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
