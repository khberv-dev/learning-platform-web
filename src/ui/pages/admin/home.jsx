import {useState} from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {CalendarClock, UserCheck, UserCog, Users} from 'lucide-react';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import dayjs from 'dayjs';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {STATS_PERIODS, useStatsSummary, useStatsTimeseries} from '@/services/stats/query.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

// Recharts renders as SVG, so these can reference Gravity's CSS custom
// properties directly and follow a theme switch with no JS involved.
const SERIES = [
    {key: 'users', color: 'var(--g-color-base-info-heavy)'},
    {key: 'mentors', color: 'var(--g-color-base-positive-heavy)'},
    {key: 'enrollments', color: 'var(--g-color-base-warning-heavy)'},
    {key: 'assignments', color: 'var(--g-color-base-danger-heavy)'},
];

function AdminHome() {
    const {t} = useI18n();
    const [period, setPeriod] = useState(30);
    const summary = useStatsSummary();
    const timeseries = useStatsTimeseries(period);

    return (
        <>
            <PageHeader title={t('nav.home')}/>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 20,
                }}
            >
                <StatCard
                    label={t('dashboard.users')}
                    value={summary.data?.users}
                    icon={Users}
                    loading={summary.isPending}
                />
                <StatCard
                    label={t('dashboard.mentors')}
                    value={summary.data?.mentors}
                    icon={UserCog}
                    loading={summary.isPending}
                />
                <StatCard
                    label={t('dashboard.enrollments')}
                    value={summary.data?.enrollments}
                    icon={CalendarClock}
                    loading={summary.isPending}
                />
                <StatCard
                    label={t('dashboard.assignments')}
                    value={summary.data?.assignments}
                    icon={UserCheck}
                    loading={summary.isPending}
                />
            </div>

            <PageSection
                title={t('dashboard.trend')}
                actions={
                    <SegmentedRadioGroup
                        value={String(period)}
                        onUpdate={(value) => setPeriod(Number(value))}
                    >
                        {STATS_PERIODS.map((value) => (
                            <SegmentedRadioGroup.Option key={value} value={String(value)}>
                                {t(`dashboard.period${value}`)}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                }
            >
                {timeseries.isPending && <LoadingState rows={6}/>}
                {timeseries.isError && (
                    <ErrorState error={timeseries.error} onRetry={timeseries.refetch}/>
                )}
                {timeseries.data && (
                    <div style={{height: 340}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeseries.data} margin={{top: 8, right: 8, bottom: 0, left: -16}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--g-color-line-generic)"/>
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => dayjs(value).format('DD.MM')}
                                    stroke="var(--g-color-text-secondary)"
                                    fontSize={12}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    stroke="var(--g-color-text-secondary)"
                                    fontSize={12}
                                />
                                <Tooltip
                                    labelFormatter={(value) => dayjs(value).format('DD.MM.YYYY')}
                                    contentStyle={{
                                        background: 'var(--g-color-base-float)',
                                        border: '1px solid var(--g-color-line-generic)',
                                        borderRadius: 8,
                                        color: 'var(--g-color-text-primary)',
                                    }}
                                />
                                <Legend/>
                                {SERIES.map((series) => (
                                    <Line
                                        key={series.key}
                                        type="monotone"
                                        dataKey={series.key}
                                        name={t(`dashboard.${series.key}`)}
                                        stroke={series.color}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </PageSection>
        </>
    );
}

export default AdminHome;
