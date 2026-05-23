import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {Button} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {toaster} from '@/services/toaster.js'

export function TeacherCreateSessionPage() {
    const navigate = useNavigate()
    const {setHeader} = useHeader()

    useEffect(() => {
        setHeader({title: 'Create Live Session', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {name: '', date: '', time: '', duration: 60, link: '', description: ''},
    })

    const onSubmit = () => {
        toaster.add({name: 'sess-created', content: 'Session created (local stub — wire to API when available).', theme: 'success', timeout: 3000})
        navigate('/teacher/sessions')
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%'}}>
                <FormField label="Session Name" hint="Give your session a descriptive name that students will recognize.">
                    <Input placeholder="e.g. Lesson 8: Past Tenses" {...register('name', {required: 'Required'})} invalid={!!errors.name}/>
                </FormField>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: 20}}>
                    <FormField label="Date">
                        <Input type="date" leftIcon="calendar" {...register('date', {required: true})}/>
                    </FormField>
                    <FormField label="Time">
                        <Input type="time" leftIcon="clock" {...register('time', {required: true})}/>
                    </FormField>
                    <FormField label="Duration (min)">
                        <Input type="number" min={15} step={5} {...register('duration')}/>
                    </FormField>
                </div>

                <FormField label="Google Meet Link" hint="Paste your Google Meet link here. Students will use this to join.">
                    <Input leftIcon="link" placeholder="https://meet.google.com/abc-defg-hij" {...register('link', {required: true})}/>
                </FormField>

                <FormField label="Description (Optional)">
                    <Textarea rows={4} placeholder="What will you cover in this session?" {...register('description')}/>
                </FormField>

                <div style={{flex: 1}}/>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg" leftIcon="plus">Create Session</Button>
                </div>
            </Card>
        </form>
    )
}

export default TeacherCreateSessionPage
