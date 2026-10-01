import {useNavigate} from 'react-router-dom';
import {Button} from '@gravity-ui/uikit';
import {Star, UserCheck, Users} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useMySummary} from '@/services/mentor/query.js';
import {useMyGroups} from '@/services/group/query.js';
import {countSlots} from '@/shared/utils/schedule.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import StatCard from '@/ui/components/statCard.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {EmptyState} from '@/ui/components/stateViews.jsx';

function MentorDashboard() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const summary = useMySummary();
    const groups = useMyGroups();

    // Only the groups this mentor leads - the API returns nothing else.
    const groupItems = groups.data?.data ?? [];

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
                    label={t('dashboard.rating')}
                    value={summary.data?.averageRating}
                    icon={Star}
                    loading={summary.isPending}
                />
            </div>

            <PageSection
                title={t('group.myGroups')}
                actions={<Button onClick={() => navigate('/mentor/groups')}>{t('common.all')}</Button>}
            >
                {groupItems.length === 0 ? (
                    <EmptyState title={t('group.noMyGroups')}/>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        {groupItems.slice(0, 5).map((group) => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/mentor/groups/${group.id}`)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    padding: '10px 12px',
                                    border: '1px solid var(--g-color-line-generic)',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                }}
                            >
                                <div>
                                    <div style={{fontWeight: 500}}>{group.title}</div>
                                    {group.course && (
                                        <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>
                                            {group.course.title}
                                        </div>
                                    )}
                                    {countSlots(group.schedule) > 0 && (
                                        <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>
                                            {t('group.schedule')}: {countSlots(group.schedule)}
                                        </div>
                                    )}
                                </div>
                                <ActiveLabel active={group.isActive}/>
                            </div>
                        ))}
                    </div>
                )}
            </PageSection>
        </>
    );
}

export default MentorDashboard;
