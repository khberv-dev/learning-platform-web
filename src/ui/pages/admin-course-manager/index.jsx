import {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourse} from '@/services/course/query.js'
import {useCreateUnit, useDeleteUnit, useUpdateUnit} from '@/services/unit/query.js'
import {useCreateLesson, useDeleteLesson} from '@/services/lesson/query.js'
import {useGetPlans, useCreatePlan, useUpdatePlan, useSetPlanActive, useDeletePlan} from '@/services/plan/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {FileUpload} from '@/ui/components/image-upload/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {Switch} from '@/ui/components/switch/index.jsx'
import {cdnUrl} from '@/services/config.js'
import {formatNumber} from '@/utils/lib.js'

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

// Mounted only while open, so the initial values below double as a reset.
function PlanDialog({initial, loading, onClose, onSubmit}) {
    const [title, setTitle] = useState(initial?.title ?? '')
    const [price, setPrice] = useState(initial?.price ?? 0)
    const [month, setMonth] = useState(initial?.month ?? 1)
    const [hasMentor, setHasMentor] = useState(!!initial?.hasMentor)
    const [isActive, setIsActive] = useState(initial ? !!initial.isActive : true)

    const monthNum = Number(month)
    const valid = title.trim() && Number.isInteger(monthNum) && monthNum >= 1

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!valid) return
        onSubmit({
            title: title.trim(),
            price: Number(price) || 0,
            month: monthNum,
            hasMentor,
            isActive,
        })
    }

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form className="it-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="it-dialog__title">{initial ? 'Edit Plan' : 'Add Plan'}</div>

                <FormField label="Title">
                    <Input placeholder="e.g. Standart" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus/>
                </FormField>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                    <FormField label="Price (UZS)">
                        <Input type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(e.target.value)}/>
                    </FormField>
                    <FormField label="Duration (months)">
                        <Input type="number" min={1} step={1} value={month} onChange={(e) => setMonth(e.target.value)}/>
                    </FormField>
                </div>

                <FormField label="Mentor" hint="Whether a mentor is assigned on this plan.">
                    <div style={{height: 44, display: 'flex', alignItems: 'center'}}>
                        <Switch checked={hasMentor} onChange={setHasMentor} label={hasMentor ? 'Included' : 'Not included'}/>
                    </div>
                </FormField>

                <FormField label="Status">
                    <div style={{height: 44, display: 'flex', alignItems: 'center'}}>
                        <Switch checked={isActive} onChange={setIsActive} label={isActive ? 'Active' : 'Inactive'}/>
                    </div>
                </FormField>

                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={!valid || loading}>
                        {loading ? 'Saving…' : initial ? 'Save Changes' : 'Add Plan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

function PlansSection({courseId}) {
    const {data, isLoading} = useGetPlans(courseId)
    const [dialog, setDialog] = useState(null)   // null | {} | { ...plan }
    const [confirm, setConfirm] = useState(null)

    const create = useCreatePlan({onSuccess: () => setDialog(null)})
    const update = useUpdatePlan({onSuccess: () => setDialog(null)})
    const setActive = useSetPlanActive()
    const remove = useDeletePlan({onSuccess: () => setConfirm(null)})

    const plans = data ?? []
    const editing = dialog?.id ? dialog : null

    const handleSubmit = (values) => {
        if (editing) update.mutate({courseId, planId: editing.id, data: values})
        else create.mutate({courseId, data: values})
    }

    return (
        <>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 4}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <h3 style={{fontSize: 16, fontWeight: 700}}>Plans</h3>
                    <span className="it-badge it-badge--neutral it-badge--sm">{plans.length}</span>
                </div>
                <Button leftIcon="plus" size="sm" onClick={() => setDialog({})}>Add Plan</Button>
            </div>

            <Card padding={16} gap={8}>
                {isLoading && plans.length === 0 ? (
                    <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Loading…</span>
                ) : plans.length === 0 ? (
                    <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                        No plans yet. Students pick a plan to start a paid enrollment.
                    </span>
                ) : plans.map((plan) => (
                    <div
                        key={plan.id}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12, minHeight: 56,
                            padding: '0 12px', background: 'var(--it-surface-input)', borderRadius: 8,
                            opacity: plan.isActive ? 1 : 0.6,
                        }}
                    >
                        <div style={{
                            width: 32, height: 32, borderRadius: 6, background: 'var(--it-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--it-text-secondary)',
                        }}>
                            <Icon name="tag" size={18}/>
                        </div>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                            <span style={{fontWeight: 500}}>{plan.title}</span>
                            <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                {plan.month} month{plan.month === 1 ? '' : 's'}
                                {plan.hasMentor ? ' · with mentor' : ''}
                            </span>
                        </div>
                        <span style={{fontWeight: 600, color: 'var(--it-text-primary)'}}>
                            {plan.price ? `${formatNumber(plan.price)} UZS` : 'Free'}
                        </span>
                        <Switch
                            checked={!!plan.isActive}
                            disabled={setActive.isPending}
                            onChange={(next) => setActive.mutate({courseId, planId: plan.id, isActive: next})}
                        />
                        <IconButton icon="pencil" title="Edit plan" onClick={() => setDialog(plan)}/>
                        <IconButton icon="trash-2" title="Delete plan" onClick={() => setConfirm(plan)}/>
                    </div>
                ))}
            </Card>

            {dialog && (
                <PlanDialog
                    initial={editing}
                    loading={create.isPending || update.isPending}
                    onClose={() => setDialog(null)}
                    onSubmit={handleSubmit}
                />
            )}

            <ConfirmDialog
                open={!!confirm}
                title="Delete plan?"
                description={`"${confirm?.title}" will be permanently removed.`}
                confirmLabel="Delete"
                loading={remove.isPending}
                onCancel={() => setConfirm(null)}
                onConfirm={() => remove.mutate({courseId, planId: confirm.id})}
            />
        </>
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

            <PlansSection courseId={course.id}/>

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
