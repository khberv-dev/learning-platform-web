import {useEffect, useMemo} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetStudents} from '@/services/student/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {fullName} from '@/utils/lib.js'
import {toaster} from '@/services/toaster.js'

export function AdminStudentEditPage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data} = useGetStudents({page: 1, limit: 100})
    const student = useMemo(() => (data?.data ?? []).find(s => s.id === id), [data, id])

    useEffect(() => {
        setHeader({title: 'Edit Student', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const {register, handleSubmit, reset} = useForm({
        defaultValues: {firstName: '', lastName: '', email: '', phoneNumber: '', level: 'A1'},
    })

    useEffect(() => {
        if (!student) return
        reset({
            firstName: student.user?.firstName ?? '',
            lastName: student.user?.lastName ?? '',
            email: student.user?.email ?? '',
            phoneNumber: student.user?.phoneNumber?.replace(/^998/, '') ?? '',
            level: student.level ?? 'A1',
        })
    }, [student, reset])

    const onSubmit = () => {
        toaster.add({name: 'no-admin-student-update', content: 'Student update endpoint is not exposed by the API yet.', theme: 'warning', timeout: 4000})
    }

    if (!student) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
                    <Avatar name={fullName(student.user)} src={student.user?.avatar} size={80} fontSize={28}/>
                    <div>
                        <div style={{fontSize: 16, fontWeight: 700}}>{fullName(student.user)}</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Update student details</div>
                    </div>
                </div>
                <Row>
                    <FormField label="First Name"><Input {...register('firstName')}/></FormField>
                    <FormField label="Last Name"><Input {...register('lastName')}/></FormField>
                </Row>
                <Row>
                    <FormField label="Email"><Input leftIcon="mail" {...register('email')}/></FormField>
                    <FormField label="Phone Number">
                        <div className="it-input it-input--lg">
                            <span style={{paddingRight: 12, borderRight: '1px solid var(--it-border-strong)', color: 'var(--it-text-body)'}}>+998</span>
                            <input type="tel" className="it-input__el" {...register('phoneNumber')}/>
                        </div>
                    </FormField>
                </Row>
                <FormField label="Level">
                    <select className="it-input__el" {...register('level')} style={{height: 44, padding: '0 14px', borderRadius: 8, border: '1px solid var(--it-border-strong)', background: 'var(--it-surface-input)'}}>
                        {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </FormField>

                <div style={{flex: 1}}/>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg">Save Changes</Button>
                </div>
            </Card>
        </form>
    )
}
function Row({children}) {
    return <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>{children}</div>
}

export default AdminStudentEditPage
