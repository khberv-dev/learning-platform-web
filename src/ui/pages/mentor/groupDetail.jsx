import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Label} from '@gravity-ui/uikit';
import {MessageSquare, Upload, Video} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {GROUP_MENTOR_ROLE, useMyGroup} from '@/services/group/query.js';
import {useMe} from '@/services/user/query.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import {GroupScheduleView} from '@/ui/components/groupSchedule.jsx';
import {countSlots} from '@/shared/utils/schedule.js';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import {StartLiveLessonDialog, UploadRecordingDialog} from '@/ui/pages/mentor/liveLessonDialogs.jsx';

// Read-only - a mentor has no mutation route for a group at all (no edit, no
// roster changes; those stay admin-only). `GET mentor/groups/:id` answers with
// the same full detail (`mentors[]`, `students[]`) the admin single-group page
// gets, 403ing if this mentor isn't a member of it. "Chat"/"Start live lesson"/
// "Upload recording" only show up when this mentor is currently the group's
// primary - derived from `mentors[]` rather than assumed, since arriving here
// straight from a bookmarked URL skips the groups list's own primary-only
// filter.
function MentorGroupDetail() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {id} = useParams();
    const query = useMyGroup(id);
    const {data: me} = useMe();

    const [liveLessonOpen, setLiveLessonOpen] = useState(false);
    const [recordingOpen, setRecordingOpen] = useState(false);

    if (query.isPending) return <LoadingState rows={8}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const group = query.data;
    const mentors = group.mentors ?? [];
    const students = group.students ?? [];
    const isPrimary = mentors.some(
        (row) => row.mentor.id === me?.id && row.role === GROUP_MENTOR_ROLE.PRIMARY
    );

    const mentorColumns = [
        {
            id: 'mentor',
            name: t('group.mentor'),
            template: (row) => <UserCell user={row.mentor}/>,
        },
        {
            id: 'role',
            name: t('group.role'),
            template: (row) => (
                <Label theme={row.role === GROUP_MENTOR_ROLE.PRIMARY ? 'success' : 'info'}>
                    {t(row.role === GROUP_MENTOR_ROLE.PRIMARY ? 'group.rolePrimary' : 'group.roleSupport')}
                </Label>
            ),
        },
    ];

    const studentColumns = [
        {id: 'student', name: t('group.students'), template: (row) => <UserCell user={row}/>},
        {id: 'level', name: t('student.level'), template: (row) => row.level || '—'},
    ];

    return (
        <>
            <PageHeader
                title={group.title}
                description={<ActiveLabel active={group.isActive}/>}
                backTo="/mentor/groups"
                breadcrumbs={[{title: t('group.myGroups'), to: '/mentor/groups'}, {title: group.title}]}
                actions={
                    isPrimary && (
                        <>
                            <Button view="outlined" onClick={() => navigate(`/mentor/groups/${group.id}/chat`)}>
                                <Button.Icon>
                                    <MessageSquare size={15}/>
                                </Button.Icon>
                                {t('chat.title')}
                            </Button>
                            <Button view="outlined" onClick={() => setLiveLessonOpen(true)}>
                                <Button.Icon>
                                    <Video size={15}/>
                                </Button.Icon>
                                {t('liveLesson.start')}
                            </Button>
                            <Button view="outlined" onClick={() => setRecordingOpen(true)}>
                                <Button.Icon>
                                    <Upload size={15}/>
                                </Button.Icon>
                                {t('liveLesson.uploadRecording')}
                            </Button>
                        </>
                    )
                }
            />

            <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                <PageSection title={t('group.mentors')}>
                    <DataTable
                        rows={mentors}
                        columns={mentorColumns}
                        getRowId={(row) => row.id}
                        emptyTitle={t('group.noMentors')}
                    />
                </PageSection>

                <PageSection title={t('group.students')} description={`${t('common.total')}: ${students.length}`}>
                    <DataTable rows={students} columns={studentColumns} emptyTitle={t('group.noStudents')}/>
                </PageSection>

                <PageSection
                    title={t('group.schedule')}
                    description={`${t('common.total')}: ${countSlots(group.schedule)}`}
                >
                    {countSlots(group.schedule) > 0 ? (
                        <GroupScheduleView value={group.schedule}/>
                    ) : (
                        <div style={{color: 'var(--g-color-text-secondary)', fontSize: 14}}>
                            {t('group.noSchedule')}
                        </div>
                    )}
                </PageSection>
            </div>

            {isPrimary && (
                <>
                    <StartLiveLessonDialog
                        open={liveLessonOpen}
                        groupId={group.id}
                        onClose={() => setLiveLessonOpen(false)}
                    />
                    <UploadRecordingDialog
                        open={recordingOpen}
                        groupId={group.id}
                        onClose={() => setRecordingOpen(false)}
                    />
                </>
            )}
        </>
    );
}

export default MentorGroupDetail;
