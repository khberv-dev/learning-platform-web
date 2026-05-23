import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useCreateGroup} from '@/services/group/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'

export function TeacherCreateGroupPage() {
    const navigate = useNavigate()
    const {setHeader} = useHeader()

    useEffect(() => {
        setHeader({title: 'Create Group', onBack: () => navigate(-1)})
        return () => setHeader({})
    }, [setHeader, navigate])

    const create = useCreateGroup({
        onSuccess: (g) => navigate(`/teacher/groups/${g.id}`),
    })

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {name: '', description: ''},
    })

    const onSubmit = (v) => {
        create.mutate({name: v.name.trim(), description: v.description?.trim() || undefined})
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flex: 1}}>
            <Card padding={32} gap={24} style={{width: '100%', maxWidth: 640}}>
                <FormField label="Group Name" error={errors.name?.message} hint="Pick a name students will recognize.">
                    <Input
                        leftIcon="users-round"
                        placeholder="e.g. IELTS Speaking Club"
                        autoFocus
                        invalid={!!errors.name}
                        {...register('name', {required: 'Name is required'})}
                    />
                </FormField>

                <FormField label="Description (Optional)" hint="Days, level, focus — anything that helps students choose.">
                    <Textarea
                        rows={4}
                        placeholder="Wednesday evenings, intermediate level"
                        {...register('description')}
                    />
                </FormField>

                <div style={{flex: 1}}/>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                    <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" size="lg" leftIcon="plus" disabled={create.isPending}>
                        {create.isPending ? 'Creating…' : 'Create Group'}
                    </Button>
                </div>
            </Card>
        </form>
    )
}

export default TeacherCreateGroupPage
