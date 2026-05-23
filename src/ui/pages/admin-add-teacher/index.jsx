import {useEffect, useState} from 'react'
import {useForm, Controller} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useCreateTeacher} from '@/services/teacher/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {Switch} from '@/ui/components/switch/index.jsx'

export function AdminAddTeacherPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()

    useEffect(() => {
        setHeader({title: 'Add Teacher', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const create = useCreateTeacher({onSuccess: () => navigate('/admin/teachers')})

    const {register, handleSubmit, control, watch, formState: {errors}} = useForm({
        defaultValues: {
            firstName: '', lastName: '', email: '', phoneNumber: '',
            password: '', confirmPassword: '', profession: '', active: true,
        },
    })

    const onSubmit = (v) => {
        if (v.password !== v.confirmPassword) return
        const phone = '998' + String(v.phoneNumber).replace(/\D/g, '').slice(-9)
        create.mutate({
            firstName: v.firstName,
            lastName: v.lastName || undefined,
            email: v.email || undefined,
            phoneNumber: phone,
            password: v.password,
            profession: v.profession || undefined,
        })
    }

    const active = watch('active')
    const pwd = watch('password')

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', flex: 1, gap: 0}}>
            <Card padding={32} gap={24}>
                <AvatarUploadStub/>

                <Row>
                    <FormField label="Full Name" error={errors.firstName?.message}>
                        <Input placeholder="First name" {...register('firstName', {required: 'Required'})} invalid={!!errors.firstName}/>
                    </FormField>
                    <FormField label="Last Name">
                        <Input placeholder="Last name" {...register('lastName')}/>
                    </FormField>
                </Row>

                <Row>
                    <FormField label="Email Address">
                        <Input leftIcon="mail" placeholder="teacher@example.com" {...register('email')}/>
                    </FormField>
                    <FormField label="Phone Number" error={errors.phoneNumber?.message}>
                        <div className="it-input it-input--lg">
                            <span style={{paddingRight: 12, borderRight: '1px solid var(--it-border-strong)', color: 'var(--it-text-body)'}}>+998</span>
                            <input
                                type="tel"
                                className="it-input__el"
                                placeholder="90 123 45 67"
                                {...register('phoneNumber', {required: 'Required'})}
                            />
                        </div>
                    </FormField>
                </Row>

                <Row>
                    <FormField label="Subject / Specialization">
                        <Input leftIcon="book-open" placeholder="e.g. Mathematics" {...register('profession')}/>
                    </FormField>
                    <div/>
                </Row>

                <Row>
                    <FormField label="Password" error={errors.password?.message}>
                        <Input type="password" placeholder="Min. 6 characters" {...register('password', {required: 'Required', minLength: {value: 6, message: 'Min 6 chars'}})}/>
                    </FormField>
                    <FormField label="Confirm Password" error={errors.confirmPassword?.message ?? (watch('confirmPassword') && watch('confirmPassword') !== pwd ? 'Passwords do not match' : null)}>
                        <Input type="password" placeholder="Re-enter password" {...register('confirmPassword', {required: 'Required'})}/>
                    </FormField>
                </Row>

                <FormField label="Status">
                    <Controller
                        control={control}
                        name="active"
                        render={({field}) => (
                            <div style={{height: 44, display: 'flex', alignItems: 'center'}}>
                                <Switch checked={field.value} onChange={field.onChange} label={field.value ? 'Active' : 'Inactive'}/>
                            </div>
                        )}
                    />
                </FormField>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8}}>
                    <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={create.isPending}>
                        {create.isPending ? 'Saving…' : 'Add Teacher'}
                    </Button>
                </div>
            </Card>
        </form>
    )
}

function Row({children}) {
    return <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>{children}</div>
}

function AvatarUploadStub() {
    const [name, setName] = useState(null)
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{
                width: 80, height: 80, borderRadius: 999,
                background: 'var(--it-surface-alt)',
                border: '2px solid var(--it-border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--it-text-tertiary)',
            }}>
                <Icon name="user" size={32}/>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                <div style={{fontSize: 15, fontWeight: 600, color: 'var(--it-text-primary)'}}>Profile Photo</div>
                <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Upload a clear photo. Max 5MB.</div>
                <label>
                    <input type="file" accept="image/*" hidden onChange={(e) => setName(e.target.files?.[0]?.name)}/>
                    <span className="it-btn it-btn--secondary it-btn--sm" style={{display: 'inline-flex'}}>
                        <Icon name="upload" size={14}/> {name ?? 'Choose photo'}
                    </span>
                </label>
            </div>
        </div>
    )
}

export default AdminAddTeacherPage
