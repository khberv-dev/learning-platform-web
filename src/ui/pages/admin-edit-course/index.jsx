import {useEffect} from 'react'
import {useForm, Controller} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourse, useUpdateCourse} from '@/services/course/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {ImageUpload} from '@/ui/components/image-upload/index.jsx'
import {Switch} from '@/ui/components/switch/index.jsx'

export function AdminEditCoursePage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data: course, isLoading} = useGetCourse(id)
    const update = useUpdateCourse({onSuccess: () => navigate(`/admin/courses/${id}`)})

    useEffect(() => {
        setHeader({title: 'Edit Course', onBack: () => navigate(`/admin/courses/${id}`)})
        return () => setHeader({})
    }, [setHeader, navigate, id])

    const {register, handleSubmit, control, reset, formState: {errors}} = useForm({
        defaultValues: {title: '', description: '', price: 0, isActive: true, image: null},
    })

    useEffect(() => {
        if (!course) return
        reset({
            title: course.title ?? '',
            description: course.description ?? '',
            price: course.price ?? 0,
            isActive: !!course.isActive,
            image: course.image ?? null, // existing path string → preview only; replaced only if a File is picked
        })
    }, [course, reset])

    const onSubmit = (v) => {
        const data = {
            title: v.title,
            description: v.description || undefined,
            price: Number(v.price) || 0,
            isActive: v.isActive,
        }
        // Only send the image field when the admin picked a new file.
        if (v.image instanceof File) data.image = v.image
        update.mutate({id, data})
    }

    if (isLoading || !course) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%'}}>
                <Controller
                    control={control}
                    name="image"
                    render={({field}) => (
                        <ImageUpload value={field.value} onChange={field.onChange} hint="JPG or PNG. Leave as-is to keep the current image."/>
                    )}
                />

                <FormField label="Title" error={errors.title?.message}>
                    <Input placeholder="e.g. English A1 Foundations" {...register('title', {required: 'Required'})} invalid={!!errors.title}/>
                </FormField>

                <FormField label="Description">
                    <Textarea rows={4} placeholder="Short summary..." {...register('description')}/>
                </FormField>

                <Row>
                    <FormField label="Price (UZS)">
                        <Input type="number" min={0} step={1000} placeholder="0" {...register('price')}/>
                    </FormField>
                    <FormField label="Status">
                        <Controller
                            control={control}
                            name="isActive"
                            render={({field}) => (
                                <div style={{height: 44, display: 'flex', alignItems: 'center'}}>
                                    <Switch checked={field.value} onChange={field.onChange} label={field.value ? 'Active' : 'Inactive'}/>
                                </div>
                            )}
                        />
                    </FormField>
                </Row>

                <div style={{flex: 1}}/>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" onClick={() => navigate(`/admin/courses/${id}`)}>Cancel</Button>
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

export default AdminEditCoursePage
