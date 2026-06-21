import {useEffect, useMemo} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useCreateLiveLesson} from '@/services/live-lesson/query.js'
import {useGetTeacherAssignmentHistory} from '@/services/assignment/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {fullName} from '@/utils/lib.js'

export function TeacherCreateSessionPage() {
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const create = useCreateLiveLesson({onSuccess: () => navigate('/teacher/sessions')})
    const {data: historyPage, isLoading: assignmentsLoading} = useGetTeacherAssignmentHistory({page: 1, limit: 100})

    const activeAssignments = useMemo(() => {
        return (historyPage?.data ?? []).filter(a => a.status === 'active')
    }, [historyPage])

    useEffect(() => {
        setHeader({title: 'Create Live Session', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const now = new Date()
    const later = new Date(now.getTime() + 60 * 60 * 1000)
    const fmtLocal = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {name: '', meetLink: '', startTime: fmtLocal(now), endTime: fmtLocal(later), assignmentId: ''},
    })

    const onSubmit = (values) => {
        create.mutate({
            name: values.name,
            meetLink: values.meetLink,
            startTime: new Date(values.startTime).toISOString(),
            endTime: new Date(values.endTime).toISOString(),
            assignmentId: values.assignmentId,
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

                <FormField
                    label="Student"
                    hint={activeAssignments.length === 0 && !assignmentsLoading ? 'No active assignments found.' : undefined}
                >
                    <div className={`it-input${errors.assignmentId ? ' it-input--invalid' : ''}`} style={{padding: 0}}>
                        <select
                            {...register('assignmentId', {required: 'Required'})}
                            disabled={assignmentsLoading}
                            style={{
                                flex: 1, height: '100%', background: 'transparent',
                                border: 0, outline: 0, padding: '0 14px',
                                color: 'var(--it-text-primary)', fontSize: 14, cursor: 'pointer',
                            }}
                        >
                            <option value="">
                                {assignmentsLoading ? 'Loading…' : 'Select a student'}
                            </option>
                            {activeAssignments.map(a => (
                                <option key={a.id} value={a.id}>
                                    {fullName(a.student?.user) || `Assignment ${a.id.slice(0, 8)}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </FormField>

                <div style={{flex: 1}}/>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg" leftIcon="plus" disabled={create.isPending || assignmentsLoading}>
                        Create Session
                    </Button>
                </div>
            </Card>
        </form>
    )
}

export default TeacherCreateSessionPage
