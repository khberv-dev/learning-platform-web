import {useEffect, useMemo, useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourse} from '@/services/course/query.js'
import {useUpdateLesson} from '@/services/lesson/query.js'
import {useListTasks, useCreateTask, useUpdateTask, useDeleteTask} from '@/services/task/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {cdnUrl} from '@/services/config.js'

// ── Task dialog (create / edit) ───────────────────────────────────────────────

function TaskDialog({open, initial = null, onClose, onSubmit, loading}) {
    const [taskText, setTaskText] = useState('')
    const [options, setOptions] = useState([])   // [{id, value}]
    const [answer, setAnswer] = useState('')

    useEffect(() => {
        if (!open) return
        setTaskText(initial?.task ?? '')
        setOptions((initial?.options ?? []).map((v, i) => ({id: String(i), value: v})))
        setAnswer(initial?.answer ?? '')
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!open) return null

    const addOption = () =>
        setOptions(prev => [...prev, {id: `${Date.now()}`, value: ''}])

    const updateOption = (id, value) =>
        setOptions(prev => prev.map(o => o.id === id ? {...o, value} : o))

    const removeOption = (id) => {
        const removed = options.find(o => o.id === id)?.value.trim()
        setOptions(prev => prev.filter(o => o.id !== id))
        if (removed && removed === answer) setAnswer('')
    }

    const optionValues = options.map(o => o.value.trim()).filter(Boolean)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!taskText.trim() || !answer.trim()) return
        onSubmit({
            task: taskText.trim(),
            options: optionValues.length > 0 ? optionValues : null,
            answer: answer.trim(),
        })
    }

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form
                className="it-dialog"
                style={{maxWidth: 520}}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <div className="it-dialog__title">{initial ? 'Edit Task' : 'Add Task'}</div>

                <FormField label="Question">
                    <Textarea
                        rows={2}
                        placeholder="Enter the question…"
                        value={taskText}
                        onChange={(e) => setTaskText(e.target.value)}
                    />
                </FormField>

                <FormField label="Options" hint="Optional — leave empty for a free-text answer.">
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        {options.map((opt) => (
                            <div key={opt.id} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                                <Input
                                    placeholder="Option text"
                                    value={opt.value}
                                    onChange={(e) => updateOption(opt.id, e.target.value)}
                                />
                                <IconButton icon="x" title="Remove option" onClick={() => removeOption(opt.id)}/>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" size="sm" leftIcon="plus" onClick={addOption}>
                            Add Option
                        </Button>
                    </div>
                </FormField>

                <FormField label="Correct Answer">
                    {optionValues.length > 0 ? (
                        <select
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            style={{
                                width: '100%', height: 44, padding: '0 14px',
                                background: 'var(--it-surface-input)',
                                border: '1px solid var(--it-border-strong)',
                                borderRadius: 8, fontSize: 14,
                                color: answer ? 'var(--it-text-primary)' : 'var(--it-text-tertiary)',
                            }}
                        >
                            <option value="">Select correct answer</option>
                            {optionValues.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                    ) : (
                        <Input
                            placeholder="Type the correct answer…"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                    )}
                </FormField>

                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={!taskText.trim() || !answer.trim() || loading}
                    >
                        {loading ? 'Saving…' : initial ? 'Save Changes' : 'Add Task'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({task, onEdit, onDelete}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px',
            background: 'var(--it-surface-input)', borderRadius: 10,
        }}>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
                <span style={{fontWeight: 600, fontSize: 14, color: 'var(--it-text-primary)'}}>{task.task}</span>
                {task.options?.length > 0 && (
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                        {task.options.map((opt) => (
                            <span
                                key={opt}
                                style={{
                                    padding: '2px 10px', borderRadius: 999,
                                    fontSize: 12, fontWeight: 500,
                                    background: opt === task.answer
                                        ? 'var(--it-success-bg)' : 'var(--it-surface-alt)',
                                    color: opt === task.answer
                                        ? 'var(--it-success-text)' : 'var(--it-text-secondary)',
                                    border: opt === task.answer
                                        ? '1px solid var(--it-success-border)' : '1px solid var(--it-border)',
                                }}
                            >
                                {opt === task.answer && '✓ '}{opt}
                            </span>
                        ))}
                    </div>
                )}
                {!task.options?.length && (
                    <span style={{fontSize: 12, color: 'var(--it-success-text)', fontWeight: 500}}>
                        Answer: {task.answer}
                    </span>
                )}
            </div>
            <div style={{display: 'flex', gap: 6, flexShrink: 0}}>
                <IconButton icon="pencil" title="Edit task" onClick={onEdit}/>
                <IconButton icon="trash-2" title="Delete task" onClick={onDelete}/>
            </div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminLessonEditPage() {
    const {id: courseId, unitId, lessonId} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()

    const {data: course} = useGetCourse(courseId)
    const update = useUpdateLesson({onSuccess: () => navigate(`/admin/courses/${courseId}`)})

    const {data: tasks = [], isLoading: tasksLoading} = useListTasks(courseId, unitId, lessonId)
    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    const [taskDialog, setTaskDialog] = useState(null)   // null | { initial?: task }
    const [deleteConfirm, setDeleteConfirm] = useState(null)  // null | task

    const lesson = useMemo(() => {
        const u = course?.units?.find(u => u.id === unitId)
        return u?.lessons?.find(l => l.id === lessonId)
    }, [course, unitId, lessonId])

    useEffect(() => {
        setHeader({title: 'Edit Lesson', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const {register, handleSubmit, reset} = useForm({defaultValues: {title: '', description: ''}})

    useEffect(() => {
        if (!lesson) return
        reset({title: lesson.title ?? '', description: lesson.description ?? ''})
    }, [lesson, reset])

    const onSaveLesson = (v) => {
        update.mutate({courseId, unitId, lessonId, data: {title: v.title, description: v.description || undefined}})
    }

    const onTaskSubmit = (data) => {
        const taskArg = {courseId, unitId, lessonId}
        if (taskDialog?.initial) {
            updateTask.mutate({...taskArg, taskId: taskDialog.initial.id, data}, {onSuccess: () => setTaskDialog(null)})
        } else {
            createTask.mutate({...taskArg, data}, {onSuccess: () => setTaskDialog(null)})
        }
    }

    const onTaskDelete = () => {
        deleteTask.mutate(
            {courseId, unitId, lessonId, taskId: deleteConfirm.id},
            {onSuccess: () => setDeleteConfirm(null)},
        )
    }

    if (!lesson) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, flex: 1}}>

            {/* Lesson details */}
            <form onSubmit={handleSubmit(onSaveLesson)}>
                <Card padding={32} gap={24}>
                    <FormField label="Title">
                        <Input placeholder="Lesson title" {...register('title', {required: true})}/>
                    </FormField>
                    <FormField label="Description">
                        <Textarea rows={4} placeholder="Lesson description…" {...register('description')}/>
                    </FormField>
                    {lesson.media ? (
                        <FormField label="Lesson Video" hint="To replace the video, delete this lesson and recreate it.">
                            <video
                                src={cdnUrl(lesson.media)}
                                controls
                                style={{width: '100%', maxWidth: 480, aspectRatio: '16 / 9', borderRadius: 10, background: '#000', border: '1px solid var(--it-border)'}}
                            />
                        </FormField>
                    ) : (
                        <FormField label="Lesson Video" hint="Video can only be added when creating a lesson.">
                            <div style={{display: 'flex', alignItems: 'center', gap: 8, height: 40, color: 'var(--it-text-tertiary)', fontSize: 13}}>
                                <Icon name="video-off" size={16}/>
                                No video — delete and recreate the lesson to add one.
                            </div>
                        </FormField>
                    )}
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                        <Button variant="secondary" size="lg" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit" size="lg" disabled={update.isPending}>
                            {update.isPending ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </div>
                </Card>
            </form>

            {/* Tasks */}
            <Card padding={24} gap={16}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <h3 style={{fontSize: 16, fontWeight: 700}}>Tasks</h3>
                        <span className="it-badge it-badge--neutral it-badge--sm">{tasks.length}</span>
                    </div>
                    <Button leftIcon="plus" size="sm" onClick={() => setTaskDialog({})}>Add Task</Button>
                </div>

                {tasksLoading && (
                    <div style={{color: 'var(--it-text-secondary)', fontSize: 14}}>Loading…</div>
                )}

                {!tasksLoading && tasks.length === 0 && (
                    <div style={{
                        padding: '32px 0', textAlign: 'center',
                        color: 'var(--it-text-tertiary)', fontSize: 14,
                    }}>
                        <Icon name="list-checks" size={32} style={{marginBottom: 8, opacity: 0.4}}/>
                        <div>No tasks yet. Add one to test students on this lesson.</div>
                    </div>
                )}

                {tasks.map((task) => (
                    <TaskRow
                        key={task.id}
                        task={task}
                        onEdit={() => setTaskDialog({initial: task})}
                        onDelete={() => setDeleteConfirm(task)}
                    />
                ))}
            </Card>

            <TaskDialog
                key={taskDialog?.initial?.id ?? 'new'}
                open={!!taskDialog}
                initial={taskDialog?.initial ?? null}
                loading={createTask.isPending || updateTask.isPending}
                onClose={() => setTaskDialog(null)}
                onSubmit={onTaskSubmit}
            />

            <ConfirmDialog
                open={!!deleteConfirm}
                title="Delete task?"
                description="This task will be permanently removed."
                confirmLabel="Delete"
                loading={deleteTask.isPending}
                onCancel={() => setDeleteConfirm(null)}
                onConfirm={onTaskDelete}
            />
        </div>
    )
}

export default AdminLessonEditPage
