import {Label} from '@gravity-ui/uikit';
import {formatDate} from '@/shared/utils/format.js';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import SubscriptionTerm from '@/ui/components/subscriptionTerm.jsx';
import {AssignmentScheduleView} from '@/ui/components/assignmentSchedule.jsx';

// Shared by the admin list and the student/mentor detail sections, which
// pass `hide` to drop the column their page already fixes.
export function assignmentColumns(t, {hide = []} = {}) {
    return [
        {
            id: 'student',
            name: t('assignment.student'),
            template: (row) => <UserCell user={row.student}/>,
        },
        {
            id: 'course',
            name: t('assignment.course'),
            template: (row) => row.subscription?.course?.title ?? '—',
        },
        {
            id: 'mentor',
            name: t('assignment.mentor'),
            template: (row) =>
                row.mentor ? (
                    <UserCell user={row.mentor}/>
                ) : (
                    <Label theme="warning" size="xs">
                        {t('assignment.noMentor')}
                    </Label>
                ),
        },
        {
            id: 'schedule',
            name: t('assignment.schedule'),
            template: (row) => <AssignmentScheduleView schedule={row.schedule} short/>,
        },
        {
            id: 'status',
            name: t('common.status'),
            template: (row) => <StatusLabel status={row.status} i18nPrefix="assignment"/>,
        },
        {
            id: 'subscription',
            name: t('assignment.subscription'),
            template: (row) => <SubscriptionTerm subscription={row.subscription}/>,
        },
        {id: 'createdAt', name: t('assignment.requestedAt'), template: (row) => formatDate(row.createdAt)},
    ].filter((column) => !hide.includes(column.id));
}
