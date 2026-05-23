import {useEffect} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useAuth} from '@/providers/auth.jsx'
import {useGetMyTeacherSummary} from '@/services/teacher/query.js'
import {StatCard} from '@/ui/components/stat-card/index.jsx'
import {SectionCard} from '@/ui/components/section-card/index.jsx'
import {LineChart} from '@/ui/components/line-chart/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {Button} from '@/ui/components/button/index.jsx'
import {fullName} from '@/utils/lib.js'

const trend = Array.from({length: 12}, (_, i) => ({
    label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    value: 60 + Math.round(Math.sin(i/1.7) * 14 + i * 4),
}))

const fmt = (v, isRating = false) => {
    if (v == null) return '—'
    return isRating ? (typeof v === 'number' ? v.toFixed(1) : v) : v
}

export function TeacherDashboardPage() {
    const {setHeader} = useHeader()
    const {user} = useAuth() ?? {}
    const navigate = useNavigate()
    const {data: summary, isLoading} = useGetMyTeacherSummary()
    const name = fullName(user) || 'there'

    useEffect(() => {
        setHeader({title: `Good morning, ${name.split(' ')[0] || 'Teacher'}!`, subtitle: "Here's your teaching overview"})
        return () => setHeader({})
    }, [setHeader, name])

    return (
        <>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16}}>
                <StatCard
                    icon="users"
                    tone="blue"
                    value={isLoading ? '—' : fmt(summary?.totalStudents)}
                    label="Total Students"
                />
                <StatCard
                    icon="user-plus"
                    tone="orange"
                    value={isLoading ? '—' : fmt(summary?.newStudentsThisMonth)}
                    label="New This Month"
                />
                <StatCard
                    icon="video"
                    tone="violet"
                    value={isLoading ? '—' : fmt(summary?.liveSessionsScheduled)}
                    label="Live Sessions Scheduled"
                />
                <StatCard
                    icon="star"
                    tone="yellow"
                    value={isLoading ? '—' : fmt(summary?.averageRating, true)}
                    label="Average Rating"
                />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20}}>
                <SectionCard title="Student Growth">
                    <LineChart data={trend}/>
                </SectionCard>

                <SectionCard title="Today">
                    <Card2
                        color="success"
                        title="Next Session"
                        details={[
                            {icon: 'calendar', text: 'Today, 14:00'},
                            {icon: 'clock', text: '60 min'},
                            {icon: 'users', text: `${summary?.totalStudents ?? 0} students`},
                        ]}
                        action={<Button leftIcon="video" size="md" full onClick={() => navigate('/teacher/sessions')}>Start Session</Button>}
                    />
                    {summary?.pendingApprovals > 0 && (
                        <Card2
                            color="warning"
                            title="Pending Requests"
                            details={[{icon: 'mail-question', text: `${summary.pendingApprovals} student${summary.pendingApprovals === 1 ? '' : 's'} waiting for your reply`}]}
                            action={
                                <Button variant="secondary" size="md" full onClick={() => navigate('/teacher/students')}>
                                    Review now
                                </Button>
                            }
                        />
                    )}
                </SectionCard>
            </div>
        </>
    )
}

function Card2({color, title, details, action}) {
    const bg = color === 'success' ? 'var(--it-success-bg)' : 'var(--it-warning-bg)'
    const bd = color === 'success' ? 'var(--it-success-border)' : 'var(--it-warning-border)'
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            padding: 16, borderRadius: 10, background: bg, border: `1px solid ${bd}`,
        }}>
            <span style={{fontSize: 14, fontWeight: 700, color: 'var(--it-text-primary)'}}>{title}</span>
            {details.map((d, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--it-text-body)'}}>
                    <Icon name={d.icon} size={14} color="var(--it-text-secondary)"/>{d.text}
                </div>
            ))}
            {action}
        </div>
    )
}

export default TeacherDashboardPage
