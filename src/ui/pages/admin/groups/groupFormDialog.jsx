import {useState} from 'react';
import {Dialog, Select, Switch, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCreateGroup, useSetGroupActive, useUpdateGroup} from '@/services/group/query.js';
import {useCourses} from '@/services/course/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import FormField from '@/ui/components/formField.jsx';
import {GroupScheduleEditor} from '@/ui/components/groupSchedule.jsx';
import {cleanFreeSchedule, countSlots} from '@/shared/utils/schedule.js';

// Mounted only while the dialog is open, so it seeds its draft from `group`
// (undefined when creating) without syncing props into state in an effect.
function GroupFormFields({group, onClose, onSaved}) {
    const {t} = useI18n();
    const createGroup = useCreateGroup();
    const updateGroup = useUpdateGroup();
    // Active/inactive has no place in CreateGroupDto/UpdateGroupDto - the API
    // sets it through its own activate/deactivate routes, so the switch below
    // fires a second mutation rather than riding along on this one.
    const setActive = useSetGroupActive();
    const isEdit = Boolean(group);
    const mutation = isEdit ? updateGroup : createGroup;

    const courses = useCourses();

    const [title, setTitle] = useState(group?.title ?? '');
    // Required on create. Groups that predate courses come back with
    // `course: null`, so on edit it starts empty until one is picked.
    const [courseId, setCourseId] = useState(group?.course?.id ?? '');
    const [schedule, setSchedule] = useState(group?.schedule ?? {});
    const [isActive, setIsActive] = useState(group?.isActive ?? true);
    const [errors, setErrors] = useState({});

    const submit = () => {
        const next = {};
        if (!title.trim()) next.title = t('common.error');
        if (!courseId) next.courseId = t('common.error');
        setErrors(next);
        if (Object.keys(next).length) return;

        // Schedule is edited separately, on the group page's own card - this
        // dialog only sets it up front when creating, and never touches it on
        // an edit.
        const payload = {title: title.trim()};
        // Sent on edit only when it actually changed: moving a group to another
        // course re-checks every member against that course's other groups, so
        // an untouched course shouldn't trigger the check (or its 400).
        if (!isEdit || courseId !== group.course?.id) payload.courseId = courseId;
        if (!isEdit) {
            const cleaned = cleanFreeSchedule(schedule);
            if (countSlots(cleaned) > 0) payload.schedule = cleaned;
        }

        const finish = (data) => {
            toaster.add({
                name: 'group-saved',
                theme: 'success',
                title: t(isEdit ? 'group.updated' : 'group.created'),
            });
            onSaved?.(data);
            onClose();
        };

        mutation.mutate(isEdit ? {id: group.id, ...payload} : payload, {
            onSuccess: (data) => {
                if (isEdit && isActive !== group.isActive) {
                    setActive.mutate(
                        {id: group.id, isActive},
                        {
                            onSuccess: (activeData) => finish(activeData),
                            onError: (err) =>
                                toaster.add({
                                    name: 'group-active-failed',
                                    theme: 'danger',
                                    title: extractApiErrorMessage(err, t('common.error')),
                                }),
                        }
                    );
                } else {
                    finish(data);
                }
            },
            onError: (err) =>
                toaster.add({
                    name: 'group-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(err, t('common.error')),
                }),
        });
    };

    return (
        <>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <FormField label={t('group.name')} required error={errors.title}>
                        <TextInput size="l" value={title} onUpdate={setTitle} autoFocus/>
                    </FormField>
                    <FormField
                        label={t('group.course')}
                        required
                        error={errors.courseId}
                        hint={isEdit ? t('group.courseChangeHint') : undefined}
                    >
                        <Select
                            size="l"
                            width="max"
                            filterable
                            placeholder={t('group.pickCourse')}
                            value={courseId ? [courseId] : []}
                            onUpdate={([value]) => setCourseId(value ?? '')}
                            loading={courses.isPending}
                        >
                            {(courses.data?.data ?? []).map((course) => (
                                <Select.Option key={course.id} value={course.id}>
                                    {course.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </FormField>
                    {isEdit && (
                        <FormField label={t('common.status')}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                <Switch checked={isActive} onUpdate={setIsActive}/>
                                <span style={{fontSize: 14}}>
                                    {t(isActive ? 'common.active' : 'common.inactive')}
                                </span>
                            </div>
                        </FormField>
                    )}
                    {!isEdit && (
                        <FormField label={t('group.schedule')} hint={t('group.scheduleHint')}>
                            <GroupScheduleEditor value={schedule} onChange={setSchedule}/>
                        </FormField>
                    )}
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={submit}
                textButtonCancel={t('common.cancel')}
                textButtonApply={t('common.save')}
                loading={mutation.isPending || setActive.isPending}
            />
        </>
    );
}

function GroupFormDialog({open, group, onClose, onSaved}) {
    const {t} = useI18n();

    return (
        <Dialog open={open} onClose={onClose} size="l">
            <Dialog.Header caption={t(group ? 'group.edit' : 'group.create')}/>
            {open && <GroupFormFields group={group} onClose={onClose} onSaved={onSaved}/>}
        </Dialog>
    );
}

export default GroupFormDialog;
