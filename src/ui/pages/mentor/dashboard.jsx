import {useNavigate} from 'react-router-dom';
import {Button} from '@gravity-ui/uikit';
import {CalendarClock, Star, UserCheck, Users} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useMySummary} from '@/services/mentor/query.js';
import {usePendingAssignments} from '@/services/assignment/query.js';
import {formatDate, fullName} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import {EmptyState} from '@/ui/components/stateViews.jsx';

function MentorDashboard() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const summary = useMySummary();
    const pending = usePendingAssignments();

    const pendingItems = pending.data ?? [];

    return (
        <>
            <PageHeader title={t('nav.dashboard')}/>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 20,
                }}
            >
                <StatCard
                    label={t('dashboard.totalStudents')}
                    value={summary.data?.totalStudents}
                    icon={Users}
                    loading={summary.isPending}
                />
                <StatCard
                    label={t('dashboard.newThisMonth')}
                    value={summary.data?.newStudentsThisMonth}
                    icon={UserCheck}
                    loading={summary.isPending}
                />
                <StatCard
                    label={t('dashboard.liveSessions')}
                    value={summary.data?.liveSessionsScheduled}
                    icon={CalendarClock}
                    loading={summary.isPending}
                />
                <StatCard
                    label={t('dashboard.rating')}
                    value={summary.data?.averageRating}
                    icon={Star}
                    loading={summary.isPending}
                />
            </div>

            <PageSection
                title={t('assignment.pending')}
                actions={
                    <Button onClick={() => navigate('/mentor/assignments')}>{t('common.all')}</Button>
                }
            >
                {pendingItems.length === 0 ? (
                    <EmptyState title={t('assignment.noPending')}/>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        {pendingItems.slice(0, 5).map((assignment) => (
                            <div
                                key={assignment.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    padding: '10px 12px',
                                    border: '1px solid var(--g-color-line-generic)',
                                    borderRadius: 8,
                                }}
                            >
                                <div>
                                    <div style={{fontWeight: 500}}>
                                        {fullName(assignment.student?.user) || '—'}
                                    </div>
                                    <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>
                                        {formatDate(assignment.startDate)} — {formatDate(assignment.endDate)}
                                    </div>
                                </div>
                                <Button size="s" onClick={() => navigate('/mentor/assignments')}>
                                    {t('common.actions')}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </PageSection>
        </>
    );
}

export default MentorDashboard;
