import {useEffect, useMemo} from 'react'
import {useForm, Controller} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourse} from '@/services/course/query.js'
import {useUpdateLesson} from '@/services/lesson/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {FileUpload} from '@/ui/components/image-upload/index.jsx'

export function AdminLessonEditPage() {
    const {id: courseId, unitId, lessonId} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data: course} = useGetCourse(courseId)
    const update = useUpdateLesson({onSuccess: () => navigate(`/admin/courses/${courseId}`)})

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

    const onSubmit = (v) => {
        update.mutate({courseId, unitId, lessonId, data: {title: v.title, description: v.description || undefined}})
    }

    if (!lesson) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%'}}>
                <FormField label="Title">
                    <Input placeholder="Lesson title" {...register('title', {required: true})}/>
                </FormField>
                <FormField label="Description">
                    <Textarea rows={4} placeholder="Lesson description..." {...register('description')}/>
                </FormField>
                <FormField label="Lesson Video" hint="MP4 or WebM video. Upload not currently supported on patch — re-upload by recreating the lesson.">
                    <Controller name="media" defaultValue={null} render={({field}) => (
                        <FileUpload onChange={field.onChange} icon="video" accept="video/*" label="Choose video file"/>
                    )}/>
                </FormField>

                <div style={{flex: 1}}/>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={update.isPending}>
                        {update.isPending ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </Card>
        </form>
    )
}

export default AdminLessonEditPage
