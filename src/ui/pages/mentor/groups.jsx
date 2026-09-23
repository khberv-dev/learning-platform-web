import {useNavigate} from 'react-router-dom';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {GROUP_MENTOR_ROLE, useMyGroups} from '@/services/group/query.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {GroupScheduleDays} from '@/ui/components/groupSchedule.jsx';

// Same table as the admin groups list, scoped to this mentor's own groups -
// `GET mentor/groups/me` is the same lightweight `Group & {primaryMentor}` row
// `GET admin/groups` returns (no roster, no co-mentor list), so there is
// nothing more to show in a list row here than there is there.
//
// A support mentor has no action available on a group they don't lead (no
// chat, no live lesson, no recording upload), so this page drops those
// entirely rather than sending them to a bare detail page - a mentor sees
// only the groups they currently lead.
function MentorGroups() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const query = useMyGroups();

    const rows = (query.data?.data ?? []).filter((group) => group.role === GROUP_MENTOR_ROLE.PRIMARY);

    const columns = [
        {
            id: 'title',
            name: t('group.name'),
            template: (row) => <span style={{fontWeight: 500}}>{row.title}</span>,
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
                    rows={rows}
                    columns={columns}
                    emptyTitle={t('group.noMyGroups')}
                    onRowClick={(row) => navigate(`/mentor/groups/${row.id}`)}
                />
            </PageSection>
        </div>
    );
}

export default MentorGroups;
