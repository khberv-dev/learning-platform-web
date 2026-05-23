import {useEffect} from 'react'
import {useHeader} from '@/providers/header.jsx'
import {StatCard} from '@/ui/components/stat-card/index.jsx'
import {SectionCard} from '@/ui/components/section-card/index.jsx'
import {LineChart} from '@/ui/components/line-chart/index.jsx'
import {Badge} from '@/ui/components/badge/index.jsx'

const chartData = Array.from({length: 12}, (_, i) => ({
    label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    value: 1800 + Math.round(Math.sin(i / 1.7) * 380 + i * 80),
}))
const paidData = Array.from({length: 12}, (_, i) => ({
    label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    value: 700 + Math.round(Math.cos(i / 2.1) * 220 + i * 40),
}))

export function AdminDashboardPage() {
    const {setHeader} = useHeader()
    useEffect(() => { setHeader({title: 'Dashboard'}); return () => setHeader({}) }, [setHeader])

    return (
        <>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16}}>
                <StatCard icon="users" tone="blue" value="2,847" label="Total Students" delta={{dir: 'up', value: '+12%'}}/>
                <StatCard icon="user-cog" tone="orange" value="148" label="Total Teachers" delta={{dir: 'up', value: '+4%'}}/>
                <StatCard icon="book-open" tone="violet" value="356" label="Total Courses" delta={{dir: 'up', value: '+8%'}}/>
                <StatCard icon="credit-card" tone="green" value="1,203" label="Paid Students" delta={{dir: 'up', value: '+18%'}}/>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20}}>
                <SectionCard
                    title="Growth Overview"
                    action={<Badge variant="neutral" size="sm">Last 12 months</Badge>}
                >
                    <LineChart data={chartData}/>
                </SectionCard>
                <SectionCard
                    title="Paid Students"
                    action={<Badge variant="success" size="sm">+18%</Badge>}
                >
                    <div style={{fontSize: 28, fontWeight: 700, color: 'var(--it-text-primary)'}}>1,203</div>
                    <LineChart data={paidData}/>
                </SectionCard>
            </div>
        </>
    )
}

export default AdminDashboardPage
