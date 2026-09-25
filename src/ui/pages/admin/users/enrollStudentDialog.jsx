import {useMemo, useState} from 'react';
import {Alert, Dialog, Select, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useCreateEnrollment} from '@/services/enrollment/query.js';
import {useCourses} from '@/services/course/query.js';
import {usePlans} from '@/services/plan/query.js';
import {formatMoney} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import FormField from '@/ui/components/formField.jsx';

// Manual, payment-free enrollment - the admin path for cash and bank-transfer
// sales, since admins cannot approve payments. The student is fixed by the
// page this opens from, so there is no student picker here.
function EnrollStudentDialog({open, studentId, studentName, onClose}) {
    const {t} = useI18n();
    const createEnrollment = useCreateEnrollment();

    const [courseId, setCourseId] = useState('');
    const [planId, setPlanId] = useState('');
    const [start, setStart] = useState('');

    const courses = useCourses();
    const plans = usePlans(courseId);

    const courseOptions = courses.data?.data ?? [];
    const planOptions = useMemo(() => plans.data?.data ?? [], [plans.data]);

    const selectedPlan = useMemo(
        () => planOptions.find((plan) => plan.id === planId),
        [planOptions, planId]
    );

    const reset = () => {
        setCourseId('');
        setPlanId('');
        setStart('');
    };

    const submit = () => {
        if (!courseId || !planId) {
            toaster.add({name: 'enrollment-invalid', theme: 'danger', title: t('enrollment.planRequired')});
            return;
        }

        const payload = {studentId, courseId, planId};
        if (start) payload.start = new Date(start).toISOString();

        createEnrollment.mutate(payload, {
            onSuccess: () => {
                toaster.add({name: 'enrollment-created', theme: 'success', title: t('enrollment.created')});
                reset();
                onClose();
            },
            onError: (error) =>
                toaster.add({
                    name: 'enrollment-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} size="m">
            <Dialog.Header caption={t('enrollment.create')}/>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <Alert theme="info" message={t('enrollment.note')}/>

                    <FormField label={t('enrollment.student')}>
                        <TextInput size="l" value={studentName} disabled/>
                    </FormField>

                    <FormField label={t('enrollment.course')} required>
                        <Select
                            size="l"
                            width="max"
                            filterable
                            value={courseId ? [courseId] : []}
                            onUpdate={([value]) => {
                                setCourseId(value);
                                // Plans belong to a course - one picked for the
                                // previous course can't carry over.
                                setPlanId('');
                            }}
                            loading={courses.isPending}
                        >
                            {courseOptions.map((course) => (
                                <Select.Option key={course.id} value={course.id}>
                                    {course.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField
                        label={t('enrollment.plan')}
                        required
                        hint={selectedPlan ? `${formatMoney(selectedPlan.price)} · ${selectedPlan.month}` : undefined}
                    >
                        <Select
                            size="l"
                            width="max"
                            value={planId ? [planId] : []}
                            onUpdate={([value]) => setPlanId(value)}
                            disabled={!courseId}
                            loading={plans.isFetching}
                        >
                            {planOptions.map((plan) => (
                                <Select.Option key={plan.id} value={plan.id}>
                                    {`${plan.title} — ${formatMoney(plan.price)} / ${plan.month}`}
                                </Select.Option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label={t('enrollment.start')} hint={t('common.optional')}>
                        <TextInput size="l" type="date" value={start} onUpdate={setStart}/>
                    </FormField>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                textButtonCancel={t('common.cancel')}
                onClickButtonApply={submit}
                textButtonApply={t('common.save')}
                propsButtonApply={{loading: createEnrollment.isPending}}
            />
        </Dialog>
    );
}

export default EnrollStudentDialog;
