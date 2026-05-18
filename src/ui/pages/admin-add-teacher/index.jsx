import {useEffect} from "react";
import {useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import {FormText} from "@/ui/components/form-field/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import {useCreateTeacher} from "@/services/teacher/query.js";
import {cleanPhoneNumber} from "@/utils/lib.js";

export default function AdminAddTeacherPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const createTeacher = useCreateTeacher()

    useEffect(() => {
        setHeader({title: 'Add Teacher', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            profession: '',
            password: '',
        },
    })

    const onSubmit = (values) => {
        const payload = {
            firstName: values.firstName,
            lastName: values.lastName || undefined,
            email: values.email || undefined,
            phoneNumber: cleanPhoneNumber(values.phoneNumber),
            profession: values.profession || undefined,
            password: values.password,
        }
        createTeacher.mutate(payload, {
            onSuccess: () => navigate('/admin/teachers'),
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <SectionCard title={'Profile'}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}>
                    <FormText
                        label={'First Name'}
                        required
                        placeholder={'Enter first name'}
                        error={errors.firstName?.message}
                        {...register('firstName', {required: 'Required'})}
                    />
                    <FormText
                        label={'Last Name'}
                        placeholder={'Enter last name'}
                        {...register('lastName')}
                    />
                    <FormText
                        label={'Phone Number'}
                        required
                        placeholder={'998901234567'}
                        error={errors.phoneNumber?.message}
                        hint={'12 digits starting with 998'}
                        {...register('phoneNumber', {required: 'Required'})}
                    />
                    <FormText
                        label={'Email Address'}
                        type={'email'}
                        placeholder={'teacher@email.com'}
                        error={errors.email?.message}
                        {...register('email')}
                    />
                    <FormText
                        label={'Profession'}
                        placeholder={'e.g. Mathematics'}
                        {...register('profession')}
                    />
                    <FormText
                        label={'Password'}
                        type={'password'}
                        required
                        placeholder={'Min 6 characters'}
                        error={errors.password?.message}
                        {...register('password', {required: 'Required', minLength: {value: 6, message: 'Min 6 chars'}})}
                    />
                </div>
            </SectionCard>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                <Button view={'outlined'} size={'l'} onClick={() => navigate(-1)}>
                    Cancel
                </Button>
                <Button
                    type={'submit'}
                    view={'action'}
                    size={'l'}
                    loading={createTeacher.isPending}
                >
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                        <Icon name={'plus'} size={16} color={'#FFFFFF'}/>
                        Add Teacher
                    </span>
                </Button>
            </div>
        </form>
    )
}
