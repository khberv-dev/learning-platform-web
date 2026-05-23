import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourse} from '@/services/course/query.js'
import {useCreateUnit, useDeleteUnit, useUpdateUnit} from '@/services/unit/query.js'
import {useCreateLesson, useDeleteLesson} from '@/services/lesson/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {cdnUrl} from '@/services/config.js'

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

    const [confirm, setConfirm] = useState(null)
    const [editingUnit, setEditingUnit] = useState(null)
    const [editingUnitTitle, setEditingUnitTitle] = useState('')
    const [newUnitTitle, setNewUnitTitle] = useState('')
    const [addingUnit, setAddingUnit] = useState(false)

    useEffect(() => {
        setHeader({title: 'Course Manager', onBack: () => navigate('/admin/courses')})
        return () => setHeader({})
    }, [setHeader, navigate])

    if (!course) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    const onCreateUnit = () => {
        if (!newUnitTitle.trim()) return
        createUnit.mutate({courseId: course.id, data: {title: newUnitTitle.trim()}}, {
            onSuccess: () => {setNewUnitTitle(''); setAddingUnit(false)},
        })
    }
    const onSaveUnit = () => {
        updateUnit.mutate({courseId: course.id, unitId: editingUnit, data: {title: editingUnitTitle}}, {
            onSuccess: () => setEditingUnit(null),
        })
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, flex: 1}}>
            <Card padding={20}>
                <div style={{display: 'flex', gap: 20, alignItems: 'flex-start'}}>
                    <div style={{
                        width: 200, height: 116, borderRadius: 8,
                        background: course.image ? `center/cover no-repeat url(${cdnUrl(course.image)})` : 'var(--it-danger-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, fontWeight: 700, color: 'var(--it-danger-text)',
                    }}>
                        {!course.image && (course.title?.slice(0, 2).toUpperCase() ?? '?')}
                    </div>
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <h2 style={{fontSize: 20, fontWeight: 700, color: 'var(--it-text-primary)'}}>{course.title}</h2>
                            <Button variant="secondary" size="sm" leftIcon="pencil" onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>Edit Details</Button>
                        </div>
                        <p style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>{course.description ?? 'No description.'}</p>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{fontSize: 13, color: 'var(--it-text-tertiary)'}}>
                                {course.units?.length ?? 0} units · {course.lessonsCount ?? 0} lessons · {course.price ? `${course.price.toLocaleString()} UZS` : 'Free'}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 4}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <h3 style={{fontSize: 16, fontWeight: 700}}>Units</h3>
                    <span className="it-badge it-badge--neutral it-badge--sm">{course.units?.length ?? 0}</span>
                </div>
                <Button leftIcon="plus" size="sm" onClick={() => setAddingUnit(true)}>Add Unit</Button>
            </div>

            {addingUnit && (
                <Card padding={16} style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                    <input
                        autoFocus
                        value={newUnitTitle}
                        onChange={(e) => setNewUnitTitle(e.target.value)}
                        placeholder="New unit title"
                        style={{flex: 1, height: 40, padding: '0 14px', borderRadius: 8, border: '1px solid var(--it-border-strong)', fontSize: 14}}
                    />
                    <Button size="sm" onClick={onCreateUnit} disabled={createUnit.isPending}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={() => {setAddingUnit(false); setNewUnitTitle('')}}>Cancel</Button>
                </Card>
            )}

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
                        {editingUnit === unit.id ? (
                            <input
                                autoFocus
                                value={editingUnitTitle}
                                onChange={(e) => setEditingUnitTitle(e.target.value)}
                                onBlur={onSaveUnit}
                                onKeyDown={(e) => e.key === 'Enter' && onSaveUnit()}
                                style={{flex: 1, fontSize: 15, fontWeight: 600, border: 0, outline: 0, padding: '4px 0'}}
                            />
                        ) : (
                            <span style={{flex: 1, fontSize: 15, fontWeight: 600}}>{unit.title}</span>
                        )}
                        <span style={{fontSize: 12, color: 'var(--it-text-secondary)', fontWeight: 500}}>
                            {unit.lessons?.length ?? 0} lessons
                        </span>
                        <IconButton icon="pencil" title="Rename" onClick={() => {setEditingUnit(unit.id); setEditingUnitTitle(unit.title)}}/>
                        <IconButton icon="trash-2" title="Delete unit" onClick={() => setConfirm({kind: 'unit', unitId: unit.id, label: unit.title})}/>
                    </div>
                    <div style={{height: 1, background: 'var(--it-border-row)'}}/>
                    <div style={{padding: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8}}>
                        {(unit.lessons ?? []).map((lesson) => (
                            <div
                                key={lesson.id}
                                style={{display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 12px', background: 'var(--it-surface-input)', borderRadius: 8}}
                            >
                                <div style={{width: 32, height: 32, borderRadius: 6, background: 'var(--it-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--it-text-secondary)'}}>
                                    <Icon name="play-circle" size={18}/>
                                </div>
                                <span style={{flex: 1, fontWeight: 500}}>{lesson.title}</span>
                                <IconButton icon="pencil" title="Edit lesson" onClick={() => navigate(`/admin/courses/${course.id}/units/${unit.id}/lessons/${lesson.id}`)}/>
                                <IconButton icon="trash-2" title="Delete lesson" onClick={() => setConfirm({kind: 'lesson', unitId: unit.id, lessonId: lesson.id, label: lesson.title})}/>
                            </div>
                        ))}
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon="plus"
                            onClick={() => {
                                const title = window.prompt('Lesson title')
                                if (!title) return
                                createLesson.mutate({courseId: course.id, unitId: unit.id, data: {title}})
                            }}
                        >
                            Add Lesson
                        </Button>
                    </div>
                </Card>
            ))}

            <ConfirmDialog
                open={!!confirm}
                title={confirm?.kind === 'unit' ? 'Delete unit?' : 'Delete lesson?'}
                description={`"${confirm?.label}" will be removed.`}
                confirmLabel="Delete"
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
