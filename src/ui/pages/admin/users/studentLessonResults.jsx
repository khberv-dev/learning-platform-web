import {Label} from '@gravity-ui/uikit';
import {CheckCircle2, ListChecks} from 'lucide-react';
import {useParams} from 'react-router-dom';
import {useStudentLessonResults} from '@/services/task-submission/query.js';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {formatDateTime} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

// The task's own material, rendered the way the admin task pages do it -
// `contentType` decides, and a plain string is text.
function TaskContent({task}) {
    if (!task.file) return null;

    if (task.contentType === 'picture') {
        return (
            <img
                src={task.file}
                alt=""
                style={{display: 'block', maxWidth: '100%', maxHeight: 320, borderRadius: 8, marginBottom: 16}}
            />
        );
    }

    if (task.contentType === 'audio') {
        return <audio src={task.file} controls style={{width: '100%', maxWidth: 520, marginBottom: 16}}/>;
    }

    return (
        <div style={{fontSize: 14, whiteSpace: 'pre-wrap', marginBottom: 16}}>{task.file}</div>
    );
}

// One question: every option is listed, with the student's pick and the answer
// key marked separately - the same option can carry both, which is what a
// correct answer looks like.
function QuestionResult({question, index}) {
    const {t} = useI18n();
    const answered = question.studentAnswer !== null && question.studentAnswer !== '';

    return (
        <div className="submission-question">
            <div style={{display: 'flex', gap: 10, marginBottom: 12}}>
                <strong style={{flexShrink: 0}}>{index + 1}.</strong>
                <div style={{fontWeight: 600, flex: 1, minWidth: 0}}>{question.question}</div>
                <Label theme={question.isCorrect ? 'success' : 'danger'}>
                    {question.isCorrect ? t('lessonResults.passed') : t('lessonResults.failed')}
                </Label>
            </div>

            {question.options?.length ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 26}}>
                    {question.options.map((option, optionIndex) => {
                        const picked = answered && matches(option, question.studentAnswer);
                        const correct = matches(option, question.answer);

                        return (
                            <div
                                className="submission-option"
                                data-picked={picked ? 'true' : undefined}
                                data-correct={correct ? 'true' : undefined}
                                key={`${option}-${optionIndex}`}
                            >
                                <span>{option}</span>
                                <span style={{display: 'flex', gap: 6, flexShrink: 0}}>
                                    {picked && (
                                        <Label theme={question.isCorrect ? 'success' : 'danger'}>
                                            {t('lessonResults.studentAnswer')}
                                        </Label>
                                    )}
                                    {correct && <Label theme="success">{t('lessonResults.correctAnswer')}</Label>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{marginLeft: 26, display: 'flex', flexWrap: 'wrap', gap: 24}}>
                    <AnswerBlock
                        label={t('lessonResults.studentAnswer')}
                        value={answered ? question.studentAnswer : t('lessonResults.unanswered')}
                        muted={!answered}
                    />
                    <AnswerBlock label={t('lessonResults.correctAnswer')} value={question.answer}/>
                </div>
            )}
        </div>
    );
}

function AnswerBlock({label, value, muted}) {
    return (
        <div style={{minWidth: 0}}>
            <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)', marginBottom: 4}}>{label}</div>
            <div
                style={{
                    fontSize: 14,
                    whiteSpace: 'pre-wrap',
                    color: muted ? 'var(--g-color-text-secondary)' : undefined,
                }}
            >
                {value}
            </div>
        </div>
    );
}

// Mirrors `taskAnswersMatch` on the server: case-insensitive, and everything
// that is not a letter is ignored, so "A." and "a" are the same option.
function matches(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const normalize = (value) => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}]/gu, '');
    const normalized = normalize(b);
    return normalized.length > 0 && normalize(a) === normalized;
}

function TaskResult({task, position}) {
    const {t} = useI18n();
    const submitted = task.submittedAt !== null;

    return (
        <PageSection
            title={task.name || `${t('lessonResults.title')} ${position}`}
            actions={
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <span style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>
                        {submitted
                            ? `${t('lessonResults.submittedAt')}: ${formatDateTime(task.submittedAt)}`
                            : t('lessonResults.notSubmitted')}
                    </span>
                    {submitted && (
                        <Label theme={task.isCorrect ? 'success' : 'warning'}>
                            {task.isCorrect ? t('lessonResults.passed') : t('lessonResults.failed')}
                        </Label>
                    )}
                </div>
            }
        >
            <TaskContent task={task}/>
            {task.questions.length ? (
                task.questions.map((question, index) => (
                    <QuestionResult key={index} question={question} index={index}/>
                ))
            ) : (
                <EmptyState title={t('lessonResults.noQuestions')}/>
            )}
        </PageSection>
    );
}

function AdminStudentLessonResults() {
    const {t} = useI18n();
    const {studentId, enrollmentId, lessonId} = useParams();
    const query = useStudentLessonResults({studentId, lessonId});

    const studentPath = `/admin/users/students/${studentId}`;
    const progressPath = `${studentPath}/enrollments/${enrollmentId}/progress`;

    if (query.isPending) return <LoadingState rows={7}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const {lesson, tasks} = query.data;

    // A task with no questions cannot be passed (the server never marks one
    // correct), so it is left out of both totals rather than counted as failed.
    const gradedTasks = tasks.filter((task) => task.questions.length > 0);
    const passedTasks = gradedTasks.filter((task) => task.isCorrect).length;
    const questions = tasks.flatMap((task) => task.questions);
    const correctQuestions = questions.filter((question) => question.isCorrect).length;

    return (
        <>
            <PageHeader
                title={lesson.title}
                description={t('lessonResults.description')}
                backTo={progressPath}
                breadcrumbs={[
                    {title: t('student.title'), to: '/admin/users/students'},
                    {title: t('student.profile'), to: studentPath},
                    {title: t('student.courseProgress'), to: progressPath},
                    {title: t('lessonResults.title')},
                ]}
            />

            <div className="submission-summary-grid">
                <StatCard
                    icon={CheckCircle2}
                    label={t('lessonResults.tasksPassed')}
                    value={`${passedTasks}/${gradedTasks.length}`}
                />
                <StatCard
                    icon={ListChecks}
                    label={t('lessonResults.questionsCorrect')}
                    value={`${correctQuestions}/${questions.length}`}
                />
            </div>

            {tasks.length ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    {tasks.map((task, index) => (
                        <TaskResult key={task.taskId} task={task} position={index + 1}/>
                    ))}
                </div>
            ) : (
                <EmptyState title={t('lessonResults.noTasks')}/>
            )}
        </>
    );
}

export default AdminStudentLessonResults;
