import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Button} from '@gravity-ui/uikit';
import {ArrowRightLeft, MessageSquare, Pencil, Plus, Trash2, UserCog} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    useGroup,
    useRemoveGroupStudent,
    useUnassignPrimaryMentor,
    useUpdateGroup,
} from '@/services/group/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import {formatDate, fullName} from '@/shared/utils/format.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import {GroupScheduleEditor, GroupScheduleView} from '@/ui/components/groupSchedule.jsx';
import {cleanFreeSchedule, countSlots} from '@/shared/utils/schedule.js';
import {ActiveLabel} from '@/ui/components/statusLabel.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import GroupFormDialog from '@/ui/pages/admin/groups/groupFormDialog.jsx';
import {AddStudentsDialog, MentorPickerDialog, SwapStudentDialog} from '@/ui/pages/admin/groups/groupRosterDialogs.jsx';

function AdminGroupDetail() {
    const {t} = useI18n();
    const navigate = useNavigate();
    const {id} = useParams();
    const query = useGroup(id);
    const updateGroup = useUpdateGroup();
    const removeStudent = useRemoveGroupStudent();
    const unassignMentor = useUnassignPrimaryMentor();

    const [editOpen, setEditOpen] = useState(false);
    const [scheduleEditing, setScheduleEditing] = useState(false);
    const [scheduleDraft, setScheduleDraft] = useState({});
    const [mentorPickerOpen, setMentorPickerOpen] = useState(false);
    const [addStudentsOpen, setAddStudentsOpen] = useState(false);
    const [swapStudent, setSwapStudent] = useState(null);
    const [studentToRemove, setStudentToRemove] = useState(null);
    const [confirmUnassign, setConfirmUnassign] = useState(false);

    if (query.isPending) return <LoadingState rows={8}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const group = query.data;
    const mentor = group.primaryMentor ?? null;
    const students = group.students ?? [];

    const onError = (name) => (error) =>
        toaster.add({name, theme: 'danger', title: extractApiErrorMessage(error, t('common.error'))});
    const onDone = (name) => () => toaster.add({name, theme: 'success', title: t('common.saved')});

    const startScheduleEdit = () => {
        setScheduleDraft(group.schedule ?? {});
        setScheduleEditing(true);
    };

    const saveSchedule = () =>
        updateGroup.mutate(
            {id: group.id, schedule: cleanFreeSchedule(scheduleDraft)},
            {
                onSuccess: () => {
                    onDone('group-schedule')();
                    setScheduleEditing(false);
                },
                onError: onError('group-schedule-failed'),
            }
        );

    const studentColumns = [
        {
            id: 'student',
            name: t('group.students'),
            template: (row) => <UserCell user={row}/>,
        },
        {id: 'level', name: t('student.level'), template: (row) => row.level || '—'},
        {id: 'joinedAt', name: t('group.joinedAt'), template: (row) => formatDate(row.joinedAt)},
        {
            id: 'actions',
            name: '',
            width: 180,
            template: (row) => (
                <div style={{display: 'flex', gap: 4, justifyContent: 'flex-end'}}>
                    <Button view="flat" size="s" onClick={() => setSwapStudent(row)}>
                        <Button.Icon>
                            <ArrowRightLeft size={15}/>
                        </Button.Icon>
                        {t('group.swap')}
                    </Button>
                    <Button
                        view="flat-danger"
                        size="s"
                        aria-label={t('common.delete')}
                        onClick={() => setStudentToRemove(row)}
                    >
                        <Button.Icon>
                            <Trash2 size={15}/>
                        </Button.Icon>
                    </Button>
                </div>
            ),
        },
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
                backTo="/admin/groups"
                breadcrumbs={[{title: t('group.title'), to: '/admin/groups'}, {title: group.title}]}
                actions={
                    <>
                        <Button view="outlined" onClick={() => navigate(`/admin/groups/${group.id}/chat`)}>
                            <Button.Icon>
                                <MessageSquare size={15}/>
                            </Button.Icon>
                            {t('chat.title')}
                        </Button>
                        <Button view="outlined" onClick={() => setEditOpen(true)}>
                            <Button.Icon>
                                <Pencil size={15}/>
                            </Button.Icon>
                            {t('common.edit')}
                        </Button>
                    </>
                }
            />

            <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                {/* Groups that predate courses come back with none, and until
                    one is set the one-group-per-course rule can't apply. */}
                {!group.course && (
                    <Alert
                        theme="warning"
                        title={t('group.noCourse')}
                        message={t('group.noCourseHint')}
                        actions={
                            <Alert.Actions>
                                <Alert.Action onClick={() => setEditOpen(true)}>{t('group.pickCourse')}</Alert.Action>
                            </Alert.Actions>
                        }
                    />
                )}

                <PageSection
                    title={t('group.mentor')}
                    description={t('group.primaryHint')}
                    actions={
                        <>
                            <Button view="outlined" onClick={() => setMentorPickerOpen(true)}>
                                <Button.Icon>
                                    <UserCog size={15}/>
                                </Button.Icon>
                                {t(mentor ? 'group.changeMentor' : 'group.assignMentor')}
                            </Button>
                            {mentor && (
                                <Button
                                    view="flat-danger"
                                    aria-label={t('group.removeMentor')}
                                    onClick={() => setConfirmUnassign(true)}
                                >
                                    <Button.Icon>
                                        <Trash2 size={15}/>
                                    </Button.Icon>
                                </Button>
                            )}
                        </>
                    }
                >
                    {mentor ? (
                        <UserCell user={mentor}/>
                    ) : (
                        <div style={{color: 'var(--g-color-text-secondary)', fontSize: 14}}>
                            {t('group.noMentor')}
                        </div>
                    )}
                </PageSection>

                <PageSection
                    title={t('group.students')}
                    description={`${t('common.total')}: ${students.length}`}
                    actions={
                        <Button view="action" onClick={() => setAddStudentsOpen(true)}>
                            <Button.Icon>
                                <Plus size={15}/>
                            </Button.Icon>
                            {t('group.addStudents')}
                        </Button>
                    }
                >
                    <DataTable
                        rows={students}
                        columns={studentColumns}
                        emptyTitle={t('group.noStudents')}
                    />
                </PageSection>

                <PageSection
                    title={t('group.schedule')}
                    description={scheduleEditing ? undefined : `${t('common.total')}: ${countSlots(group.schedule)}`}
                    actions={
                        scheduleEditing ? (
                            <>
                                <Button view="flat" onClick={() => setScheduleEditing(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button view="action" loading={updateGroup.isPending} onClick={saveSchedule}>
                                    {t('common.save')}
                                </Button>
                            </>
                        ) : (
                            <Button view="outlined" onClick={startScheduleEdit}>
                                <Button.Icon>
                                    <Pencil size={15}/>
                                </Button.Icon>
                                {t('common.edit')}
                            </Button>
                        )
                    }
                >
                    {scheduleEditing ? (
                        <GroupScheduleEditor value={scheduleDraft} onChange={setScheduleDraft}/>
                    ) : countSlots(group.schedule) > 0 ? (
                        <GroupScheduleView value={group.schedule}/>
                    ) : (
                        <div style={{color: 'var(--g-color-text-secondary)', fontSize: 14}}>
                            {t('group.noSchedule')}
                        </div>
                    )}
                </PageSection>
            </div>

            <GroupFormDialog open={editOpen} group={group} onClose={() => setEditOpen(false)}/>

            <MentorPickerDialog
                open={mentorPickerOpen}
                groupId={group.id}
                currentMentorId={mentor?.id ?? null}
                onClose={() => setMentorPickerOpen(false)}
            />

            <AddStudentsDialog
                open={addStudentsOpen}
                groupId={group.id}
                excludeIds={students.map((student) => student.id)}
                onClose={() => setAddStudentsOpen(false)}
            />

            <SwapStudentDialog
                open={Boolean(swapStudent)}
                groupId={group.id}
                student={swapStudent}
                onClose={() => setSwapStudent(null)}
                onMoved={(toGroupId) => navigate(`/admin/groups/${toGroupId}`)}
            />

            <ConfirmDialog
                open={Boolean(studentToRemove)}
                title={t('group.removeStudent')}
                message={t('group.removeStudentConfirm', {name: fullName(studentToRemove)})}
                confirmText={t('common.delete')}
                loading={removeStudent.isPending}
                onClose={() => setStudentToRemove(null)}
                onConfirm={() =>
                    removeStudent.mutate(
                        {id: group.id, studentId: studentToRemove.id},
                        {
                            onSuccess: () => {
                                onDone('group-student-removed')();
                                setStudentToRemove(null);
                            },
                            onError: onError('group-student-remove-failed'),
                        }
                    )
                }
            />

            <ConfirmDialog
                open={confirmUnassign}
                title={t('group.removeMentor')}
                message={t('group.removeMentorConfirm', {name: fullName(mentor)})}
                confirmText={t('common.delete')}
                loading={unassignMentor.isPending}
                onClose={() => setConfirmUnassign(false)}
                onConfirm={() =>
                    unassignMentor.mutate(group.id, {
                        onSuccess: () => {
                            onDone('group-mentor-removed')();
                            setConfirmUnassign(false);
                        },
                        onError: onError('group-mentor-remove-failed'),
                    })
                }
            />
        </>
    );
}

export default AdminGroupDetail;
