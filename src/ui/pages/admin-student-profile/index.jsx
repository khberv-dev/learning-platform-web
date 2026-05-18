import {useEffect} from "react";
import {useNavigate, useParams} from "react-router";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";

const ENROLLED = [
    {id: 1, title: 'Algebra & Functions', teacher: 'Alisher Karimov', progress: 78},
    {id: 2, title: 'English Grammar', teacher: 'Sabina Rakhimova', progress: 42},
    {id: 3, title: 'Calculus Fundamentals', teacher: 'Alisher Karimov', progress: 12},
]

export default function AdminStudentProfilePage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const {id} = useParams()

    useEffect(() => {
        setHeader({title: 'Student Profile', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button view={'outlined'} size={'l'} onClick={() => navigate(`/admin/students/${id}/edit`)}>
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                        <Icon name={'pencil'} size={14}/>
                        Edit
                    </span>
                </Button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20}}>
                <SectionCard>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                        <Avatar initials={'AT'} palette={'blue'} size={80}/>
                        <span style={{fontSize: 18, fontWeight: 700}}>Anton Tomas</span>
                        <ResourceBadge active>Paid Student</ResourceBadge>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                        <Row icon={'mail'} text={'anton@email.com'}/>
                        <Row icon={'phone'} text={'+998901112233'}/>
                        <Row icon={'calendar'} text={'Joined Feb 2024'}/>
                    </div>
                </SectionCard>

                <SectionCard title={'Enrolled Courses'}>
                    {ENROLLED.map(c => (
                        <div
                            key={c.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                padding: 14,
                                border: '1px solid var(--it-border)',
                                borderRadius: 10,
                            }}
                        >
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <span style={{fontSize: 14, fontWeight: 600}}>{c.title}</span>
                                    <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>{c.teacher}</span>
                                </div>
                                <span style={{fontSize: 13, fontWeight: 600, color: 'var(--it-green)'}}>
                                    {c.progress}%
                                </span>
                            </div>
                            <div style={{height: 6, borderRadius: 3, background: '#F3F4F6', overflow: 'hidden'}}>
                                <div style={{height: '100%', width: `${c.progress}%`, background: 'var(--it-green)'}}/>
                            </div>
                        </div>
                    ))}
                </SectionCard>
            </div>
        </div>
    )
}

function Row({icon, text}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <Icon name={icon} size={16} color={'var(--it-text-secondary)'}/>
            <span style={{fontSize: 13}}>{text}</span>
        </div>
    )
}
