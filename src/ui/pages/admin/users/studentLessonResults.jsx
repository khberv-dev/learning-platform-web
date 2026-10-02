import {Label} from '@gravity-ui/uikit';
import {CheckCircle2, ListChecks, Send, XCircle} from 'lucide-react';
import {useParams} from 'react-router-dom';
import {useStudentLessonResults} from '@/services/task-submission/query.js';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {formatDateTime} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

// The task's own material, kept small - this page is about the answers.
function TaskContent({task}) {
    if (!task.file) return null;

    if (task.contentType === 'picture') {
        return (
            <img
                src={task.file}
                alt=""
                style={{display: 'block', maxWidth: '100%', maxHeight: 160, borderRadius: 6, marginBottom: 8}}
            />
        );
    }

    if (task.contentType === 'audio') {
        return <audio src={task.file} controls style={{width: '100%', maxWidth: 420, marginBottom: 8}}/>;
    }

    return <div style={{fontSize: 13, whiteSpace: 'pre-wrap', marginBottom: 8}}>{task.file}</div>;
}

// Mirrors `taskAnswersMatch` on the server: case-insensitive, and everything
// that is not a letter is ignored, so "A." and "a" are the same option.
function matches(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const normalize = (value) => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}]/gu, '');
    const normalized = normalize(b);
    return normalized.length > 0 && normalize(a) === normalized;
}

// One question on one row: the text, then the options as inline chips (red is
// the student's pick, green the answer key - both on one chip is a correct
// pick), or for a free-text question the two answers side by side.
//
// `submitted` is false for a task the student never sent. The server still
// reports `isCorrect: false` per question there, but that is "no data", not a
// failure - so no verdict and no pick are shown, only the question and its key.
function QuestionRow({question, index, submitted}) {
    const {t} = useI18n();
    const answered = submitted && question.studentAnswer !== null && question.studentAnswer !== '';

    return (
        <div className="submission-question">
            <span className="submission-question__index">{index + 1}.</span>
            <div style={{minWidth: 0}}>
                <div className="submission-question__text">{question.question}</div>
                {question.options?.length ? (
                    <div className="submission-options">
                        {question.options.map((option, optionIndex) => (
                            <span
                                className="submission-option"
                                data-picked={answered && matches(option, question.studentAnswer) ? 'true' : undefined}
                                data-correct={matches(option, question.answer) ? 'true' : undefined}
                                key={`${option}-${optionIndex}`}
                            >
                                {option}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="submission-answers">
                        {submitted && (
                            <span>
                                <span className="submission-answers__label">{t('lessonResults.studentAnswer')}:</span>{' '}
                                {answered ? (
                                    question.studentAnswer
                                ) : (
                                    <span style={{color: 'var(--g-color-text-secondary)'}}>
                                        {t('lessonResults.unanswered')}
                                    </span>
                                )}
                            </span>
                        )}
                        {/* Only worth repeating when it differs from what the
                            student wrote. */}
                        {!(submitted && question.isCorrect) && (
                            <span>
                                <span className="submission-answers__label">{t('lessonResults.correctAnswer')}:</span>{' '}
                                {question.answer}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <span className="submission-question__verdict">
                {submitted &&
                    (question.isCorrect ? (
                        <CheckCircle2 size={16} color="var(--g-color-text-positive)" aria-label={t('lessonResults.passed')}/>
                    ) : (
                        <XCircle size={16} color="var(--g-color-text-danger)" aria-label={t('lessonResults.failed')}/>
                    ))}
            </span>
        </div>
    );
}

function TaskResult({task, position}) {
    const {t} = useI18n();
    const submitted = task.submittedAt !== null;

    return (
        <PageSection
            style={{padding: 16}}
            title={task.name || `${t('lessonResults.task')} ${position}`}
            actions={
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    {submitted && (
                        <span style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>
                            {formatDateTime(task.submittedAt)}
                        </span>
                    )}
                    {submitted ? (
                        <Label theme={task.isCorrect ? 'success' : 'danger'} size="xs">
                            {task.isCorrect ? t('lessonResults.passed') : t('lessonResults.failed')}
                        </Label>
                    ) : (
                        <Label theme="unknown" size="xs">
                            {t('lessonResults.notSubmitted')}
                        </Label>
                    )}
                </div>
            }
        >
            <TaskContent task={task}/>
            {task.questions.length ? (
                <div>
                    {task.questions.map((question, index) => (
                        <QuestionRow key={index} question={question} index={index} submitted={submitted}/>
                    ))}
                </div>
            ) : (
                <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                    {t('lessonResults.noQuestions')}
                </div>
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

    // Totals cover only what the student actually sent: an unsubmitted task
    // is neither passed nor failed, and a question-less one can never be
    // marked passed by the server, so both stay out of the counts.
    const gradedTasks = tasks.filter((task) => task.questions.length > 0);
    const submittedTasks = gradedTasks.filter((task) => task.submittedAt !== null);
    const passedTasks = submittedTasks.filter((task) => task.isCorrect).length;
    const answeredQuestions = submittedTasks.flatMap((task) => task.questions);
    const correctQuestions = answeredQuestions.filter((question) => question.isCorrect).length;

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
                    icon={Send}
                    label={t('lessonResults.tasksSubmitted')}
                    value={`${submittedTasks.length}/${gradedTasks.length}`}
                />
                <StatCard
                    icon={CheckCircle2}
                    label={t('lessonResults.tasksPassed')}
                    value={`${passedTasks}/${submittedTasks.length}`}
                />
                <StatCard
                    icon={ListChecks}
                    label={t('lessonResults.questionsCorrect')}
                    value={`${correctQuestions}/${answeredQuestions.length}`}
                />
            </div>

            {tasks.length ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
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
