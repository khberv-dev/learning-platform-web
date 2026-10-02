import {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {Button, Dialog, Label} from '@gravity-ui/uikit';
import {UserCog} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAssignAssignmentMentor, useAssignment} from '@/services/assignment/query.js';
import {MENTOR_STATUS, useMentors} from '@/services/mentor/query.js';
import {GROUP_MENTOR_ROLE} from '@/services/group/query.js';
import {useDebouncedValue} from '@/shared/hooks/useDebouncedValue.js';
import {formatDate, formatDateTime, formatPhone, fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import DataTable from '@/ui/components/dataTable.jsx';
import StatusLabel from '@/ui/components/statusLabel.jsx';
import UserCell from '@/ui/components/userCell.jsx';
import RemoteSelect from '@/ui/components/remoteSelect.jsx';
import {AssignmentScheduleView} from '@/ui/components/assignmentSchedule.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';
import SubscriptionTerm from '@/ui/components/subscriptionTerm.jsx';

// Mounted only while open. Only `support`-classified mentors take 1-to-1
// assignments (primary mentors lead groups) - a panel rule: the API itself
// checks just that the mentor is `working`, so the picker is what enforces
// the role. The mentor already on the assignment is hidden, since re-picking
// them 400s.
function AssignMentorFields({assignment, onClose}) {
    const {t} = useI18n();
    const assign = useAssignAssignmentMentor();
    const [search, setSearch] = useState('');
    const [picked, setPicked] = useState([]);
    const debounced = useDebouncedValue(search, 300);
    const mentors = useMentors({
        page: 1,
        limit: 20,
        search: debounced,
        status: MENTOR_STATUS.WORKING,
        role: GROUP_MENTOR_ROLE.SUPPORT,
    });

    const currentId = assignment.mentor?.id;
    const items = (mentors.data?.data ?? []).filter((mentor) => mentor.id !== currentId);

    const submit = () => {
        if (!picked.length) return;
        assign.mutate(
            {id: assignment.id, mentorId: picked[0]},
            {
                onSuccess: () => {
                    toaster.add({name: 'assignment-mentor', theme: 'success', title: t('common.saved')});
                    onClose();
                },
                onError: (error) =>
                    toaster.add({
                        name: 'assignment-mentor-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    return (
        <>
            <Dialog.Body>
                <RemoteSelect
                    label={t('assignment.mentor')}
                    hint={t(currentId ? 'assignment.reassignHint' : 'assignment.assignHint')}
                    items={items}
                    picked={picked}
                    onPick={setPicked}
                    onSearch={setSearch}
                    loading={mentors.isFetching}
                    getLabel={(mentor) =>
                        [fullName(mentor), mentor.phoneNumber ? formatPhone(mentor.phoneNumber) : null]
                            .filter(Boolean)
                            .join(' · ')
                    }
                />
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={submit}
                textButtonCancel={t('common.cancel')}
                textButtonApply={t('common.save')}
                propsButtonApply={{disabled: picked.length === 0}}
                loading={assign.isPending}
            />
        </>
    );
}

function Field({label, children}) {
    return (
        <div style={{minWidth: 0}}>
            <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)', marginBottom: 4}}>{label}</div>
            <div style={{fontSize: 14}}>{children}</div>
        </div>
    );
}

function AdminAssignmentDetail() {
    const {t} = useI18n();
    const {id} = useParams();
    const query = useAssignment(id);
    const [pickerOpen, setPickerOpen] = useState(false);

    if (query.isPending) return <LoadingState rows={6}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    const assignment = query.data;
    const student = assignment.student;
    const mentor = assignment.mentor;
    const title = fullName(student) || t('assignment.single');

    const historyColumns = [
        {id: 'mentor', name: t('assignment.mentor'), template: (row) => <UserCell user={row.mentor}/>},
        {id: 'start', name: t('assignment.historyStart'), template: (row) => formatDateTime(row.start)},
        {
            id: 'end',
            name: t('assignment.historyEnd'),
            // The open tenure is the current mentor.
            template: (row) =>
                row.end ? (
                    formatDateTime(row.end)
                ) : (
                    <Label theme="success" size="xs">
                        {t('assignment.current')}
                    </Label>
                ),
        },
    ];

    return (
        <>
            <PageHeader
                title={title}
                description={
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                        <StatusLabel status={assignment.status} i18nPrefix="assignment"/>
                        {assignment.subscription?.course?.title && <span>{assignment.subscription.course.title}</span>}
                    </span>
                }
                backTo="/admin/assignments"
                breadcrumbs={[{title: t('assignment.title'), to: '/admin/assignments'}, {title}]}
            />

            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16,
                    }}
                >
                    <PageSection title={t('assignment.student')}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
                            {student ? (
                                <Link
                                    to={`/admin/users/students/${student.id}`}
                                    style={{color: 'inherit', textDecoration: 'none'}}
                                >
                                    <UserCell user={student}/>
                                </Link>
                            ) : (
                                '—'
                            )}
                            <Field label={t('assignment.course')}>{assignment.subscription?.course?.title ?? '—'}</Field>
                            <Field label={t('assignment.subscription')}>
                                <SubscriptionTerm subscription={assignment.subscription}/>
                            </Field>
                            <Field label={t('assignment.requestedAt')}>{formatDateTime(assignment.createdAt)}</Field>
                        </div>
                    </PageSection>

                    <PageSection
                        title={t('assignment.mentor')}
                        actions={
                            <Button view={mentor ? 'outlined' : 'action'} onClick={() => setPickerOpen(true)}>
                                <Button.Icon>
                                    <UserCog size={15}/>
                                </Button.Icon>
                                {t(mentor ? 'assignment.reassign' : 'assignment.assign')}
                            </Button>
                        }
                    >
                        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
                            {mentor ? (
                                <Link
                                    to={`/admin/users/mentors/${mentor.id}`}
                                    style={{color: 'inherit', textDecoration: 'none'}}
                                >
                                    <UserCell user={mentor}/>
                                </Link>
                            ) : (
                                <div style={{color: 'var(--g-color-text-secondary)', fontSize: 14}}>
                                    {t('assignment.noMentorHint')}
                                </div>
                            )}
                            {/* Set the first time a mentor is assigned and kept on
                                every reassignment. */}
                            <Field label={t('assignment.start')}>{formatDate(assignment.start)}</Field>
                        </div>
                    </PageSection>
                </div>

                <PageSection title={t('assignment.schedule')} description={t('assignment.scheduleHint')}>
                    <AssignmentScheduleView schedule={assignment.schedule}/>
                </PageSection>

                <PageSection title={t('assignment.history')}>
                    <DataTable
                        rows={assignment.histories ?? []}
                        columns={historyColumns}
                        emptyTitle={t('assignment.noHistory')}
                    />
                </PageSection>
            </div>

            <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} size="s">
                <Dialog.Header caption={t(mentor ? 'assignment.reassign' : 'assignment.assign')}/>
                {pickerOpen && <AssignMentorFields assignment={assignment} onClose={() => setPickerOpen(false)}/>}
            </Dialog>
        </>
    );
}

export default AdminAssignmentDetail;
