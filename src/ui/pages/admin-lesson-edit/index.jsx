import {useEffect, useMemo, useRef, useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourse} from '@/services/course/query.js'
import {useUpdateLesson, useUploadLessonMedia} from '@/services/lesson/query.js'
import {useListTasks, useCreateTask, useUpdateTask, useUploadTaskFile, useDeleteTask} from '@/services/task/query.js'
import {useListMaterials, useCreateMaterial, useDeleteMaterial} from '@/services/material/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {UploadProgress} from '@/ui/components/upload-progress/index.jsx'
import {cdnUrl} from '@/services/config.js'

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

// ── Task dialog (create / edit) ───────────────────────────────────────────────

function TaskDialog({open, initial = null, onClose, onSubmit, loading}) {
    const [name, setName] = useState('')
    const [questions, setQuestions] = useState([newQ()])

    useEffect(() => {
        if (!open) return
        setName(initial?.name ?? '')
        if (initial?.questions?.length) {
            setQuestions(initial.questions.map((q, i) => ({
                id: String(i),
                question: q.question,
                options: (q.options ?? []).map((v, j) => ({id: String(j), value: v})),
                answer: q.answer,
            })))
        } else {
            setQuestions([newQ()])
        }
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!open) return null

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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!questions.every(q => q.question.trim() && q.answer.trim())) return
        onSubmit({
            name: name.trim() || null,
            questions: questions.map(q => {
                const optionValues = q.options.map(o => o.value.trim()).filter(Boolean)
                return {
                    question: q.question.trim(),
                    options: optionValues.length > 0 ? optionValues : null,
                    answer: q.answer.trim(),
                }
            }),
        })
    }

    const canSubmit = questions.length > 0 && questions.every(q => q.question.trim() && q.answer.trim())

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form
                className="it-dialog"
                style={{maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <div className="it-dialog__title">{initial ? 'Edit Task' : 'Add Task'}</div>

                <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 4}}>
                    <FormField label="Task Name" hint="Optional — shown as a title for this task.">
                        <Input
                            placeholder="e.g. Greeting quiz"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                    >
                        Add Question
                    </Button>
                </div>

                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={!canSubmit || loading}>
                        {loading ? 'Saving…' : initial ? 'Save Changes' : 'Add Task'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({task, courseId, unitId, lessonId, onEdit, onDelete}) {
    const fileInputRef = useRef(null)
    const [localFile, setLocalFile] = useState(null)  // null | { url, contentType }
    const [fileProgress, setFileProgress] = useState(null)
    const uploadFile = useUploadTaskFile({onSuccess: () => { setLocalFile(null); setFileProgress(null) }})

    const questions = task.questions ?? []
    const contentType = localFile?.contentType ?? task.contentType
    const fileSrc = localFile?.url ?? (task.file ? cdnUrl(task.file) : null)
    const isPicture = contentType === 'picture'

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px',
            background: 'var(--it-surface-input)', borderRadius: 10,
        }}>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
                {task.name && (
                    <span style={{fontWeight: 700, fontSize: 15, color: 'var(--it-text-primary)'}}>{task.name}</span>
                )}
                {questions.map((q, idx) => (
                    <div key={idx} style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                        {questions.length > 1 && (
                            <span style={{fontSize: 11, fontWeight: 600, color: 'var(--it-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                                Q{idx + 1}
                            </span>
                        )}
                        <span style={{fontWeight: 600, fontSize: 14, color: 'var(--it-text-primary)'}}>{q.question}</span>
                        {q.options?.length > 0 && (
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                                {q.options.map((opt) => (
                                    <span
                                        key={opt}
                                        style={{
                                            padding: '2px 10px', borderRadius: 999,
                                            fontSize: 12, fontWeight: 500,
                                            background: opt === q.answer
                                                ? 'var(--it-success-bg)' : 'var(--it-surface-alt)',
                                            color: opt === q.answer
                                                ? 'var(--it-success-text)' : 'var(--it-text-secondary)',
                                            border: opt === q.answer
                                                ? '1px solid var(--it-success-border)' : '1px solid var(--it-border)',
                                        }}
                                    >
                                        {opt === q.answer && '✓ '}{opt}
                                    </span>
                                ))}
                            </div>
                        )}
                        {!q.options?.length && (
                            <span style={{fontSize: 12, color: 'var(--it-success-text)', fontWeight: 500}}>
                                Answer: {q.answer}
                            </span>
                        )}
                    </div>
                ))}

                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,image/*"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            e.target.value = ''
                            if (!f) return
                            setLocalFile({
                                url: URL.createObjectURL(f),
                                contentType: f.type.startsWith('image/') ? 'picture' : 'audio',
                            })
                            uploadFile.mutate({courseId, unitId, lessonId, taskId: task.id, file: f, onProgress: setFileProgress})
                        }}
                    />
                    {fileSrc ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                            {isPicture ? (
                                <img
                                    key={fileSrc} src={fileSrc} alt=""
                                    style={{width: '100%', maxWidth: 240, borderRadius: 8, border: '1px solid var(--it-border)'}}
                                />
                            ) : (
                                <audio key={fileSrc} src={fileSrc} controls style={{width: '100%', maxWidth: 360, height: 36}}/>
                            )}
                            <UploadProgress progress={fileProgress}/>
                            <Button
                                type="button" variant="secondary" size="sm" leftIcon="refresh-cw"
                                disabled={uploadFile.isPending}
                                onClick={() => fileInputRef.current?.click()}
                                style={{alignSelf: 'flex-start'}}
                            >
                                {uploadFile.isPending ? 'Uploading…' : isPicture ? 'Replace image' : 'Replace audio'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <UploadProgress progress={fileProgress}/>
                            <Button
                                type="button" variant="secondary" size="sm" leftIcon="paperclip"
                                disabled={uploadFile.isPending}
                                onClick={() => fileInputRef.current?.click()}
                                style={{alignSelf: 'flex-start'}}
                            >
                                {uploadFile.isPending ? 'Uploading…' : 'Upload audio or image'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <div style={{display: 'flex', gap: 6, flexShrink: 0}}>
                <IconButton icon="pencil" title="Edit task" onClick={onEdit}/>
                <IconButton icon="trash-2" title="Delete task" onClick={onDelete}/>
            </div>
        </div>
    )
}

// ── Material dialog (add) ──────────────────────────────────────────────────────

function MaterialDialog({open, onClose, onSubmit, loading, progress}) {
    const [name, setName] = useState('')
    const [file, setFile] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (!open) return
        setName('')
        setFile(null)
    }, [open])

    if (!open) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!name.trim() || !file) return
        onSubmit({name: name.trim(), file})
    }

    const canSubmit = !!name.trim() && !!file

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form className="it-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="it-dialog__title">Add Material</div>

                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <FormField label="Name">
                        <Input
                            placeholder="Material name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormField>

                    <FormField label="File" hint="PDF or image">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,image/*"
                            hidden
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                        <div className="it-upload" onClick={() => !loading && fileInputRef.current?.click()}>
                            <Icon name={file ? 'file-check-2' : 'upload'} size={24}/>
                            <span style={{fontWeight: 600, color: 'var(--it-text-body)'}}>
                                {file ? file.name : 'Choose a file'}
                            </span>
                            <span className="it-upload__hint">PDF or image</span>
                        </div>
                        <UploadProgress progress={progress}/>
                    </FormField>
                </div>

                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={!canSubmit || loading}>
                        {loading ? 'Uploading…' : 'Add Material'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

// ── Material row ─────────────────────────────────────────────────────────────

function MaterialRow({material, onDelete}) {
    const isPdf = material.type === 'pdf'
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            background: 'var(--it-surface-input)', borderRadius: 10,
        }}>
            <Icon name={isPdf ? 'file-text' : 'image'} size={20} style={{flexShrink: 0, color: 'var(--it-text-secondary)'}}/>
            <a
                href={cdnUrl(material.url)}
                target="_blank"
                rel="noreferrer"
                style={{flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--it-text-primary)', textDecoration: 'none'}}
            >
                {material.name}
            </a>
            <span className="it-badge it-badge--neutral it-badge--sm">{material.type}</span>
            <IconButton icon="trash-2" title="Delete material" onClick={onDelete}/>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminLessonEditPage() {
    const {id: courseId, unitId, lessonId} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()

    const [localMediaPreview, setLocalMediaPreview] = useState(null)
    const [mediaProgress, setMediaProgress] = useState(null)
    const mediaInputRef = useRef(null)

    const {data: course} = useGetCourse(courseId)
    const update = useUpdateLesson({onSuccess: () => navigate(`/admin/courses/${courseId}`)})
    const uploadMedia = useUploadLessonMedia({onSuccess: () => { setLocalMediaPreview(null); setMediaProgress(null) }})

    const {data: tasks = [], isLoading: tasksLoading} = useListTasks(courseId, unitId, lessonId)
    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    const [taskDialog, setTaskDialog] = useState(null)   // null | { initial?: task }
    const [deleteConfirm, setDeleteConfirm] = useState(null)  // null | task

    const {data: materials = [], isLoading: materialsLoading} = useListMaterials(lessonId)
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
    const [materialProgress, setMaterialProgress] = useState(null)
    const [materialDeleteConfirm, setMaterialDeleteConfirm] = useState(null)  // null | material
    const createMaterial = useCreateMaterial({
        onSuccess: () => { setMaterialDialogOpen(false); setMaterialProgress(null) },
    })
    const deleteMaterial = useDeleteMaterial({onSuccess: () => setMaterialDeleteConfirm(null)})

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

    const onMaterialSubmit = ({name, file}) => {
        createMaterial.mutate({lessonId, name, file, onProgress: setMaterialProgress})
    }

    const onMaterialDelete = () => {
        deleteMaterial.mutate({lessonId, materialId: materialDeleteConfirm.id})
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
                    <FormField label="Lesson Video">
                        <input
                            ref={mediaInputRef}
                            type="file"
                            accept="video/*"
                            hidden
                            onChange={(e) => {
                                const f = e.target.files?.[0]
                                e.target.value = ''
                                if (!f) return
                                setLocalMediaPreview(URL.createObjectURL(f))
                                uploadMedia.mutate({courseId, unitId, lessonId, file: f, onProgress: setMediaProgress})
                            }}
                        />
                        {(localMediaPreview ?? cdnUrl(lesson.media)) ? (
                            <>
                                <video
                                    key={localMediaPreview ?? lesson.media}
                                    src={localMediaPreview ?? cdnUrl(lesson.media)}
                                    controls
                                    style={{width: '100%', maxWidth: 480, aspectRatio: '16 / 9', borderRadius: 10, background: '#000', border: '1px solid var(--it-border)'}}
                                />
                                <UploadProgress progress={mediaProgress}/>
                                <Button
                                    variant="secondary" size="sm" leftIcon="refresh-cw"
                                    disabled={uploadMedia.isPending}
                                    onClick={() => mediaInputRef.current?.click()}
                                    style={{marginTop: 4}}
                                >
                                    {uploadMedia.isPending ? 'Uploading…' : 'Replace video'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="it-upload" onClick={() => !uploadMedia.isPending && mediaInputRef.current?.click()}>
                                    <Icon name={uploadMedia.isPending ? 'loader' : 'video'} size={24}/>
                                    <span style={{fontWeight: 600, color: 'var(--it-text-body)'}}>
                                        {uploadMedia.isPending ? 'Uploading…' : 'Upload lesson video'}
                                    </span>
                                    <span className="it-upload__hint">MP4 or WebM</span>
                                </div>
                                <UploadProgress progress={mediaProgress}/>
                            </>
                        )}
                    </FormField>
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
                        courseId={courseId}
                        unitId={unitId}
                        lessonId={lessonId}
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

            {/* Materials */}
            <Card padding={24} gap={16}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <h3 style={{fontSize: 16, fontWeight: 700}}>Materials</h3>
                        <span className="it-badge it-badge--neutral it-badge--sm">{materials.length}</span>
                    </div>
                    <Button leftIcon="plus" size="sm" onClick={() => setMaterialDialogOpen(true)}>Add Material</Button>
                </div>

                {materialsLoading && (
                    <div style={{color: 'var(--it-text-secondary)', fontSize: 14}}>Loading…</div>
                )}

                {!materialsLoading && materials.length === 0 && (
                    <div style={{
                        padding: '32px 0', textAlign: 'center',
                        color: 'var(--it-text-tertiary)', fontSize: 14,
                    }}>
                        <Icon name="paperclip" size={32} style={{marginBottom: 8, opacity: 0.4}}/>
                        <div>No materials yet. Attach a PDF or image for students.</div>
                    </div>
                )}

                {materials.map((material) => (
                    <MaterialRow
                        key={material.id}
                        material={material}
                        onDelete={() => setMaterialDeleteConfirm(material)}
                    />
                ))}
            </Card>

            <MaterialDialog
                open={materialDialogOpen}
                loading={createMaterial.isPending}
                progress={materialProgress}
                onClose={() => { setMaterialDialogOpen(false); setMaterialProgress(null) }}
                onSubmit={onMaterialSubmit}
            />

            <ConfirmDialog
                open={!!materialDeleteConfirm}
                title="Delete material?"
                description="This file will be permanently removed."
                confirmLabel="Delete"
                loading={deleteMaterial.isPending}
                onCancel={() => setMaterialDeleteConfirm(null)}
                onConfirm={onMaterialDelete}
            />
        </div>
    )
}

export default AdminLessonEditPage
