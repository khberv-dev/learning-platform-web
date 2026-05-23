import {useEffect} from 'react'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetTeacher} from '@/services/teacher/query.js'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {Button} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {SectionCard} from '@/ui/components/section-card/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {fullName, formatDate} from '@/utils/lib.js'

export function AdminTeacherProfilePage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data: teacher, isLoading} = useGetTeacher(id)

    useEffect(() => {
        setHeader({
            title: 'Teacher Profile',
            onBack: () => navigate('/admin/teachers'),
            actions: (
                <Button variant="secondary" size="sm" leftIcon="pencil" onClick={() => navigate(`/admin/teachers/${id}/edit`)}>
                    Edit
                </Button>
            ),
        })
        return () => setHeader({})
    }, [setHeader, navigate, id])

    if (isLoading || !teacher) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    const name = fullName(teacher.user)
    const status = teacher.user?.isActive === false ? 'inactive' : (teacher.status ?? 'active')
    const feedbacks = teacher.feedbacks ?? []

    return (
        <div style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, flex: 1}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <Card padding={24} gap={16} style={{alignItems: 'center'}}>
                    <Avatar name={name} src={teacher.user?.avatar} size={80} fontSize={28}/>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                        <div style={{fontSize: 18, fontWeight: 700, color: 'var(--it-text-primary)'}}>{name}</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>{teacher.profession ?? 'Teacher'}</div>
                    </div>
                    <ResourceBadge status={status} withDot/>
                    <div style={{height: 1, background: 'var(--it-border-row)', width: '100%'}}/>
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                        <Stat value={feedbacks.length} label="Reviews"/>
                        <Sep/>
                        <Stat value={teacher.summaryRating?.toFixed?.(1) ?? '—'} label="Rating"/>
                        <Sep/>
                        <Stat value={formatDate(teacher.createdAt).split(',')[1]?.trim() ?? '—'} label="Since"/>
                    </div>
                </Card>

                <SectionCard title="Contact Info">
                    <InfoRow icon="phone" label="Phone" value={teacher.user?.phoneNumber ? `+${teacher.user.phoneNumber}` : '—'}/>
                    <InfoRow icon="mail" label="Email" value={teacher.user?.email ?? '—'}/>
                    <InfoRow icon="calendar" label="Joined" value={formatDate(teacher.createdAt)}/>
                </SectionCard>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <SectionCard title="Status History">
                    {(teacher.statusHistories?.length ? teacher.statusHistories : [{newStatus: status, changedAt: teacher.createdAt}]).map((h, i) => (
                        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--it-border-row)'}}>
                            <div style={{width: 40, height: 40, borderRadius: 10, background: 'var(--it-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Icon name="activity" size={18} color="var(--it-info-text)"/>
                            </div>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                                <div style={{fontSize: 14, fontWeight: 600, color: 'var(--it-text-primary)'}}>
                                    {h.oldStatus ? `${h.oldStatus} → ${h.newStatus}` : `Marked ${h.newStatus}`}
                                </div>
                                <div style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                    {formatDate(h.changedAt, true)} {h.changedBy?.user ? `by ${fullName(h.changedBy.user)}` : ''}
                                </div>
                            </div>
                        </div>
                    ))}
                </SectionCard>

                <SectionCard title={`Reviews (${feedbacks.length})`}>
                    {feedbacks.length === 0 ? (
                        <div style={{color: 'var(--it-text-tertiary)', padding: 12}}>No feedback yet.</div>
                    ) : feedbacks.map((f) => (
                        <div key={f.id} style={{display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0', borderBottom: '1px solid var(--it-border-row)'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{fontWeight: 600, color: 'var(--it-text-primary)'}}>{fullName(f.student?.user) || 'Student'}</span>
                                <span style={{color: 'var(--it-warning-text)'}}>{'★'.repeat(f.rate ?? 0)}{'☆'.repeat(5 - (f.rate ?? 0))}</span>
                            </div>
                            <div style={{color: 'var(--it-text-secondary)', fontSize: 13}}>{f.text}</div>
                        </div>
                    ))}
                </SectionCard>
            </div>
        </div>
    )
}

function InfoRow({icon, label, value}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{width: 32, height: 32, borderRadius: 8, background: 'var(--it-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name={icon} size={14} color="var(--it-text-secondary)"/>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <span style={{fontSize: 11, color: 'var(--it-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4}}>{label}</span>
                <span style={{fontSize: 14, color: 'var(--it-text-primary)', fontWeight: 500}}>{value}</span>
            </div>
        </div>
    )
}

function Stat({value, label}) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
            <span style={{fontSize: 18, fontWeight: 700, color: 'var(--it-text-primary)'}}>{value}</span>
            <span style={{fontSize: 11, color: 'var(--it-text-secondary)'}}>{label}</span>
        </div>
    )
}

function Sep() {
    return <div style={{width: 1, height: 40, background: 'var(--it-border)'}}/>
}

export default AdminTeacherProfilePage
