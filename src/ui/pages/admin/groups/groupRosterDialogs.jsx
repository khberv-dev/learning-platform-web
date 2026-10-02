import {useMemo, useState} from 'react';
import {Dialog, Select} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {
    GROUP_MENTOR_ROLE,
    useAddGroupStudents,
    useAssignPrimaryMentor,
    useGroups,
    useSwapGroupStudent,
} from '@/services/group/query.js';
import {MENTOR_STATUS, useMentors} from '@/services/mentor/query.js';
import {useStudents} from '@/services/student/query.js';
import {useDebouncedValue} from '@/shared/hooks/useDebouncedValue.js';
import {formatPhone, fullName} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import FormField from '@/ui/components/formField.jsx';
import RemoteSelect from '@/ui/components/remoteSelect.jsx';

function notify(t, name, error) {
    toaster.add({
        name,
        theme: error ? 'danger' : 'success',
        title: error ? extractApiErrorMessage(error, t('common.error')) : t('common.saved'),
    });
}

// A group has one mentor, and the API only accepts a mentor whose own profile
// `role` is `primary` - so the picker offers only those (and only working,
// sign-in-enabled ones), hiding the group's current mentor. Picking replaces
// whoever holds it.
function MentorFields({groupId, currentMentorId, onClose}) {
    const {t} = useI18n();
    const assignPrimary = useAssignPrimaryMentor();

    const [search, setSearch] = useState('');
    const [picked, setPicked] = useState([]);
    const debounced = useDebouncedValue(search, 300);
    const mentors = useMentors({
        page: 1,
        limit: 20,
        search: debounced,
        status: MENTOR_STATUS.WORKING,
        isActive: true,
        role: GROUP_MENTOR_ROLE.PRIMARY,
    });

    const items = useMemo(
        () => (mentors.data?.data ?? []).filter((mentor) => mentor.id !== currentMentorId),
        [mentors.data, currentMentorId]
    );

    const submit = () => {
        if (picked.length === 0) return;
        assignPrimary.mutate(
            {id: groupId, mentorId: picked[0]},
            {
                onSuccess: () => {
                    notify(t, 'group-mentor');
                    onClose();
                },
                onError: (error) => notify(t, 'group-mentor-failed', error),
            }
        );
    };

    return (
        <>
            <Dialog.Body>
                <RemoteSelect
                    label={t('group.mentor')}
                    hint={t('group.primaryHint')}
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
                loading={assignPrimary.isPending}
            />
        </>
    );
}

export function MentorPickerDialog({open, groupId, currentMentorId, onClose}) {
    const {t} = useI18n();

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={t(currentMentorId ? 'group.changeMentor' : 'group.assignMentor')}/>
            {open && <MentorFields groupId={groupId} currentMentorId={currentMentorId} onClose={onClose}/>}
        </Dialog>
    );
}

function studentLabel(student) {
    return [fullName(student), student.phoneNumber ? formatPhone(student.phoneNumber) : student.email]
        .filter(Boolean)
        .join(' · ');
}

function StudentFields({groupId, excludeIds, onClose}) {
    const {t} = useI18n();
    const addStudents = useAddGroupStudents();

    const [search, setSearch] = useState('');
    const [picked, setPicked] = useState([]);
    const debounced = useDebouncedValue(search, 300);
    const students = useStudents({page: 1, limit: 20, search: debounced, isActive: true});

    const items = useMemo(
        () => (students.data?.data ?? []).filter((student) => !excludeIds.includes(student.id)),
        [students.data, excludeIds]
    );

    const submit = () => {
        if (picked.length === 0) return;
        addStudents.mutate(
            {id: groupId, studentIds: picked},
            {
                onSuccess: () => {
                    notify(t, 'group-students');
                    onClose();
                },
                onError: (error) => notify(t, 'group-students-failed', error),
            }
        );
    };

    return (
        <>
            <Dialog.Body>
                <RemoteSelect
                    label={t('group.students')}
                    hint={t('group.addStudentsHint')}
                    multiple
                    items={items}
                    picked={picked}
                    onPick={setPicked}
                    onSearch={setSearch}
                    loading={students.isFetching}
                    getLabel={studentLabel}
                />
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={submit}
                textButtonCancel={t('common.cancel')}
                textButtonApply={t('common.save')}
                propsButtonApply={{disabled: picked.length === 0}}
                loading={addStudents.isPending}
            />
        </>
    );
}

export function AddStudentsDialog({open, groupId, excludeIds, onClose}) {
    const {t} = useI18n();

    return (
        <Dialog open={open} onClose={onClose} size="m">
            <Dialog.Header caption={t('group.addStudents')}/>
            {open && <StudentFields groupId={groupId} excludeIds={excludeIds} onClose={onClose}/>}
        </Dialog>
    );
}

function SwapFields({groupId, student, onClose, onMoved}) {
    const {t} = useI18n();
    const swap = useSwapGroupStudent();
    const groups = useGroups({page: 1, limit: 100, isActive: true, sortBy: 'title', sortOrder: 'ASC'});
    const [toGroupId, setToGroupId] = useState('');

    const targets = (groups.data?.data ?? []).filter((group) => group.id !== groupId);

    const submit = () => {
        if (!toGroupId) return;
        swap.mutate(
            {id: groupId, studentId: student.id, toGroupId},
            {
                onSuccess: () => {
                    notify(t, 'group-swap');
                    onClose();
                    onMoved?.(toGroupId);
                },
                onError: (error) => notify(t, 'group-swap-failed', error),
            }
        );
    };

    return (
        <>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)'}}>
                        {t('group.swapFor', {name: fullName(student)})}
                    </div>
                    <FormField label={t('group.targetGroup')} required>
                        <Select
                            size="l"
                            width="max"
                            filterable
                            value={toGroupId ? [toGroupId] : []}
                            onUpdate={([value]) => setToGroupId(value)}
                            loading={groups.isPending}
                        >
                            {targets.map((group) => (
                                // Titles can repeat across courses, and the
                                // course decides where the student ends up.
                                <Select.Option key={group.id} value={group.id}>
                                    {[group.title, group.course?.title].filter(Boolean).join(' · ')}
                                </Select.Option>
                            ))}
                        </Select>
                    </FormField>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={submit}
                textButtonCancel={t('common.cancel')}
                textButtonApply={t('group.swap')}
                propsButtonApply={{disabled: !toGroupId}}
                loading={swap.isPending}
            />
        </>
    );
}

// Moving a student is a swap, not remove-then-add: the server closes the old
// membership and opens the new one in a single transaction. The target may be
// in another course; it 400s if the student already has an active group there.
export function SwapStudentDialog({open, groupId, student, onClose, onMoved}) {
    const {t} = useI18n();

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={t('group.swapStudent')}/>
            {open && student && (
                <SwapFields groupId={groupId} student={student} onClose={onClose} onMoved={onMoved}/>
            )}
        </Dialog>
    );
}
