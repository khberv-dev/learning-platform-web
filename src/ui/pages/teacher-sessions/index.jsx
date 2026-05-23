import {useEffect} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {Button} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'

const upcoming = [
    {id: 1, title: 'Lesson 8: Past Tenses', when: 'Today · 14:00', dur: '60 min', students: 24, link: 'https://meet.google.com/abc-def-ghi'},
    {id: 2, title: 'Lesson 9: Future Perfect', when: 'Tomorrow · 10:00', dur: '60 min', students: 18, link: 'https://meet.google.com/jkl-mno-pqr'},
    {id: 3, title: 'Lesson 10: Conditionals', when: 'Fri · 16:30', dur: '45 min', students: 21, link: 'https://meet.google.com/stu-vwx-yz0'},
]
const past = [
    {id: 11, title: 'Lesson 7: Present Continuous', when: 'Yesterday', dur: '60 min'},
    {id: 12, title: 'Lesson 6: Modal Verbs', when: '3 days ago', dur: '50 min'},
]

export function TeacherSessionsPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()

    useEffect(() => {
        setHeader({
            title: 'Live Sessions',
            actions: <Button leftIcon="plus" onClick={() => navigate('/teacher/sessions/new')}>Create Session</Button>,
        })
        return () => setHeader({})
    }, [setHeader, navigate])

    return (
        <>
            <SectionLabel color="var(--it-green)">Upcoming Sessions</SectionLabel>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16}}>
                {upcoming.map((s, i) => (
                    <Card key={s.id} padding={20} gap={14}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <span style={{fontSize: 11, color: 'var(--it-text-tertiary)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase'}}>Session #{i + 1}</span>
                            <span className="it-badge it-badge--success it-badge--sm">Scheduled</span>
                        </div>
                        <span style={{fontSize: 15, fontWeight: 700, color: 'var(--it-text-primary)'}}>{s.title}</span>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--it-text-body)'}}>
                            <Row icon="calendar" text={s.when}/>
                            <Row icon="clock" text={s.dur}/>
                            <Row icon="users" text={`${s.students} students`}/>
                        </div>
                        {i === 0 ? (
                            <Button size="md" full leftIcon="video" onClick={() => window.open(s.link, '_blank')}>Join Session</Button>
                        ) : (
                            <Button size="md" variant="secondary" full leftIcon="pencil">Edit</Button>
                        )}
                    </Card>
                ))}
            </div>

            <SectionLabel color="var(--it-text-tertiary)">Past Sessions</SectionLabel>
            <Card padding={0}>
                {past.map((s, i) => (
                    <div key={s.id} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', height: 64, borderBottom: i < past.length - 1 ? '1px solid var(--it-border-row)' : 0}}>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 4}}>
                            <span style={{fontWeight: 600}}>{s.title}</span>
                            <span style={{fontSize: 12, color: 'var(--it-text-tertiary)'}}>{s.when} · {s.dur}</span>
                        </div>
                        <span className="it-badge it-badge--neutral it-badge--sm">Completed</span>
                    </div>
                ))}
            </Card>
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
