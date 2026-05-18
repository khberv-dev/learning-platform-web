import {useEffect} from "react";
import {useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import {FormText, FormTextArea} from "@/ui/components/form-field/index.jsx";

export default function TeacherCreateSessionPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()

    useEffect(() => {
        setHeader({title: 'Create Session', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    const {register, handleSubmit} = useForm()

    return (
        <form onSubmit={handleSubmit(() => navigate('/teacher/sessions'))}
              style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <SectionCard title={'Session Details'}>
                <FormText label={'Title'} required
                          placeholder={'e.g. Calculus Q&A'} {...register('title', {required: true})}/>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}>
                    <FormText label={'Course'} placeholder={'Select course'} {...register('course')}/>
                    <FormText label={'Duration (minutes)'} placeholder={'60'} {...register('duration')}/>
                    <FormText label={'Date'} type={'date'} {...register('date')}/>
                    <FormText label={'Time'} type={'time'} {...register('time')}/>
                </div>
                <FormTextArea label={'Description'}
                              placeholder={'What will this session cover?'} {...register('description')}/>
            </SectionCard>

            <SectionCard title={'Settings'}>
                <FormText label={'Maximum Participants'} placeholder={'30'} {...register('max')}/>
                <FormText label={'Meeting Link'} placeholder={'Auto-generated when created'} {...register('link')}/>
            </SectionCard>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                <Button view={'outlined'} size={'l'} onClick={() => navigate(-1)}>Cancel</Button>
                <Button
                    type={'submit'}
                    view={'action'}
                    size={'l'}
                >
                    Schedule Session
                </Button>
            </div>
        </form>
    )
}
