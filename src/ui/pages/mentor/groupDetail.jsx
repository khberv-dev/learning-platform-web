import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button} from '@gravity-ui/uikit';
import {MessageSquare, Upload, Video} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useMyGroup} from '@/services/group/query.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import {GroupScheduleView} from '@/ui/components/groupSchedule.jsx';
import {countSlots} from '@/shared/utils/schedule.js';
import {formatDate} from '@/shared/utils/format.js';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import {StartLiveLessonDialog, UploadRecordingDialog} from '@/ui/pages/mentor/liveLessonDialogs.jsx';

// Read-only - a mentor has no mutation route for a group at all (no edit, no
// roster changes; those stay admin-only). `GET mentor/groups/:id` answers with
// the same detail the admin page gets and 403s unless this mentor is the
// group's `primaryMentor`, so reaching this page at all means the chat, live
// lesson and recording actions are available - the error state covers the
// rest (a bookmarked URL for a group they no longer lead).
function MentorGroupDetail() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {id} = useParams();
    const query = useMyGroup(id);

    const [liveLessonOpen, setLiveLessonOpen] = useState(false);
    const [recordingOpen, setRecordingOpen] = useState(false);

    if (query.isPending) return <LoadingState rows={8}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const group = query.data;
    const students = group.students ?? [];

    const studentColumns = [
        {id: 'student', name: t('group.students'), template: (row) => <UserCell user={row}/>},
        {id: 'level', name: t('student.level'), template: (row) => row.level || '—'},
        {id: 'joinedAt', name: t('group.joinedAt'), template: (row) => formatDate(row.joinedAt)},
    ];

    return (
        <>
            <PageHeader
                title={group.title}
                description={
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                        <ActiveLabel active={group.isActive}/>
                        {group.course && <span>{group.course.title}</span>}
                    </span>
                }
                backTo="/mentor/groups"
                breadcrumbs={[{title: t('group.myGroups'), to: '/mentor/groups'}, {title: group.title}]}
                actions={
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
                }
            />

            <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
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
    );
}

export default MentorGroupDetail;
