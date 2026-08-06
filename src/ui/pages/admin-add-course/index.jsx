import {useEffect} from 'react'
import {useForm, Controller} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useCreateCourse} from '@/services/course/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {ImageUpload} from '@/ui/components/image-upload/index.jsx'
import {Switch} from '@/ui/components/switch/index.jsx'

export function AdminAddCoursePage() {
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const create = useCreateCourse({onSuccess: () => navigate('/admin/courses')})

    useEffect(() => {
        setHeader({title: 'Add Course', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const {register, handleSubmit, control, formState: {errors}} = useForm({
        defaultValues: {title: '', description: '', isActive: true, image: null},
    })

    // Pricing lives on the course's plans, not the course itself.
    const onSubmit = (v) => {
        create.mutate({
            title: v.title,
            description: v.description || undefined,
            isActive: v.isActive,
            image: v.image || undefined,
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%'}}>
                <Controller
                    control={control}
                    name="image"
                    render={({field}) => (
                        <ImageUpload value={field.value} onChange={field.onChange} hint="JPG or PNG. Recommended ratio 16:9."/>
                    )}
                />

                <FormField label="Title" error={errors.title?.message}>
                    <Input placeholder="e.g. English A1 Foundations" {...register('title', {required: 'Required'})}/>
                </FormField>

                <FormField label="Description">
                    <Textarea rows={4} placeholder="Short summary..." {...register('description')}/>
                </FormField>

                <Row>
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
                    <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={create.isPending}>
                        {create.isPending ? 'Saving…' : 'Add Course'}
                    </Button>
                </div>
            </Card>
        </form>
    )
}

function Row({children}) {
    return <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>{children}</div>
}

export default AdminAddCoursePage
