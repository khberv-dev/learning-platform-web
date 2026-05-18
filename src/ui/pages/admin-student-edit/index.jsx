import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {useForm} from "react-hook-form";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import {FormText} from "@/ui/components/form-field/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";

export default function AdminStudentEditPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const {id} = useParams()
    const [active, setActive] = useState(true)

    useEffect(() => {
        setHeader({title: 'Edit Student', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    const {register, handleSubmit} = useForm({
        defaultValues: {
            fullName: 'Anton Tomas',
            phoneNumber: '+998901112233',
            email: 'anton@email.com',
            parent: 'Maria Tomas',
        },
    })

    return (
        <form onSubmit={handleSubmit(() => navigate(`/admin/students/${id}`))}
              style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <SectionCard>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <Avatar initials={'AT'} palette={'blue'} size={72}/>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <span style={{fontSize: 14, fontWeight: 600}}>Student Photo</span>
                        <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>Update student photo</span>
                    </div>
                </div>
            </SectionCard>

            <SectionCard>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}>
                    <FormText label={'Full Name'} {...register('fullName')}/>
                    <FormText label={'Phone Number'} {...register('phoneNumber')}/>
                    <FormText label={'Email Address'} type={'email'} {...register('email')}/>
                    <FormText label={'Parent Name'} {...register('parent')}/>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    <span style={{fontSize: 13, fontWeight: 600}}>Status</span>
                    <div style={{display: 'flex', gap: 8}}>
                        <Button
                            view={active ? 'action' : 'outlined'}
                            onClick={(e) => {
                                e.preventDefault()
                                setActive(true)
                            }}
                        >
                            Active
                        </Button>
                        <Button
                            view={!active ? 'action' : 'outlined'}
                            onClick={(e) => {
                                e.preventDefault()
                                setActive(false)
                            }}
                        >
                            Inactive
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
                >
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
