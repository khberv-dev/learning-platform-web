import {useEffect} from "react";
import {useNavigate, useParams} from "react-router";
import {useForm} from "react-hook-form";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import {FormText, FormTextArea} from "@/ui/components/form-field/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import {useGetCourse} from "@/services/course/query.js";
import {useDeleteLesson, useUpdateLesson} from "@/services/lesson/query.js";

export default function AdminLessonEditPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const {id, unitId, lessonId} = useParams()

    const {data: course} = useGetCourse(id)
    const updateLesson = useUpdateLesson()
    const deleteLesson = useDeleteLesson()

    useEffect(() => {
        setHeader({title: 'Edit Lesson', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    const unit = course?.units?.find(u => u.id === unitId)
    const lesson = unit?.lessons?.find(l => l.id === lessonId)

    const {register, handleSubmit, reset} = useForm({
        defaultValues: {title: '', description: ''},
    })

    useEffect(() => {
        if (lesson) {
            reset({title: lesson.title ?? '', description: lesson.description ?? ''})
        }
    }, [lesson, reset])

    if (!course || !unit || !lesson) {
        return <SectionCard>Loading...</SectionCard>
    }

    const onSubmit = (values) => {
        updateLesson.mutate(
            {
                courseId: id,
                unitId,
                lessonId,
                dto: {title: values.title, description: values.description || undefined},
            },
            {onSuccess: () => navigate(`/admin/courses/${id}`)},
        )
    }

    const onDelete = () => {
        if (!window.confirm('Delete this lesson?')) return
        deleteLesson.mutate(
            {courseId: id, unitId, lessonId},
            {onSuccess: () => navigate(`/admin/courses/${id}`)},
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            {lesson.media && (
                <SectionCard title={'Current Video'}>
                    <video
                        controls
                        style={{width: '100%', borderRadius: 10, background: '#000'}}
                        src={lesson.media}
                    />
                </SectionCard>
            )}

            <SectionCard title={'Lesson Details'}>
                <FormText label={'Title'} required {...register('title', {required: true})}/>
                <FormTextArea label={'Description'} {...register('description')}/>
            </SectionCard>

            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <Button view={'outlined'} size={'l'} onClick={onDelete} loading={deleteLesson.isPending}>
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--it-danger-text)'}}>
                        <Icon name={'trash'} size={14} color={'var(--it-danger-text)'}/>
                        Delete Lesson
                    </span>
                </Button>
                <div style={{display: 'flex', gap: 8}}>
                    <Button view={'outlined'} size={'l'} onClick={() => navigate(-1)}>Cancel</Button>
                    <Button
                        type={'submit'}
                        view={'action'}
                        size={'l'}
                        loading={updateLesson.isPending}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </form>
    )
}
