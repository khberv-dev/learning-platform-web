import {useEffect} from "react";
import {useNavigate, useParams} from "react-router";
import {useForm} from "react-hook-form";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import {FormText} from "@/ui/components/form-field/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import {useGetTeacher, useUpdateTeacher} from "@/services/teacher/query.js";
import {getAvatarPalette, getInitials} from "@/utils/user.js";
import {cleanPhoneNumber} from "@/utils/lib.js";

export default function AdminTeacherEditPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const {id} = useParams()

    const {data: teacher, isLoading} = useGetTeacher(id)
    const updateTeacher = useUpdateTeacher()

    useEffect(() => {
        setHeader({title: 'Edit Teacher', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    const {register, handleSubmit, reset} = useForm({
        defaultValues: {firstName: '', lastName: '', phoneNumber: '', email: '', profession: '', password: ''},
    })

    useEffect(() => {
        if (teacher) {
            reset({
                firstName: teacher.user?.firstName ?? '',
                lastName: teacher.user?.lastName ?? '',
                phoneNumber: teacher.user?.phoneNumber ?? '',
                email: teacher.user?.email ?? '',
                profession: teacher.profession ?? '',
                password: '',
            })
        }
    }, [teacher, reset])

    const onSubmit = (values) => {
        const data = {
            firstName: values.firstName,
            lastName: values.lastName || undefined,
            email: values.email || undefined,
            phoneNumber: cleanPhoneNumber(values.phoneNumber),
            profession: values.profession || undefined,
        }
        if (values.password) data.password = values.password
        updateTeacher.mutate(
            {id, data},
            {onSuccess: () => navigate(`/admin/teachers/${id}`)},
        )
    }

    if (isLoading || !teacher) {
        return <SectionCard>Loading...</SectionCard>
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <SectionCard>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <Avatar
                        initials={getInitials(teacher.user)}
                        palette={getAvatarPalette(teacher.id)}
                        size={72}
                    />
                    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <span style={{fontSize: 14, fontWeight: 600}}>Profile</span>
                        <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                            Teacher status is managed from the profile page.
                        </span>
                    </div>
                </div>
            </SectionCard>

            <SectionCard>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}>
                    <FormText label={'First Name'} required {...register('firstName')}/>
                    <FormText label={'Last Name'} {...register('lastName')}/>
                    <FormText label={'Phone Number'} {...register('phoneNumber')}/>
                    <FormText label={'Email Address'} type={'email'} {...register('email')}/>
                    <FormText label={'Profession'} {...register('profession')}/>
                    <FormText
                        label={'New Password'}
                        type={'password'}
                        placeholder={'Leave blank to keep current'}
                        {...register('password')}
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
                    loading={updateTeacher.isPending}
                >
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
