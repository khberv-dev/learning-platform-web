import {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourse} from '@/services/course/query.js'
import {useCreateUnit, useDeleteUnit, useUpdateUnit} from '@/services/unit/query.js'
import {useCreateLesson, useDeleteLesson} from '@/services/lesson/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {FileUpload} from '@/ui/components/image-upload/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {cdnUrl} from '@/services/config.js'

function FieldDialog({open, title, placeholder, defaultValue = '', submitLabel = 'Save', loading, onSubmit, onClose}) {
    const [value, setValue] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        if (open) {
            setValue(defaultValue)
            setTimeout(() => inputRef.current?.focus(), 0)
        }
    }, [open, defaultValue])

    if (!open) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        if (value.trim()) onSubmit(value.trim())
    }

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form className="it-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="it-dialog__title">{title}</div>
                <div className="it-input">
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="it-input__el"
                        onKeyDown={(e) => e.key === 'Escape' && onClose()}
                    />
                </div>
                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={!value.trim() || loading}>
                        {loading ? 'Saving…' : submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    )
}

function LessonDialog({open, onClose, onSubmit, loading}) {
    const [title, setTitle] = useState('')
    const [file, setFile] = useState(null)

    if (!open) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!title.trim()) return
        onSubmit({title: title.trim(), media: file || undefined})
    }

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form className="it-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="it-dialog__title">Add Lesson</div>
                <FormField label="Title">
                    <Input
                        placeholder="Lesson title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                </FormField>
                <FormField label="Video (optional)">
                    <FileUpload onChange={setFile} icon="video" accept="video/*" label="Choose video file"/>
                </FormField>
                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={!title.trim() || loading}>
                        {loading ? 'Adding…' : 'Add Lesson'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export function AdminCourseManagerPage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data: course} = useGetCourse(id)
    const createUnit = useCreateUnit()
    const updateUnit = useUpdateUnit()
    const deleteUnit = useDeleteUnit()
    const createLesson = useCreateLesson()
    const deleteLesson = useDeleteLesson()

    const [dialog, setDialog] = useState(null)
    const [lessonDialog, setLessonDialog] = useState(null)   // null | { unitId }
    const [confirm, setConfirm] = useState(null)

    useEffect(() => {
        setHeader({title: 'Course Manager', onBack: () => navigate('/admin/courses')})
        return () => setHeader({})
    }, [setHeader, navigate])

    if (!course) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    const closeDialog = () => setDialog(null)

    const dialogLoading = createUnit.isPending || updateUnit.isPending

    const handleDialogSubmit = (value) => {
        if (dialog?.kind === 'unit-add') {
            createUnit.mutate({courseId: course.id, data: {title: value}}, {onSuccess: closeDialog})
        } else if (dialog?.kind === 'unit-edit') {
            updateUnit.mutate({courseId: course.id, unitId: dialog.unitId, data: {title: value}}, {onSuccess: closeDialog})
        }
    }

    const dialogProps = {
        'unit-add':  {title: 'Add Unit',    placeholder: 'Unit title', submitLabel: 'Add Unit', defaultValue: ''},
        'unit-edit': {title: 'Rename Unit', placeholder: 'Unit title', submitLabel: 'Save',      defaultValue: dialog?.currentTitle ?? ''},
    }[dialog?.kind] ?? {}

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, flex: 1}}>
            <Card padding={20}>
                <div style={{display: 'flex', gap: 20, alignItems: 'flex-start'}}>
                    <div style={{
                        width: 200, height: 116, borderRadius: 8,
                        background: course.image
                            ? `center/cover no-repeat url(${cdnUrl(course.image)})`
                            : 'var(--it-danger-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, fontWeight: 700, color: 'var(--it-danger-text)',
                    }}>
                        {!course.image && (course.title?.slice(0, 2).toUpperCase() ?? '?')}
                    </div>
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <h2 style={{fontSize: 20, fontWeight: 700, color: 'var(--it-text-primary)'}}>{course.title}</h2>
                            <Button variant="secondary" size="sm" leftIcon="pencil" onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>
                                Edit Details
                            </Button>
                        </div>
                        <p style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>{course.description ?? 'No description.'}</p>
                        <span style={{fontSize: 13, color: 'var(--it-text-tertiary)'}}>
                            {course.units?.length ?? 0} units · {course.lessonsCount ?? 0} lessons · {course.price ? `${course.price.toLocaleString()} UZS` : 'Free'}
                        </span>
                    </div>
                </div>
            </Card>

            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 4}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <h3 style={{fontSize: 16, fontWeight: 700}}>Units</h3>
                    <span className="it-badge it-badge--neutral it-badge--sm">{course.units?.length ?? 0}</span>
                </div>
                <Button leftIcon="plus" size="sm" onClick={() => setDialog({kind: 'unit-add'})}>Add Unit</Button>
            </div>

            {(course.units ?? []).map((unit, idx) => (
                <Card key={unit.id} padding={0}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 16px'}}>
                        <Icon name="grip-vertical" size={16} color="var(--it-text-tertiary)"/>
                        <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: 'rgba(24, 201, 106, 0.10)', color: 'var(--it-green-700)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12,
                        }}>{idx + 1}</div>
                        <span style={{flex: 1, fontSize: 15, fontWeight: 600}}>{unit.title}</span>
                        <span style={{fontSize: 12, color: 'var(--it-text-secondary)', fontWeight: 500}}>
                            {unit.lessons?.length ?? 0} lessons
                        </span>
                        <IconButton
                            icon="pencil"
                            title="Rename unit"
                            onClick={() => setDialog({kind: 'unit-edit', unitId: unit.id, currentTitle: unit.title})}
                        />
                        <IconButton
                            icon="trash-2"
                            title="Delete unit"
                            onClick={() => setConfirm({kind: 'unit', unitId: unit.id, label: unit.title})}
                        />
                    </div>
                    <div style={{height: 1, background: 'var(--it-border-row)'}}/>
                    <div style={{padding: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8}}>
                        {(unit.lessons ?? []).map((lesson) => (
                            <div
                                key={lesson.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12, height: 56,
                                    padding: '0 12px', background: 'var(--it-surface-input)', borderRadius: 8,
                                }}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: 6, background: 'var(--it-surface)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--it-text-secondary)',
                                }}>
                                    <Icon name="play-circle" size={18}/>
                                </div>
                                <span style={{flex: 1, fontWeight: 500}}>{lesson.title}</span>
                                <IconButton
                                    icon="pencil"
                                    title="Edit lesson"
                                    onClick={() => navigate(`/admin/courses/${course.id}/units/${unit.id}/lessons/${lesson.id}`)}
                                />
                                <IconButton
                                    icon="trash-2"
                                    title="Delete lesson"
                                    onClick={() => setConfirm({kind: 'lesson', unitId: unit.id, lessonId: lesson.id, label: lesson.title})}
                                />
                            </div>
                        ))}
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon="plus"
                            onClick={() => setLessonDialog({unitId: unit.id})}
                        >
                            Add Lesson
                        </Button>
                    </div>
                </Card>
            ))}

            <FieldDialog
                key={dialog?.kind + (dialog?.unitId ?? '')}
                open={!!dialog}
                loading={dialogLoading}
                onClose={closeDialog}
                onSubmit={handleDialogSubmit}
                {...dialogProps}
            />

            <LessonDialog
                key={lessonDialog?.unitId}
                open={!!lessonDialog}
                loading={createLesson.isPending}
                onClose={() => setLessonDialog(null)}
                onSubmit={(data) => createLesson.mutate(
                    {courseId: course.id, unitId: lessonDialog.unitId, data},
                    {onSuccess: () => setLessonDialog(null)},
                )}
            />

            <ConfirmDialog
                open={!!confirm}
                title={confirm?.kind === 'unit' ? 'Delete unit?' : 'Delete lesson?'}
                description={`"${confirm?.label}" will be permanently removed.`}
                confirmLabel="Delete"
                loading={deleteUnit.isPending || deleteLesson.isPending}
                onCancel={() => setConfirm(null)}
                onConfirm={() => {
                    if (confirm?.kind === 'unit') {
                        deleteUnit.mutate({courseId: course.id, unitId: confirm.unitId}, {onSuccess: () => setConfirm(null)})
                    } else {
                        deleteLesson.mutate({courseId: course.id, unitId: confirm.unitId, lessonId: confirm.lessonId}, {onSuccess: () => setConfirm(null)})
                    }
                }}
            />
        </div>
    )
}

export default AdminCourseManagerPage
