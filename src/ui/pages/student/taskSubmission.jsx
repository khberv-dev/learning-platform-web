import {Alert, Label} from '@gravity-ui/uikit';
import {CheckCircle2, Clock3, XCircle} from 'lucide-react';
import {useParams} from 'react-router-dom';
import {useTaskSubmission} from '@/services/task-submission/query.js';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {cdnUrl, formatDateTime} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import {EmptyState, ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

function TaskContent({submission}) {
    if (!submission.file) return null;

    if (submission.contentType === 'picture') {
        return (
            <img
                src={cdnUrl(submission.file)}
                alt=""
                style={{display: 'block', maxWidth: '100%', maxHeight: 480, borderRadius: 8}}
            />
        );
    }

    if (submission.contentType === 'audio') {
        return <audio src={cdnUrl(submission.file)} controls style={{width: '100%', maxWidth: 520}}/>;
    }

    return <div style={{fontSize: 14, whiteSpace: 'pre-wrap'}}>{submission.file}</div>;
}

function SubmittedQuestion({question, index}) {
    const {t} = useI18n();
    const normalizedAnswer = question.answer?.trim().toLocaleLowerCase();

    return (
        <div className="submission-question">
            <div style={{display: 'flex', gap: 10, marginBottom: 12}}>
                <strong style={{flexShrink: 0}}>{index + 1}.</strong>
                <div style={{fontWeight: 600}}>{question.question}</div>
            </div>

            {question.options?.length ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 26}}>
                    {question.options.map((option, optionIndex) => {
                        const selected = option.trim().toLocaleLowerCase() === normalizedAnswer;
                        return (
                            <div
                                className="submission-option"
                                data-selected={selected ? 'true' : undefined}
                                key={`${option}-${optionIndex}`}
                            >
                                <span>{option}</span>
                                {selected ? <Label theme="info">{t('taskSubmission.selected')}</Label> : null}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{marginLeft: 26}}>
                    <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)', marginBottom: 4}}>
                        {t('taskSubmission.yourAnswer')}
                    </div>
                    <div style={{fontSize: 14, whiteSpace: 'pre-wrap'}}>
                        {question.answer || t('taskSubmission.unanswered')}
                    </div>
                </div>
            )}
        </div>
    );
}

function StudentTaskSubmission() {
    const {t} = useI18n();
    const {taskId} = useParams();
    const query = useTaskSubmission(taskId);

    if (query.isPending) return <LoadingState rows={7}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const submission = query.data;
    const resultTitle = submission.isCorrect ? t('taskSubmission.passed') : t('taskSubmission.failed');
    const resultDescription = submission.isCorrect
        ? t('taskSubmission.passedDescription')
        : t('taskSubmission.failedDescription');

    return (
        <>
            <PageHeader
                title={submission.name || t('taskSubmission.title')}
                description={t('taskSubmission.description')}
                breadcrumbs={[{title: t('taskSubmission.title')}]}
            />

            <div className="submission-summary-grid">
                <StatCard
                    icon={submission.isCorrect ? CheckCircle2 : XCircle}
                    label={t('taskSubmission.title')}
                    value={resultTitle}
                />
                <StatCard icon={Clock3} label={t('taskSubmission.submittedAt')} value={formatDateTime(submission.submittedAt)}/>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <Alert
                    theme={submission.isCorrect ? 'success' : 'warning'}
                    title={resultTitle}
                    message={resultDescription}
                />

                {submission.file ? (
                    <PageSection title={t('taskSubmission.content')}>
                        <TaskContent submission={submission}/>
                    </PageSection>
                ) : null}

                <PageSection title={t('taskSubmission.questions')}>
                    {submission.questions.length ? (
                        submission.questions.map((question, index) => (
                            <SubmittedQuestion key={index} question={question} index={index}/>
                        ))
                    ) : (
                        <EmptyState/>
                    )}
                </PageSection>
            </div>
        </>
    );
}

export default StudentTaskSubmission;
