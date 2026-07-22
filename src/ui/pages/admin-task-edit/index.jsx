import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useListTasks, useCreateTask, useUpdateTask} from '@/services/task/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'

const selectStyle = {
    width: '100%', height: 44, padding: '0 14px',
    background: 'var(--it-surface-input)',
    border: '1px solid var(--it-border-strong)',
    borderRadius: 8, fontSize: 14,
}

const newQ = () => ({
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    question: '', options: [], answer: '',
})

const initialTextContent = (initial) => initial?.contentType === 'text' ? (initial?.file ?? '') : ''

export function AdminTaskEditPage() {
    const {id: courseId, unitId, lessonId, taskId} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()

    const backTo = () => navigate(`/admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}`)

    const {data: tasks = [], isLoading: tasksLoading} = useListTasks(courseId, unitId, lessonId)
    const initial = taskId ? (tasks.find(t => t.id === taskId) ?? null) : null

    const createTask = useCreateTask({onSuccess: backTo})
    const updateTask = useUpdateTask({onSuccess: backTo})

    const [initialized, setInitialized] = useState(false)
    const [name, setName] = useState('')
    const [textContent, setTextContent] = useState('')
    const [questions, setQuestions] = useState([newQ()])

    useEffect(() => {
        setHeader({title: taskId ? 'Edit Task' : 'Add Task', onBack: backTo})
        return () => setHeader({})
    }, [setHeader, taskId]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (initialized) return
        if (taskId && !initial) return  // wait for tasks to load
        setName(initial?.name ?? '')
        setTextContent(initialTextContent(initial))
        setQuestions(initial?.questions?.length
            ? initial.questions.map((q, i) => ({
                id: String(i),
                question: q.question,
                options: (q.options ?? []).map((v, j) => ({id: String(j), value: v})),
                answer: q.answer,
            }))
            : [newQ()])
        setInitialized(true)
    }, [initial, taskId, initialized])

    const updateQ = (qId, patch) =>
        setQuestions(prev => prev.map(q => q.id === qId ? {...q, ...patch} : q))

    const removeQ = (qId) =>
        setQuestions(prev => prev.filter(q => q.id !== qId))

    const addOption = (qId) =>
        setQuestions(prev => prev.map(q =>
            q.id === qId ? {...q, options: [...q.options, {id: `o-${Date.now()}`, value: ''}]} : q
        ))

    const updateOption = (qId, optId, value) =>
        setQuestions(prev => prev.map(q =>
            q.id === qId
                ? {...q, options: q.options.map(o => o.id === optId ? {...o, value} : o)}
                : q
        ))

    const removeOption = (qId, optId) =>
        setQuestions(prev => prev.map(q => {
            if (q.id !== qId) return q
            const removed = q.options.find(o => o.id === optId)?.value.trim()
            return {
                ...q,
                options: q.options.filter(o => o.id !== optId),
                answer: removed && removed === q.answer ? '' : q.answer,
            }
        }))

    const loading = createTask.isPending || updateTask.isPending
    const canSubmit = questions.length > 0 && questions.every(q => q.question.trim() && q.answer.trim())

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!canSubmit) return
        const payload = {
            name: name.trim() || null,
            questions: questions.map(q => {
                const optionValues = q.options.map(o => o.value.trim()).filter(Boolean)
                return {
                    question: q.question.trim(),
                    options: optionValues.length > 0 ? optionValues : null,
                    answer: q.answer.trim(),
                }
            }),
        }
        const trimmedText = textContent.trim()
        if (trimmedText !== initialTextContent(initial)) payload.file = trimmedText || null

        if (taskId) {
            updateTask.mutate({courseId, unitId, lessonId, taskId, data: payload})
        } else {
            createTask.mutate({courseId, unitId, lessonId, data: payload})
        }
    }

    if (taskId && tasksLoading) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>
    if (taskId && !tasksLoading && !initial) return <div style={{color: 'var(--it-text-secondary)'}}>Task not found.</div>

    return (
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16, flex: 1}}>
            <Card padding={32} gap={24}>
                <FormField label="Task Name" hint="Optional — shown as a title for this task.">
                    <Input
                        placeholder="e.g. Greeting quiz"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Text Content"
                    hint="Optional plain text attached to this task, e.g. a reading passage. Uploading an audio or image file afterwards will replace it."
                >
                    <Textarea
                        rows={4}
                        placeholder="Enter text content…"
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                    />
                </FormField>

                {questions.map((q, idx) => {
                    const optionValues = q.options.map(o => o.value.trim()).filter(Boolean)
                    return (
                        <div key={q.id} style={{
                            border: '1px solid var(--it-border)',
                            borderRadius: 10,
                            padding: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <span style={{fontWeight: 600, fontSize: 13, color: 'var(--it-text-secondary)'}}>
                                    Question {idx + 1}
                                </span>
                                {questions.length > 1 && (
                                    <IconButton icon="x" title="Remove question" onClick={() => removeQ(q.id)}/>
                                )}
                            </div>

                            <FormField label="Question">
                                <Textarea
                                    rows={2}
                                    placeholder="Enter the question…"
                                    value={q.question}
                                    onChange={(e) => updateQ(q.id, {question: e.target.value})}
                                />
                            </FormField>

                            <FormField label="Options" hint="Optional — leave empty for a free-text answer.">
                                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                                    {q.options.map((opt) => (
                                        <div key={opt.id} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                                            <Input
                                                placeholder="Option text"
                                                value={opt.value}
                                                onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                                            />
                                            <IconButton icon="x" title="Remove option" onClick={() => removeOption(q.id, opt.id)}/>
                                        </div>
                                    ))}
                                    <Button type="button" variant="secondary" size="sm" leftIcon="plus" onClick={() => addOption(q.id)}>
                                        Add Option
                                    </Button>
                                </div>
                            </FormField>

                            <FormField label="Correct Answer">
                                {optionValues.length > 0 ? (
                                    <select
                                        value={q.answer}
                                        onChange={(e) => updateQ(q.id, {answer: e.target.value})}
                                        style={{...selectStyle, color: q.answer ? 'var(--it-text-primary)' : 'var(--it-text-tertiary)'}}
                                    >
                                        <option value="">Select correct answer</option>
                                        {optionValues.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="Type the correct answer…"
                                        value={q.answer}
                                        onChange={(e) => updateQ(q.id, {answer: e.target.value})}
                                    />
                                )}
                            </FormField>
                        </div>
                    )
                })}

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon="plus"
                    onClick={() => setQuestions(prev => [...prev, newQ()])}
                    style={{alignSelf: 'flex-start'}}
                >
                    Add Question
                </Button>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" type="button" onClick={backTo} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={!canSubmit || loading}>
                        {loading ? 'Saving…' : taskId ? 'Save Changes' : 'Add Task'}
                    </Button>
                </div>
            </Card>
        </form>
    )
}

export default AdminTaskEditPage
