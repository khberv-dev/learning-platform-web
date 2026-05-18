import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Button, TextInput} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import {useDeleteCourse, useGetCourse} from "@/services/course/query.js";
import {useCreateUnit, useDeleteUnit, useUpdateUnit} from "@/services/unit/query.js";
import {useCreateLesson, useDeleteLesson} from "@/services/lesson/query.js";

export default function AdminCourseManagerPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const {id} = useParams()

    const {data: course, isLoading} = useGetCourse(id)
    const deleteCourse = useDeleteCourse()
    const createUnit = useCreateUnit()
    const updateUnit = useUpdateUnit()
    const deleteUnit = useDeleteUnit()
    const createLesson = useCreateLesson()
    const deleteLesson = useDeleteLesson()

    const [newUnitTitle, setNewUnitTitle] = useState('')
    const [unitEditingId, setUnitEditingId] = useState(null)
    const [unitDraftTitle, setUnitDraftTitle] = useState('')
    const [lessonDraft, setLessonDraft] = useState({unitId: null, title: '', description: '', media: null})

    useEffect(() => {
        setHeader({title: 'Course Manager', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    if (isLoading || !course) {
        return <SectionCard>Loading...</SectionCard>
    }

    const onAddUnit = () => {
        if (!newUnitTitle.trim()) return
        createUnit.mutate(
            {courseId: id, dto: {title: newUnitTitle.trim()}},
            {onSuccess: () => setNewUnitTitle('')},
        )
    }

    const onSaveUnitTitle = (unitId) => {
        updateUnit.mutate(
            {courseId: id, unitId, dto: {title: unitDraftTitle}},
            {onSuccess: () => setUnitEditingId(null)},
        )
    }

    const onAddLesson = (unitId) => {
        if (!lessonDraft.title.trim()) return
        createLesson.mutate(
            {
                courseId: id,
                unitId,
                dto: {title: lessonDraft.title.trim(), description: lessonDraft.description || undefined},
                media: lessonDraft.media ?? undefined,
            },
            {onSuccess: () => setLessonDraft({unitId: null, title: '', description: '', media: null})},
        )
    }

    const onDeleteCourse = () => {
        if (!window.confirm('Delete this course?')) return
        deleteCourse.mutate(id, {onSuccess: () => navigate('/admin/courses')})
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <SectionCard>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 12,
                                background: 'rgba(24, 201, 106, 0.12)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon name={'book-open'} color={'var(--it-green)'} size={26}/>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                            <span style={{fontSize: 20, fontWeight: 700}}>{course.title}</span>
                            <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                                {course.units?.length ?? 0} units • {course.lessonsCount ?? 0} lessons • Price {course.price}
                            </span>
                        </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                        <ResourceBadge active={course.isActive}>{course.isActive ? 'Active' : 'Draft'}</ResourceBadge>
                        <Button view={'outlined'} onClick={onDeleteCourse} loading={deleteCourse.isPending}>
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--it-danger-text)'}}>
                                <Icon name={'trash'} size={14} color={'var(--it-danger-text)'}/>
                                Delete
                            </span>
                        </Button>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title={'Add Unit'}>
                <div style={{display: 'flex', gap: 8}}>
                    <TextInput
                        size={'l'}
                        placeholder={'New unit title'}
                        value={newUnitTitle}
                        onUpdate={setNewUnitTitle}
                        style={{flex: 1}}
                    />
                    <Button view={'action'} size={'l'} onClick={onAddUnit} loading={createUnit.isPending}>
                        Add Unit
                    </Button>
                </div>
            </SectionCard>

            {(course.units ?? []).map(unit => (
                <SectionCard key={unit.id}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
                        {unitEditingId === unit.id ? (
                            <>
                                <TextInput
                                    size={'l'}
                                    value={unitDraftTitle}
                                    onUpdate={setUnitDraftTitle}
                                    style={{flex: 1}}
                                />
                                <Button view={'action'} onClick={() => onSaveUnitTitle(unit.id)} loading={updateUnit.isPending}>
                                    Save
                                </Button>
                                <Button view={'outlined'} onClick={() => setUnitEditingId(null)}>Cancel</Button>
                            </>
                        ) : (
                            <>
                                <span style={{fontSize: 16, fontWeight: 700}}>{unit.title}</span>
                                <div style={{display: 'flex', gap: 8}}>
                                    <Button
                                        view={'flat'}
                                        onClick={() => {
                                            setUnitEditingId(unit.id)
                                            setUnitDraftTitle(unit.title)
                                        }}
                                    >
                                        <Icon name={'pencil'} size={16}/>
                                    </Button>
                                    <Button
                                        view={'flat'}
                                        onClick={() => {
                                            if (window.confirm('Delete this unit?')) {
                                                deleteUnit.mutate({courseId: id, unitId: unit.id})
                                            }
                                        }}
                                    >
                                        <Icon name={'trash'} size={16} color={'var(--it-danger-text)'}/>
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {(unit.lessons ?? []).map((l, i) => (
                        <div
                            key={l.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: 12,
                                border: '1px solid var(--it-border)',
                                borderRadius: 10,
                            }}
                        >
                            <span style={{fontSize: 13, color: 'var(--it-text-secondary)', width: 24}}>
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: '#F3F4F6',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon name={'play'} size={14} color={'var(--it-text-secondary)'}/>
                            </div>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                                <span style={{fontSize: 14, fontWeight: 600}}>{l.title}</span>
                                <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                    {l.description ?? '—'}
                                </span>
                            </div>
                            <Button
                                view={'flat'}
                                onClick={() => navigate(`/admin/courses/${id}/units/${unit.id}/lessons/${l.id}/edit`)}
                            >
                                <Icon name={'pencil'} size={14}/>
                            </Button>
                            <Button
                                view={'flat'}
                                onClick={() => {
                                    if (window.confirm('Delete this lesson?')) {
                                        deleteLesson.mutate({courseId: id, unitId: unit.id, lessonId: l.id})
                                    }
                                }}
                            >
                                <Icon name={'trash'} size={14} color={'var(--it-danger-text)'}/>
                            </Button>
                        </div>
                    ))}

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr auto auto',
                            gap: 8,
                            alignItems: 'center',
                            padding: 12,
                            border: '1px dashed var(--it-border)',
                            borderRadius: 10,
                        }}
                    >
                        <TextInput
                            placeholder={'Lesson title'}
                            value={lessonDraft.unitId === unit.id ? lessonDraft.title : ''}
                            onUpdate={(v) => setLessonDraft({...lessonDraft, unitId: unit.id, title: v})}
                        />
                        <TextInput
                            placeholder={'Description'}
                            value={lessonDraft.unitId === unit.id ? lessonDraft.description : ''}
                            onUpdate={(v) => setLessonDraft({...lessonDraft, unitId: unit.id, description: v})}
                        />
                        <label style={{display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer'}}>
                            <input
                                type={'file'}
                                accept={'video/*'}
                                style={{display: 'none'}}
                                onChange={(e) =>
                                    setLessonDraft({
                                        ...lessonDraft,
                                        unitId: unit.id,
                                        media: e.target.files?.[0] ?? null,
                                    })
                                }
                            />
                            <Icon name={'upload'} size={14} color={'var(--it-text-secondary)'}/>
                            <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                {lessonDraft.unitId === unit.id && lessonDraft.media
                                    ? lessonDraft.media.name
                                    : 'Video'}
                            </span>
                        </label>
                        <Button
                            view={'action'}
                            onClick={() => onAddLesson(unit.id)}
                            loading={createLesson.isPending && lessonDraft.unitId === unit.id}
                        >
                            <Icon name={'plus'} size={14} color={'#FFFFFF'}/>
                        </Button>
                    </div>
                </SectionCard>
            ))}
        </div>
    )
}
