import {useEffect} from 'react'
import {useForm, Controller} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetTeacher, useUpdateTeacher, useChangeTeacherStatus} from '@/services/teacher/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {PhoneInput} from '@/ui/components/phone-input/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {fullName} from '@/utils/lib.js'

export function AdminTeacherEditPage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data: teacher} = useGetTeacher(id)
    const update = useUpdateTeacher({onSuccess: () => navigate(`/admin/teachers/${id}`)})
    const changeStatus = useChangeTeacherStatus()

    useEffect(() => {
        setHeader({title: 'Edit Teacher', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const {register, handleSubmit, control, reset, formState: {errors}} = useForm({
        defaultValues: {firstName: '', lastName: '', email: '', phoneNumber: '', profession: '', status: 'active'},
    })

    useEffect(() => {
        if (!teacher) return
        reset({
            firstName: teacher.user?.firstName ?? '',
            lastName: teacher.user?.lastName ?? '',
            email: teacher.user?.email ?? '',
            phoneNumber: teacher.user?.phoneNumber?.replace(/^998/, '') ?? '',
            profession: teacher.profession ?? '',
            status: teacher.status ?? 'active',
        })
    }, [teacher, reset])

    const onSubmit = (v) => {
        const phone = '998' + String(v.phoneNumber).replace(/\D/g, '').slice(-9)
        update.mutate({
            id,
            data: {
                firstName: v.firstName,
                lastName: v.lastName || undefined,
                email: v.email || undefined,
                phoneNumber: phone,
                profession: v.profession || undefined,
            },
        })
        if (v.status && teacher && v.status !== teacher.status) {
            changeStatus.mutate({id, status: v.status})
        }
    }

    if (!teacher) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
                    <Avatar name={fullName(teacher.user)} src={teacher.user?.avatar} size={80} fontSize={28}/>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <div style={{fontSize: 16, fontWeight: 700, color: 'var(--it-text-primary)'}}>{fullName(teacher.user)}</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Update teacher details</div>
                    </div>
                </div>

                <Row>
                    <FormField label="First Name" error={errors.firstName?.message}>
                        <Input {...register('firstName', {required: 'Required'})}/>
                    </FormField>
                    <FormField label="Last Name">
                        <Input {...register('lastName')}/>
                    </FormField>
                </Row>

                <Row>
                    <FormField label="Email">
                        <Input leftIcon="mail" {...register('email')}/>
                    </FormField>
                    <FormField label="Phone Number">
                        <PhoneInput control={control}/>
                    </FormField>
                </Row>

                <Row>
                    <FormField label="Subject / Specialization">
                        <Input leftIcon="book-open" {...register('profession')}/>
                    </FormField>
                    <FormField label="Status">
                        <Controller
                            control={control}
                            name="status"
                            render={({field}) => (
                                <select className="it-input__el" {...field} style={{height: 44, padding: '0 14px', borderRadius: 8, border: '1px solid var(--it-border-strong)', background: 'var(--it-surface-input)'}}>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="fired">Fired</option>
                                </select>
                            )}
                        />
                    </FormField>
                </Row>

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

function Row({children}) {
    return <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>{children}</div>
}

export default AdminTeacherEditPage
