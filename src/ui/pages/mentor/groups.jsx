import {useNavigate} from 'react-router-dom';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useMyGroups} from '@/services/group/query.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {GroupScheduleDays} from '@/ui/components/groupSchedule.jsx';

// Same table as the admin groups list, scoped to this mentor's own groups.
// `GET mentor/groups/me` only returns groups whose `primaryMentor` is the
// caller (a group has one mentor, there are no support seats), with the same
// row shape as `GET admin/groups` - no roster.
function MentorGroups() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const query = useMyGroups();

    const columns = [
        {
            id: 'title',
            name: t('group.name'),
            template: (row) => <span style={{fontWeight: 500}}>{row.title}</span>,
        },
        {
            id: 'course',
            name: t('group.course'),
            template: (row) => row.course?.title ?? '—',
        },
        {
            id: 'schedule',
            name: t('group.schedule'),
            template: (row) => <GroupScheduleDays value={row.schedule}/>,
        },
        {
            id: 'isActive',
            name: t('common.status'),
            template: (row) => <ActiveLabel active={row.isActive}/>,
        },
    ];

    return (
        <div className="page-fill">
            <PageHeader title={t('group.myGroups')}/>
            <PageSection className="page-fill__section">
                <DataTable
                    query={query}
                    columns={columns}
                    emptyTitle={t('group.noMyGroups')}
                    onRowClick={(row) => navigate(`/mentor/groups/${row.id}`)}
                />
            </PageSection>
        </div>
    );
}

export default MentorGroups;
