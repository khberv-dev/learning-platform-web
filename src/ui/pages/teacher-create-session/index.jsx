import {useEffect, useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useCreateLiveLesson} from '@/services/live-lesson/query.js'
import {useGetGroups} from '@/services/group/query.js'
import {useGetTeacherAssignmentHistory} from '@/services/assignment/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {fullName} from '@/utils/lib.js'

export function TeacherCreateSessionPage() {
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const [sessionType, setSessionType] = useState('group')

    const {data: groupsData} = useGetGroups({limit: 100})
    const {data: assignmentsData} = useGetTeacherAssignmentHistory({limit: 100})
    const groups = (groupsData?.data ?? []).filter(g => g.isActive)
    const assignments = (assignmentsData?.data ?? []).filter(a => a.status === 'ACTIVE')

    const create = useCreateLiveLesson({onSuccess: () => navigate('/teacher/sessions')})

    useEffect(() => {
        setHeader({title: 'Create Live Session', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {name: '', meetLink: '', startTime: '', endTime: '', groupId: '', assignmentId: ''},
    })

    const onSubmit = (values) => {
        const payload = {
            name: values.name,
            meetLink: values.meetLink,
            startTime: new Date(values.startTime).toISOString(),
            endTime: new Date(values.endTime).toISOString(),
        }
        if (sessionType === 'group') {
            payload.groupId = values.groupId
        } else {
            payload.assignmentId = values.assignmentId
        }
        create.mutate(payload)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%'}}>

                <FormField label="Session Type">
                    <div style={{display: 'flex', gap: 8}}>
                        <TypeToggle active={sessionType === 'group'} onClick={() => setSessionType('group')}>Group</TypeToggle>
                        <TypeToggle active={sessionType === 'assignment'} onClick={() => setSessionType('assignment')}>Individual (Assignment)</TypeToggle>
                    </div>
                </FormField>

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

                {sessionType === 'group' ? (
                    <FormField label="Group">
                        <select {...register('groupId', {required: 'Required'})} style={{height: 40, borderRadius: 8, border: '1px solid var(--it-border)', padding: '0 12px', width: '100%', background: 'var(--it-surface)', color: 'var(--it-text-primary)'}}>
                            <option value="">Select a group…</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </FormField>
                ) : (
                    <FormField label="Assignment">
                        <select {...register('assignmentId', {required: 'Required'})} style={{height: 40, borderRadius: 8, border: '1px solid var(--it-border)', padding: '0 12px', width: '100%', background: 'var(--it-surface)', color: 'var(--it-text-primary)'}}>
                            <option value="">Select an assignment…</option>
                            {assignments.map(a => <option key={a.id} value={a.id}>{fullName(a.student?.user)}</option>)}
                        </select>
                    </FormField>
                )}

                <div style={{flex: 1}}/>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg" leftIcon="plus" disabled={create.isPending}>Create Session</Button>
                </div>
            </Card>
        </form>
    )
}

function TypeToggle({active, onClick, children}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                border: `1px solid ${active ? 'var(--it-brand)' : 'var(--it-border)'}`,
                background: active ? 'var(--it-brand-bg)' : 'var(--it-surface)',
                color: active ? 'var(--it-brand)' : 'var(--it-text-secondary)',
            }}
        >
            {children}
        </button>
    )
}

export default TeacherCreateSessionPage
