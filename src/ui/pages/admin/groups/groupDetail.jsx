import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Label} from '@gravity-ui/uikit';
import {ArrowRightLeft, MessageSquare, Pencil, Plus, Trash2, UserCheck} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    GROUP_MENTOR_ROLE,
    useAssignPrimaryMentor,
    useGroup,
    useRemoveGroupMentor,
    useRemoveGroupStudent,
    useUpdateGroup,
} from '@/services/group/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import {fullName} from '@/shared/utils/format.js';
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
    const removeMentor = useRemoveGroupMentor();

    const [editOpen, setEditOpen] = useState(false);
    const [scheduleEditing, setScheduleEditing] = useState(false);
    const [scheduleDraft, setScheduleDraft] = useState({});
    const [mentorMode, setMentorMode] = useState(null);
    // Keeps the picker's title stable while its close animation plays.
    const lastMode = mentorMode?.mode === 'primary' ? 'primary' : 'support';
    const [addStudentsOpen, setAddStudentsOpen] = useState(false);
    const [swapStudent, setSwapStudent] = useState(null);
    const [studentToRemove, setStudentToRemove] = useState(null);
    const [mentorToRemove, setMentorToRemove] = useState(null);

    if (query.isPending) return <LoadingState rows={8}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const group = query.data;
    const mentors = group.mentors ?? [];
    const students = group.students ?? [];
    const primary = mentors.find((row) => row.role === GROUP_MENTOR_ROLE.PRIMARY);

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

    const mentorColumns = [
        {
            id: 'mentor',
            name: t('group.mentor'),
            // No `secondary` override: the role column already says primary/
            // support, so the phone number (UserCell's default) is more useful
            // here than repeating it.
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
        {
            id: 'actions',
            name: '',
            width: 200,
            template: (row) => (
                <div style={{display: 'flex', gap: 4, justifyContent: 'flex-end'}}>
                    {row.role === GROUP_MENTOR_ROLE.SUPPORT && (
                        <Button
                            view="flat"
                            size="s"
                            title={t('group.makePrimary')}
                            onClick={() =>
                                // Promotion goes through the same route as assigning.
                                setMentorMode({mode: 'promote', mentor: row.mentor})
                            }
                        >
                            <Button.Icon>
                                <UserCheck size={15}/>
                            </Button.Icon>
                            {t('group.makePrimary')}
                        </Button>
                    )}
                    <Button
                        view="flat-danger"
                        size="s"
                        aria-label={t('common.delete')}
                        onClick={() => setMentorToRemove(row.mentor)}
                    >
                        <Button.Icon>
                            <Trash2 size={15}/>
                        </Button.Icon>
                    </Button>
                </div>
            ),
        },
    ];

    const studentColumns = [
        {
            id: 'student',
            name: t('group.students'),
            template: (row) => <UserCell user={row}/>,
        },
        {id: 'level', name: t('student.level'), template: (row) => row.level || '—'},
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
                description={<ActiveLabel active={group.isActive}/>}
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
                <PageSection
                    title={t('group.mentors')}
                    actions={
                        <>
                            <Button view="outlined" onClick={() => setMentorMode({mode: 'primary'})}>
                                {t('group.assignPrimary')}
                            </Button>
                            <Button view="outlined" onClick={() => setMentorMode({mode: 'support'})}>
                                <Button.Icon>
                                    <Plus size={15}/>
                                </Button.Icon>
                                {t('group.addSupport')}
                            </Button>
                        </>
                    }
                >
                    <DataTable
                        rows={mentors}
                        columns={mentorColumns}
                        getRowId={(row) => row.id}
                        emptyTitle={t('group.noMentors')}
                    />
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
                open={Boolean(mentorMode) && mentorMode.mode !== 'promote'}
                mode={mentorMode?.mode ?? lastMode}
                groupId={group.id}
                // Support: hide everyone already on the group. Primary: only the
                // current primary is pointless to pick.
                excludeIds={
                    mentorMode?.mode === 'support'
                        ? mentors.map((row) => row.mentor.id)
                        : primary
                          ? [primary.mentor.id]
                          : []
                }
                onClose={() => setMentorMode(null)}
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

            <PromoteMentorConfirm
                mentor={mentorMode?.mode === 'promote' ? mentorMode.mentor : null}
                groupId={group.id}
                primaryName={primary ? fullName(primary.mentor) : null}
                onClose={() => setMentorMode(null)}
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
                open={Boolean(mentorToRemove)}
                title={t('group.removeMentor')}
                message={t(
                    mentorToRemove && mentorToRemove.id === primary?.mentor.id
                        ? 'group.removePrimaryConfirm'
                        : 'group.removeMentorConfirm',
                    {name: fullName(mentorToRemove)}
                )}
                confirmText={t('common.delete')}
                loading={removeMentor.isPending}
                onClose={() => setMentorToRemove(null)}
                onConfirm={() =>
                    removeMentor.mutate(
                        {id: group.id, mentorId: mentorToRemove.id},
                        {
                            onSuccess: () => {
                                onDone('group-mentor-removed')();
                                setMentorToRemove(null);
                            },
                            onError: onError('group-mentor-remove-failed'),
                        }
                    )
                }
            />
        </>
    );
}

// Promoting a support mentor replaces the current primary, so it is confirmed
// rather than fired straight from the row button.
function PromoteMentorConfirm({mentor, groupId, primaryName, onClose}) {
    const {t} = useI18n();
    const assign = useAssignPrimaryMentor();

    return (
        <ConfirmDialog
            open={Boolean(mentor)}
            title={t('group.makePrimary')}
            message={t(primaryName ? 'group.promoteConfirmReplace' : 'group.promoteConfirm', {
                name: fullName(mentor),
                current: primaryName,
            })}
            confirmText={t('common.confirm')}
            danger={false}
            loading={assign.isPending}
            onClose={onClose}
            onConfirm={() =>
                assign.mutate(
                    {id: groupId, mentorId: mentor.id},
                    {
                        onSuccess: () => {
                            toaster.add({name: 'group-primary', theme: 'success', title: t('common.saved')});
                            onClose();
                        },
                        onError: (error) =>
                            toaster.add({
                                name: 'group-primary-failed',
                                theme: 'danger',
                                title: extractApiErrorMessage(error, t('common.error')),
                            }),
                    }
                )
            }
        />
    );
}

export default AdminGroupDetail;
