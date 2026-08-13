import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Select, TextArea, TextInput} from '@gravity-ui/uikit';
import {Plus, X} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useAddTaskQuestion,
    useCourse,
    useLesson,
    useTask,
    useUnit,
    useUpdateTaskQuestion,
} from '@/services/course/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

// One text input per option, rather than a single comma-separated field, so
// an option containing a comma is expressible.
function OptionsInput({options, onChange}) {
    const {t} = useI18n();

    const setAt = (index, value) =>
        onChange(options.map((option, i) => (i === index ? value : option)));

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {options.map((option, index) => (
                <div key={index} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                    <TextInput
                        size="l"
                        value={option}
                        onUpdate={(value) => setAt(index, value)}
                        placeholder={`${t('course.options')} ${index + 1}`}
                    />
                    <Button
                        view="flat-danger"
                        size="l"
                        onClick={() => onChange(options.filter((_, i) => i !== index))}
                        aria-label={t('common.delete')}
                    >
                        <Button.Icon>
                            <X size={16}/>
                        </Button.Icon>
                    </Button>
                </div>
            ))}
            <div>
                <Button onClick={() => onChange([...options, ''])}>
                    <Button.Icon>
                        <Plus size={16}/>
                    </Button.Icon>
                    {t('course.addOption')}
                </Button>
            </div>
        </div>
    );
}

function QuestionForm({base, index, isNew, initialValues, onSaved}) {
    const {t} = useI18n();
    const addQuestion = useAddTaskQuestion();
    const updateQuestion = useUpdateTaskQuestion();
    const mutation = isNew ? addQuestion : updateQuestion;
    const [form, setForm] = useState(initialValues);
    const [errors, setErrors] = useState({});

    // Blank rows are scratch space while typing - only filled options count as
    // real choices, and none at all means a free-text question.
    const filledOptions = form.options.map((option) => option.trim()).filter(Boolean);
    const isMultipleChoice = filledOptions.length > 0;

    const submit = (event) => {
        event.preventDefault();

        const next = {};
        if (!form.question.trim()) next.question = t('common.error');
        if (!form.answer.trim()) next.answer = t('common.error');

        // With choices present the answer has to be one of them, or a student
        // can never pick it. The API grades case-insensitively (it lowercases
        // both sides), so this check does too.
        if (
            isMultipleChoice &&
            form.answer.trim() &&
            !filledOptions.some((option) => option.toLowerCase() === form.answer.trim().toLowerCase())
        ) {
            next.answer = t('course.answerNotInOptions');
        }

        setErrors(next);
        if (Object.keys(next).length) return;

        // One question at a time - the API addresses each by its position, so
        // the rest of the array is untouched. `options` is null for free text.
        const payload = {
            ...base,
            question: form.question.trim(),
            options: isMultipleChoice ? filledOptions : null,
            answer: form.answer.trim(),
        };

        mutation.mutate(isNew ? payload : {...payload, index}, {
            onSuccess: () => {
                toaster.add({name: 'question-saved', theme: 'success', title: t('common.saved')});
                onSaved();
            },
            onError: (error) =>
                toaster.add({
                    name: 'question-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    const setField = (key) => (value) => setForm((current) => ({...current, [key]: value}));

    // A select can only hold one of its own options; if the answer was typed
    // freely before options existed, it won't match and shows as unselected.
    const answerInSelect = filledOptions.some(
        (option) => option.toLowerCase() === form.answer.trim().toLowerCase()
    );

    return (
        <form onSubmit={submit} style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560}}>
            <FormField label={t('course.question')} required error={errors.question}>
                <TextArea size="l" minRows={2} value={form.question} onUpdate={setField('question')}/>
            </FormField>

            <FormField label={t('course.options')} hint={t('course.optionsHint')}>
                <OptionsInput options={form.options} onChange={setField('options')}/>
            </FormField>

            <FormField
                label={t('course.answer')}
                required
                error={errors.answer}
                hint={isMultipleChoice ? undefined : t('course.freeAnswerHint')}
            >
                {isMultipleChoice ? (
                    <Select
                        size="l"
                        width="max"
                        placeholder={t('course.selectAnswer')}
                        value={answerInSelect ? [form.answer.trim()] : []}
                        onUpdate={([value]) => setField('answer')(value)}
                    >
                        {filledOptions.map((option, optionIndex) => (
                            <Select.Option key={optionIndex} value={option}>
                                {option}
                            </Select.Option>
                        ))}
                    </Select>
                ) : (
                    <TextInput size="l" value={form.answer} onUpdate={setField('answer')}/>
                )}
            </FormField>

            <div style={{display: 'flex', gap: 8}}>
                <Button type="submit" view="action" size="l" loading={mutation.isPending}>
                    {t('common.save')}
                </Button>
                <Button size="l" onClick={onSaved}>
                    {t('common.cancel')}
                </Button>
            </div>
        </form>
    );
}

function AdminQuestion() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {courseId, unitId, lessonId, taskId, index} = useParams();

    const courseQuery = useCourse(courseId);
    const unitQuery = useUnit({courseId, unitId});
    const lessonQuery = useLesson({courseId, unitId, lessonId});
    const taskQuery = useTask({courseId, unitId, lessonId, taskId});

    const base = {courseId, unitId, lessonId, taskId};
    const coursePath = `/admin/course/courses/${courseId}`;
    const unitPath = `${coursePath}/units/${unitId}`;
    const lessonPath = `${unitPath}/lessons/${lessonId}`;
    const taskPath = `${lessonPath}/tasks/${taskId}`;

    if (taskQuery.isPending) return <LoadingState rows={5}/>;
    if (taskQuery.isError) return <ErrorState error={taskQuery.error} onRetry={taskQuery.refetch}/>;

    const task = taskQuery.data;
    const questions = task?.questions ?? [];
    // The "add" route reuses this page with an empty form; the question is
    // only written once it's valid, so nothing blank is ever stored.
    const isNew = index === 'new';
    const questionIndex = isNew ? questions.length : Number(index);
    const question = isNew ? null : questions[questionIndex];

    const title = isNew
        ? t('course.addQuestion')
        : `${t('course.question')} ${questionIndex + 1}`;

    const breadcrumbs = [
        {title: t('course.title'), to: '/admin/course/courses'},
        {title: courseQuery.data?.title ?? '…', to: coursePath},
        {title: unitQuery.data?.title ?? '…', to: unitPath},
        {title: lessonQuery.data?.title ?? '…', to: lessonPath},
        {title: task?.name || t('course.task'), to: taskPath},
        {title},
    ];

    // A stale link (or a question deleted from another tab) lands here with
    // nothing at that index.
    if (!task || (!isNew && !question)) {
        return (
            <>
                <PageHeader title={t('common.notFound')} backTo={taskPath}/>
                <ErrorState error={{response: {status: 404}}}/>
            </>
        );
    }

    return (
        <>
            <PageHeader
                title={title}
                description={task.name || t('course.task')}
                backTo={taskPath}
                breadcrumbs={breadcrumbs}
            />
            <PageSection title={isNew ? t('course.addQuestion') : t('course.editQuestion')}>
                <QuestionForm
                    key={index}
                    base={base}
                    index={questionIndex}
                    isNew={isNew}
                    initialValues={{
                        question: question?.question ?? '',
                        options: Array.isArray(question?.options) ? question.options : [],
                        answer: question?.answer ?? '',
                    }}
                    onSaved={() => navigate(taskPath)}
                />
            </PageSection>
        </>
    );
}

export default AdminQuestion;
