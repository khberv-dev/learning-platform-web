import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useCreateLiveLesson} from '@/services/live-lesson/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'

export function TeacherCreateSessionPage() {
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const create = useCreateLiveLesson({onSuccess: () => navigate('/teacher/sessions')})

    useEffect(() => {
        setHeader({title: 'Create Live Session', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {name: '', meetLink: '', startTime: '', endTime: '', enrollmentId: ''},
    })

    const onSubmit = (values) => {
        create.mutate({
            name: values.name,
            meetLink: values.meetLink,
            startTime: new Date(values.startTime).toISOString(),
            endTime: new Date(values.endTime).toISOString(),
            enrollmentId: values.enrollmentId,
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%'}}>

                <FormField label="Session Name">
                    <Input placeholder="e.g. Speaking Practice — Unit 3" {...register('name', {required: 'Required'})} invalid={!!errors.name}/>
                </FormField>

                <FormField label="Google Meet Link">
                    <Input leftIcon="link" placeholder="https://meet.google.com/abc-defg-hij" {...register('meetLink', {required: 'Required'})} invalid={!!errors.meetLink}/>
                </FormField>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                    <FormField label="Start Time">
                        <Input type="datetime-local" {...register('startTime', {required: 'Required'})} invalid={!!errors.startTime}/>
                    </FormField>
                    <FormField label="End Time">
                        <Input type="datetime-local" {...register('endTime', {required: 'Required'})} invalid={!!errors.endTime}/>
                    </FormField>
                </div>

                <FormField label="Enrollment ID" hint="The student's enrollment ID. Find it in the active sessions list or ask the admin.">
                    <Input leftIcon="hash" placeholder="en000000-0000-0000-0000-000000000001" {...register('enrollmentId', {required: 'Required'})} invalid={!!errors.enrollmentId}/>
                </FormField>

                <div style={{flex: 1}}/>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg" leftIcon="plus" disabled={create.isPending}>Create Session</Button>
                </div>
            </Card>
        </form>
    )
}

export default TeacherCreateSessionPage
