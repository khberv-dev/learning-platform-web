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
    const [end, setEnd] = useState('');
    const [purchaseAmount, setPurchaseAmount] = useState('');

    const courses = useCourses();
    const plans = usePlans(courseId);

    const courseOptions = courses.data ?? [];
    const planOptions = useMemo(() => plans.data ?? [], [plans.data]);

    // With a plan the API derives course, duration and price; without one it
    // needs an explicit end date, since there's nothing to compute a term from.
    const endRequired = !planId;

    const selectedPlan = useMemo(
        () => planOptions.find((plan) => plan.id === planId),
        [planOptions, planId]
    );

    const reset = () => {
        setCourseId('');
        setPlanId('');
        setStart('');
        setEnd('');
        setPurchaseAmount('');
    };

    const submit = () => {
        if (!courseId || (endRequired && !end)) {
            toaster.add({name: 'enrollment-invalid', theme: 'danger', title: t('common.error')});
            return;
        }

        const payload = {studentId};
        if (planId) {
            payload.planId = planId;
        } else {
            payload.courseId = courseId;
        }
        if (start) payload.start = new Date(start).toISOString();
        if (end) payload.end = new Date(end).toISOString();
        if (purchaseAmount !== '') payload.purchaseAmount = Number(purchaseAmount);

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
                        hint={
                            selectedPlan
                                ? `${formatMoney(selectedPlan.price)} · ${selectedPlan.month}`
                                : t('enrollment.planOrCourse')
                        }
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

                    <FormField label={t('enrollment.end')} required={endRequired}>
                        <TextInput size="l" type="date" value={end} onUpdate={setEnd}/>
                    </FormField>

                    <FormField label={t('enrollment.purchaseAmount')} hint={t('common.optional')}>
                        <TextInput
                            size="l"
                            type="number"
                            value={purchaseAmount}
                            onUpdate={setPurchaseAmount}
                        />
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
