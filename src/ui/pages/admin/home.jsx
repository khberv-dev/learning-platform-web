import {useState} from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {Activity, CalendarClock, CalendarDays, CalendarRange, UserCheck, UserCog, Users} from 'lucide-react';
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
const GROWTH_SERIES = [
    {key: 'users', labelKey: 'newUsers', color: 'var(--g-color-base-info-heavy)'},
    {key: 'mentors', color: 'var(--g-color-base-positive-heavy)'},
    {key: 'enrollments', color: 'var(--g-color-base-warning-heavy)'},
    {key: 'assignments', color: 'var(--g-color-base-danger-heavy)'},
];

function MetricsChart({data, series, t}) {
    return (
        <div style={{height: 340}}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{top: 8, right: 8, bottom: 0, left: -16}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--g-color-line-generic)"/>
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => dayjs(value).format('DD.MM')}
                        stroke="var(--g-color-text-secondary)"
                        fontSize={12}
                    />
                    <YAxis allowDecimals={false} stroke="var(--g-color-text-secondary)" fontSize={12}/>
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
                    {series.map((item) => (
                        <Line
                            key={item.key}
                            type="monotone"
                            dataKey={item.key}
                            name={t(`dashboard.${item.labelKey ?? item.key}`)}
                            stroke={item.color}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

const ACTIVITY_CHARTS = [
    {
        key: 'dau',
        color: 'var(--g-color-base-info-heavy)',
        dataKey: 'date',
        tickFormatter: (value) => dayjs(value).format('DD.MM'),
        labelFormatter: (value) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
        key: 'wau',
        color: 'var(--g-color-base-positive-heavy)',
        dataKey: 'startDate',
        tickFormatter: (value) => dayjs(value).format('DD.MM'),
        labelFormatter: (_, payload) => {
            const row = payload?.[0]?.payload;
            if (!row) return '';
            return `${dayjs(row.startDate).format('DD.MM.YYYY')} – ${dayjs(row.endDate).format('DD.MM.YYYY')}`;
        },
    },
    {
        key: 'mau',
        color: 'var(--g-color-base-brand)',
        dataKey: 'month',
        tickFormatter: (value) => dayjs(`${value}-01`).format('MM.YYYY'),
        labelFormatter: (value) => dayjs(`${value}-01`).format('MMMM YYYY'),
    },
];

function ActivityMetricChart({metric, data, t}) {
    return (
        <div style={{minWidth: 0}}>
            <div style={{fontSize: 14, fontWeight: 600, marginBottom: 8}}>{t(`dashboard.${metric.key}`)}</div>
            <div style={{height: 240}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data ?? []} margin={{top: 8, right: 8, bottom: 0, left: -24}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--g-color-line-generic)"/>
                        <XAxis
                            dataKey={metric.dataKey}
                            tickFormatter={metric.tickFormatter}
                            stroke="var(--g-color-text-secondary)"
                            fontSize={11}
                        />
                        <YAxis allowDecimals={false} stroke="var(--g-color-text-secondary)" fontSize={11}/>
                        <Tooltip
                            labelFormatter={metric.labelFormatter}
                            formatter={(value) => [value, t(`dashboard.${metric.key}`)]}
                            contentStyle={{
                                background: 'var(--g-color-base-float)',
                                border: '1px solid var(--g-color-line-generic)',
                                borderRadius: 8,
                                color: 'var(--g-color-text-primary)',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            name={t(`dashboard.${metric.key}`)}
                            stroke={metric.color}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function AdminHome() {
    const {t} = useI18n();
    const [growthPeriod, setGrowthPeriod] = useState(30);
    const [activityMetricKey, setActivityMetricKey] = useState('dau');
    const summary = useStatsSummary();
    const growthTimeseries = useStatsTimeseries(growthPeriod);
    const activityTimeseries = useStatsTimeseries(30);
    const activityMetric = ACTIVITY_CHARTS.find((metric) => metric.key === activityMetricKey);

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
                title={t('dashboard.activity')}
                style={{marginBottom: 20}}
                actions={
                    <SegmentedRadioGroup value={activityMetricKey} onUpdate={setActivityMetricKey}>
                        {ACTIVITY_CHARTS.map((metric) => (
                            <SegmentedRadioGroup.Option key={metric.key} value={metric.key}>
                                {metric.key.toUpperCase()}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                }
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16,
                        marginBottom: 20,
                    }}
                >
                    <StatCard label={t('dashboard.dau')} value={summary.data?.dau} icon={Activity} loading={summary.isPending}/>
                    <StatCard
                        label={t('dashboard.wau')}
                        value={summary.data?.wau}
                        icon={CalendarDays}
                        loading={summary.isPending}
                    />
                    <StatCard
                        label={t('dashboard.mau')}
                        value={summary.data?.mau}
                        icon={CalendarRange}
                        loading={summary.isPending}
                    />
                </div>
                {activityTimeseries.isPending && <LoadingState rows={6}/>}
                {activityTimeseries.isError && (
                    <ErrorState error={activityTimeseries.error} onRetry={activityTimeseries.refetch}/>
                )}
                {activityTimeseries.data?.activeUserMetrics && activityMetric && (
                    <ActivityMetricChart
                        metric={activityMetric}
                        data={activityTimeseries.data.activeUserMetrics[activityMetric.key]}
                        t={t}
                    />
                )}
            </PageSection>

            <PageSection
                title={t('dashboard.growthTrend')}
                actions={
                    <SegmentedRadioGroup
                        value={String(growthPeriod)}
                        onUpdate={(value) => setGrowthPeriod(Number(value))}
                    >
                        {STATS_PERIODS.map((value) => (
                            <SegmentedRadioGroup.Option key={value} value={String(value)}>
                                {t(`dashboard.period${value}`)}
                            </SegmentedRadioGroup.Option>
                        ))}
                    </SegmentedRadioGroup>
                }
            >
                {growthTimeseries.isPending && <LoadingState rows={6}/>}
                {growthTimeseries.isError && (
                    <ErrorState error={growthTimeseries.error} onRetry={growthTimeseries.refetch}/>
                )}
                {growthTimeseries.data?.businessMetrics && (
                    <MetricsChart data={growthTimeseries.data.businessMetrics} series={GROWTH_SERIES} t={t}/>
                )}
            </PageSection>
        </>
    );
}

export default AdminHome;
