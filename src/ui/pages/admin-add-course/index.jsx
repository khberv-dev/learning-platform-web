import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import {FormText, FormTextArea} from "@/ui/components/form-field/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import {useCreateCourse} from "@/services/course/query.js";

export default function AdminAddCoursePage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const createCourse = useCreateCourse()
    const [imageFile, setImageFile] = useState(null)

    useEffect(() => {
        setHeader({title: 'Add Course', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    const {register, handleSubmit, watch, setValue} = useForm({
        defaultValues: {title: '', description: '', price: 0, isActive: false},
    })

    const isActive = watch('isActive')

    const onSubmit = (values) => {
        const dto = {
            title: values.title,
            description: values.description || undefined,
            price: values.price !== '' ? Number(values.price) : 0,
            isActive: !!values.isActive,
        }
        createCourse.mutate(
            {dto, image: imageFile ?? undefined},
            {onSuccess: () => navigate('/admin/courses')},
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <SectionCard title={'Course Cover'}>
                <label
                    style={{
                        position: 'relative',
                        height: 180,
                        background: '#F9FAFB',
                        border: '1px dashed var(--it-border)',
                        borderRadius: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        overflow: 'hidden',
                    }}
                >
                    <input
                        type={'file'}
                        accept={'image/*'}
                        style={{display: 'none'}}
                        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    />
                    {imageFile ? (
                        <span style={{fontSize: 14, color: 'var(--it-text-primary)'}}>
                            Selected: {imageFile.name}
                        </span>
                    ) : (
                        <>
                            <Icon name={'upload'} size={24} color={'var(--it-text-secondary)'}/>
                            <span style={{fontSize: 14, color: 'var(--it-text-secondary)'}}>
                                Drop image here or click to upload
                            </span>
                        </>
                    )}
                </label>
            </SectionCard>

            <SectionCard title={'Course Details'}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}>
                    <FormText
                        label={'Course Title'}
                        required
                        placeholder={'e.g. Algebra & Functions'}
                        {...register('title', {required: true})}
                    />
                    <FormText
                        label={'Price'}
                        placeholder={'0'}
                        type={'number'}
                        {...register('price')}
                    />
                </div>
                <FormTextArea
                    label={'Description'}
                    placeholder={'Brief description of the course'}
                    {...register('description')}
                />

                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    <span style={{fontSize: 13, fontWeight: 600}}>Status</span>
                    <div style={{display: 'flex', gap: 8}}>
                        <Button
                            view={isActive ? 'action' : 'outlined'}
                            onClick={(e) => {
                                e.preventDefault()
                                setValue('isActive', true)
                            }}
                        >
                            Active
                        </Button>
                        <Button
                            view={!isActive ? 'action' : 'outlined'}
                            onClick={(e) => {
                                e.preventDefault()
                                setValue('isActive', false)
                            }}
                        >
                            Draft
                        </Button>
                    </div>
                </div>
            </SectionCard>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                <Button view={'outlined'} size={'l'} onClick={() => navigate(-1)}>Cancel</Button>
                <Button
                    type={'submit'}
                    view={'action'}
                    size={'l'}
                    loading={createCourse.isPending}
                >
                    Create Course
                </Button>
            </div>
        </form>
    )
}
