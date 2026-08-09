import {useEffect, useMemo, useRef, useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourse} from '@/services/course/query.js'
import {useUpdateLesson, useUploadLessonMedia} from '@/services/lesson/query.js'
import {useListTasks, useUploadTaskFile, useDeleteTask} from '@/services/task/query.js'
import {useListMaterials, useCreateMaterial, useDeleteMaterial} from '@/services/material/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {UploadProgress} from '@/ui/components/upload-progress/index.jsx'
import {cdnUrl} from '@/services/config.js'

// ── Task row ──────────────────────────────────────────────────────────────────

const CONTENT_TYPE_ICON = {picture: 'image', audio: 'audio-lines', text: 'file-text'}

function TaskRow({task, courseId, unitId, lessonId, onEdit, onDelete}) {
    const [open, setOpen] = useState(false)
    const fileInputRef = useRef(null)
    const [localFile, setLocalFile] = useState(null)  // null | { url, contentType }
    const [fileProgress, setFileProgress] = useState(null)
    const uploadFile = useUploadTaskFile({onSuccess: () => { setLocalFile(null); setFileProgress(null) }})

    const questions = task.questions ?? []
    const contentType = localFile?.contentType ?? task.contentType
    const isPicture = contentType === 'picture'
    const isText = !localFile && contentType === 'text'
    const fileSrc = localFile?.url ?? (!isText && task.file ? cdnUrl(task.file) : null)

    const title = task.name || questions[0]?.question || 'Untitled task'
    const typeIcon = task.file ? CONTENT_TYPE_ICON[contentType] : null

    return (
        <div style={{background: 'var(--it-surface-input)', borderRadius: 10}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px'}}>
                {/* Only the title area toggles, so the edit/delete buttons stay
                    outside it rather than nesting inside a clickable region. */}
                <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpen(v => !v)}
                    style={{
                        flex: 1, minWidth: 0,
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'none', border: 'none', padding: 0,
                        font: 'inherit', textAlign: 'left', cursor: 'pointer',
                    }}
                >
                    <Icon
                        name={open ? 'chevron-down' : 'chevron-right'}
                        size={18}
                        style={{flexShrink: 0, color: 'var(--it-text-secondary)'}}
                    />
                    <span style={{
                        flex: 1, minWidth: 0,
                        fontWeight: 700, fontSize: 15, color: 'var(--it-text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {title}
                    </span>
                    {typeIcon && (
                        <Icon name={typeIcon} size={16} style={{flexShrink: 0, color: 'var(--it-text-tertiary)'}}/>
                    )}
                    {questions.length > 0 && (
                        <span className="it-badge it-badge--neutral it-badge--sm">
                            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                        </span>
                    )}
                </button>
                <div style={{display: 'flex', gap: 6, flexShrink: 0}}>
                    <IconButton icon="pencil" title="Edit task" onClick={onEdit}/>
                    <IconButton icon="trash-2" title="Delete task" onClick={onDelete}/>
                </div>
            </div>

            {open && (
                <div style={{display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px 14px 46px'}}>
                    {/* Media first — the audio clip or picture is what the questions are about. */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        {isText && (
                            <div style={{
                                padding: '10px 12px', borderRadius: 8,
                                background: 'var(--it-surface-alt)', border: '1px solid var(--it-border)',
                                fontSize: 13, color: 'var(--it-text-body)', whiteSpace: 'pre-wrap',
                            }}>
                                {task.file}
                            </div>
                        )}
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
                </div>
            )}
        </div>
    )
}

// ── Material dialog (add) ──────────────────────────────────────────────────────

// The API only stores `pdf` and `doc` materials; some browsers report Word files
// as application/octet-stream, so extensions are listed alongside the mime types.
const MATERIAL_ACCEPT = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pdf', '.doc', '.docx',
].join(',')

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

                    <FormField label="File" hint="PDF or Word document">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={MATERIAL_ACCEPT}
                            hidden
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                        <div className="it-upload" onClick={() => !loading && fileInputRef.current?.click()}>
                            <Icon name={file ? 'file-check-2' : 'upload'} size={24}/>
                            <span style={{fontWeight: 600, color: 'var(--it-text-body)'}}>
                                {file ? file.name : 'Choose a file'}
                            </span>
                            <span className="it-upload__hint">PDF, DOC or DOCX</span>
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
            <Icon name={isPdf ? 'file-text' : 'file-type-2'} size={20} style={{flexShrink: 0, color: 'var(--it-text-secondary)'}}/>
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
    const deleteTask = useDeleteTask()

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
                    <Button
                        leftIcon="plus"
                        size="sm"
                        onClick={() => navigate(`/admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/new`)}
                    >
                        Add Task
                    </Button>
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
                        onEdit={() => navigate(`/admin/courses/${courseId}/units/${unitId}/lessons/${lessonId}/tasks/${task.id}`)}
                        onDelete={() => setDeleteConfirm(task)}
                    />
                ))}
            </Card>

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
                        <div>No materials yet. Attach a PDF or Word document for students.</div>
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
