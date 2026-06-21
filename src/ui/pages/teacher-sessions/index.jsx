import {useEffect, useMemo} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetLiveLessons, useDeleteLiveLesson} from '@/services/live-lesson/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'

function formatTime(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleString('en-GB', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})
}

function durationMin(start, end) {
    if (!start || !end) return null
    return Math.round((new Date(end) - new Date(start)) / 60000)
}

export function TeacherSessionsPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const {data, isLoading} = useGetLiveLessons({limit: 50})
    const deleteLesson = useDeleteLiveLesson()

    useEffect(() => {
        setHeader({
            title: 'Live Sessions',
            actions: <Button leftIcon="plus" onClick={() => navigate('/teacher/sessions/new')}>Create Session</Button>,
        })
        return () => setHeader({})
    }, [setHeader, navigate])

    const {upcoming, past} = useMemo(() => {
        const now = Date.now()
        const lessons = data?.data ?? []
        return {
            upcoming: lessons.filter(l => new Date(l.startTime).getTime() >= now),
            past: lessons.filter(l => new Date(l.startTime).getTime() < now),
        }
    }, [data])

    if (isLoading) {
        return <Card padding={40} style={{textAlign: 'center', color: 'var(--it-text-tertiary)'}}>Loading sessions…</Card>
    }

    return (
        <>
            <SectionLabel color="var(--it-green)">Upcoming Sessions</SectionLabel>
            {upcoming.length === 0 ? (
                <Card padding={32} style={{textAlign: 'center', color: 'var(--it-text-tertiary)'}}>No upcoming sessions</Card>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16}}>
                    {upcoming.map((s, i) => (
                        <Card key={s.id} padding={20} gap={14}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <span style={{fontSize: 11, color: 'var(--it-text-tertiary)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase'}}>Session #{i + 1}</span>
                                <span className="it-badge it-badge--success it-badge--sm">Scheduled</span>
                            </div>
                            <span style={{fontSize: 15, fontWeight: 700, color: 'var(--it-text-primary)'}}>{s.name}</span>
                            <div style={{display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--it-text-body)'}}>
                                <Row icon="calendar" text={formatTime(s.startTime)}/>
                                {durationMin(s.startTime, s.endTime) && (
                                    <Row icon="clock" text={`${durationMin(s.startTime, s.endTime)} min`}/>
                                )}
                                {s.enrollment?.course && <Row icon="book-open" text={s.enrollment.course.title}/>}
                                {s.enrollment?.student?.user && <Row icon="user" text={`${s.enrollment.student.user.firstName ?? ''} ${s.enrollment.student.user.lastName ?? ''}`.trim() || 'Student'}/>}
                            </div>
                            <div style={{display: 'flex', gap: 8}}>
                                <Button size="md" full leftIcon="video" onClick={() => window.open(s.meetLink, '_blank')}>Join</Button>
                                <IconButton icon="trash-2" title="Delete" onClick={() => deleteLesson.mutate(s.id)} style={{flexShrink: 0}}/>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <SectionLabel color="var(--it-text-tertiary)">Past Sessions</SectionLabel>
            {past.length === 0 ? (
                <Card padding={32} style={{textAlign: 'center', color: 'var(--it-text-tertiary)'}}>No past sessions</Card>
            ) : (
                <Card padding={0}>
                    {past.map((s, i) => (
                        <div key={s.id} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', height: 64, borderBottom: i < past.length - 1 ? '1px solid var(--it-border-row)' : 0}}>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 4}}>
                                <span style={{fontWeight: 600}}>{s.name}</span>
                                <span style={{fontSize: 12, color: 'var(--it-text-tertiary)'}}>
                                    {formatTime(s.startTime)}
                                    {durationMin(s.startTime, s.endTime) ? ` · ${durationMin(s.startTime, s.endTime)} min` : ''}
                                </span>
                            </div>
                            <span className="it-badge it-badge--neutral it-badge--sm">Completed</span>
                        </div>
                    ))}
                </Card>
            )}
        </>
    )
}

function Row({icon, text}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Icon name={icon} size={14} color="var(--it-text-secondary)"/>
            {text}
        </div>
    )
}

function SectionLabel({color, children}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <div style={{width: 4, height: 20, borderRadius: 2, background: color}}/>
            <span style={{fontSize: 15, fontWeight: 700, color: 'var(--it-text-primary)'}}>{children}</span>
        </div>
    )
}

export default TeacherSessionsPage
