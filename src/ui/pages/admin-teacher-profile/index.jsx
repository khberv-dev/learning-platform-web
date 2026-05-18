import {useEffect} from "react";
import {useNavigate, useParams} from "react-router";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import {useChangeTeacherStatus, useGetTeacher} from "@/services/teacher/query.js";
import {getAvatarPalette, getFullName, getInitials} from "@/utils/user.js";

export default function AdminTeacherProfilePage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const {id} = useParams()

    const {data: teacher, isLoading} = useGetTeacher(id)
    const changeStatus = useChangeTeacherStatus()

    useEffect(() => {
        setHeader({title: 'Teacher Profile', onBack: () => navigate(-1)})
        return () => setHeader({title: '', onBack: null})
    }, [setHeader, navigate])

    if (isLoading || !teacher) {
        return <SectionCard>Loading...</SectionCard>
    }

    const onSetStatus = (status) => {
        if (teacher.status === status) return
        changeStatus.mutate({id, status})
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                <Button view={'outlined'} size={'l'} onClick={() => navigate(`/admin/teachers/${id}/edit`)}>
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                        <Icon name={'pencil'} size={14}/>
                        Edit
                    </span>
                </Button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                    <SectionCard>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                            <Avatar
                                initials={getInitials(teacher.user)}
                                palette={getAvatarPalette(teacher.id)}
                                size={80}
                            />
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                                <span style={{fontSize: 18, fontWeight: 700}}>{getFullName(teacher.user)}</span>
                                <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                                    {teacher.profession ?? '—'}
                                </span>
                            </div>
                            <ResourceBadge active={teacher.status === 'active'}>{teacher.status}</ResourceBadge>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
                            <Stat value={teacher.feedbacks?.length ?? 0} label={'Feedbacks'}/>
                            <Stat
                                value={teacher.summaryRating != null ? teacher.summaryRating.toFixed(1) : '—'}
                                label={'Rating'}
                            />
                        </div>
                    </SectionCard>

                    <SectionCard title={'Contact Info'}>
                        <ContactRow icon={'phone'} text={teacher.user?.phoneNumber ?? '—'}/>
                        <ContactRow icon={'mail'} text={teacher.user?.email ?? '—'}/>
                        <ContactRow
                            icon={'calendar'}
                            text={teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : '—'}
                        />
                    </SectionCard>

                    <SectionCard title={'Change Status'}>
                        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                            {['active', 'suspended', 'fired'].map(s => (
                                <Button
                                    key={s}
                                    view={teacher.status === s ? 'action' : 'outlined'}
                                    onClick={() => onSetStatus(s)}
                                    loading={changeStatus.isPending}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                    <SectionCard title={'Feedbacks'}>
                        {(teacher.feedbacks ?? []).length === 0 && (
                            <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                                No feedbacks yet.
                            </span>
                        )}
                        {(teacher.feedbacks ?? []).map(f => (
                            <div
                                key={f.id}
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
                                    <span style={{fontSize: 13, fontWeight: 600}}>
                                        {f.student?.user ? getFullName(f.student.user) : 'Student'}
                                    </span>
                                    <span style={{fontSize: 13, color: 'var(--it-green-700)', fontWeight: 700}}>
                                        ★ {f.rate}
                                    </span>
                                </div>
                                <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>{f.text}</span>
                            </div>
                        ))}
                    </SectionCard>

                    {teacher.introVideo && (
                        <SectionCard title={'Intro Video'}>
                            <video
                                controls
                                style={{width: '100%', borderRadius: 10, background: '#000'}}
                                src={teacher.introVideo}
                            />
                        </SectionCard>
                    )}
                </div>
            </div>
        </div>
    )
}

function Stat({value, label}) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <span style={{fontSize: 22, fontWeight: 700}}>{value}</span>
            <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>{label}</span>
        </div>
    )
}

function ContactRow({icon, text}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: '#F9FAFB',
                borderRadius: 8,
            }}
        >
            <Icon name={icon} size={16} color={'var(--it-text-secondary)'}/>
            <span style={{fontSize: 13}}>{text}</span>
        </div>
    )
}
