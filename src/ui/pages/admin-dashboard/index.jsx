import {useEffect, useState} from 'react'
import {useHeader} from '@/providers/header.jsx'
import {StatCard} from '@/ui/components/stat-card/index.jsx'
import {SectionCard} from '@/ui/components/section-card/index.jsx'
import {LineChart} from '@/ui/components/line-chart/index.jsx'
import {useGetStatsSummary, useGetStatsTimeseries} from '@/services/stats/query.js'

const PERIODS = [
    {value: 7, label: 'Last 7 days'},
    {value: 14, label: 'Last 14 days'},
    {value: 30, label: 'Last 30 days'},
]

function formatDate(dateStr) {
    const [, month, day] = dateStr.split('-')
    const monthName = new Date(`2000-${month}-01`).toLocaleString('en', {month: 'short'})
    return `${monthName} ${Number(day)}`
}

export function AdminDashboardPage() {
    const {setHeader} = useHeader()
    useEffect(() => { setHeader({title: 'Dashboard'}); return () => setHeader({}) }, [setHeader])

    const [period, setPeriod] = useState(30)

    const {data: summary} = useGetStatsSummary()
    const {data: timeseries = []} = useGetStatsTimeseries({period})

    const enrollmentSeries = timeseries.map(d => ({label: formatDate(d.date), value: d.enrollments}))
    const userSeries = timeseries.map(d => ({label: formatDate(d.date), value: d.users}))
    const periodUserCount = userSeries.reduce((sum, d) => sum + d.value, 0)

    return (
        <>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16}}>
                <StatCard icon="users" tone="blue" value={summary?.users ?? '—'} label="Total Users"/>
                <StatCard icon="user-cog" tone="orange" value={summary?.mentors ?? '—'} label="Total Teachers"/>
                <StatCard icon="book-copy" tone="violet" value={summary?.assignments ?? '—'} label="Assignments"/>
                <StatCard icon="notebook-pen" tone="green" value={summary?.enrollments ?? '—'} label="Enrollments"/>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20}}>
                <SectionCard
                    title="Enrollment Growth"
                    action={
                        <select
                            value={period}
                            onChange={e => setPeriod(Number(e.target.value))}
                            style={{
                                background: 'var(--it-surface-raised)',
                                border: '1px solid var(--it-border)',
                                borderRadius: 6,
                                color: 'var(--it-text-primary)',
                                fontSize: 12,
                                padding: '4px 8px',
                                cursor: 'pointer',
                            }}
                        >
                            {PERIODS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    }
                >
                    <LineChart data={enrollmentSeries} color="var(--it-green)"/>
                </SectionCard>
                <SectionCard title="New Users">
                    <div style={{fontSize: 28, fontWeight: 700, color: 'var(--it-text-primary)', marginBottom: 8}}>
                        {periodUserCount}
                    </div>
                    <LineChart data={userSeries} color="var(--it-info-text)" height={180}/>
                </SectionCard>
            </div>
        </>
    )
}

export default AdminDashboardPage
