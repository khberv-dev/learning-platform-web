import {useEffect, useMemo} from 'react'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetStudents} from '@/services/student/query.js'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {Button} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {SectionCard} from '@/ui/components/section-card/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {fullName, formatDate} from '@/utils/lib.js'

export function AdminStudentProfilePage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data} = useGetStudents({page: 1, limit: 100})

    const student = useMemo(() => (data?.data ?? []).find(s => s.id === id), [data, id])

    useEffect(() => {
        setHeader({
            title: 'Student Profile',
            onBack: () => navigate('/admin/students'),
            actions: (
                <Button variant="secondary" size="sm" leftIcon="pencil" onClick={() => navigate(`/admin/students/${id}/edit`)}>
                    Edit
                </Button>
            ),
        })
        return () => setHeader({})
    }, [setHeader, navigate, id])

    if (!student) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    const name = fullName(student.user)
    const status = student.user?.isActive === false ? 'inactive' : 'active'
    const enrollments = student.enrollments ?? []

    return (
        <div style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, flex: 1}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <Card padding={24} gap={16} style={{alignItems: 'center'}}>
                    <Avatar name={name} src={student.user?.avatar} size={80} fontSize={28}/>
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: 18, fontWeight: 700}}>{name}</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Level {student.level ?? 'A1'}</div>
                    </div>
                    <ResourceBadge status={status} withDot/>
                    <div style={{height: 1, background: 'var(--it-border-row)', width: '100%'}}/>
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                        <Stat value={student.points ?? 0} label="Points"/>
                        <Sep/>
                        <Stat value={student.coins ?? 0} label="Coins"/>
                        <Sep/>
                        <Stat value={student.balance ?? 0} label="Balance"/>
                        <Sep/>
                        <Stat value={enrollments.length} label="Courses"/>
                    </div>
                </Card>

                <SectionCard title="Contact Info">
                    <InfoRow icon="phone" label="Phone" value={student.user?.phoneNumber ? `+${student.user.phoneNumber}` : '—'}/>
                    <InfoRow icon="mail" label="Email" value={student.user?.email ?? '—'}/>
                    <InfoRow icon="calendar" label="Joined" value={formatDate(student.createdAt)}/>
                </SectionCard>
            </div>

            <SectionCard title={`Enrolled Courses (${enrollments.length})`}>
                {enrollments.length === 0 ? (
                    <div style={{color: 'var(--it-text-tertiary)', padding: 12}}>No active enrollments.</div>
                ) : enrollments.map((e) => (
                    <div key={e.id} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--it-border-row)'}}>
                        <div style={{width: 40, height: 40, borderRadius: 10, background: 'var(--it-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Icon name="book-open" size={18} color="var(--it-info-text)"/>
                        </div>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 3}}>
                            <div style={{fontSize: 14, fontWeight: 600}}>{e.course?.title}</div>
                            <div style={{fontSize: 12, color: 'var(--it-text-tertiary)'}}>
                                {formatDate(e.start)} → {formatDate(e.end)}
                            </div>
                        </div>
                        <ResourceBadge status="active" size="sm"/>
                    </div>
                ))}
            </SectionCard>
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
            <span style={{fontSize: 18, fontWeight: 700}}>{value}</span>
            <span style={{fontSize: 11, color: 'var(--it-text-secondary)'}}>{label}</span>
        </div>
    )
}
function Sep() { return <div style={{width: 1, height: 40, background: 'var(--it-border)'}}/> }

export default AdminStudentProfilePage
