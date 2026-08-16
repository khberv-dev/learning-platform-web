import {useMemo, useState} from 'react';
import {Alert, Dialog, Select, TextInput} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useAcceptPendingEnrollment} from '@/services/enrollment/query.js';
import {usePlans} from '@/services/plan/query.js';
import {formatDate, formatMoney, fullName, toOptionalNumber} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import FormField from '@/ui/components/formField.jsx';

// The request fixes the student, the course and the term - the plan is the one
// thing it deliberately leaves open, because price and duration are only
// settled when the admin approves. Amount defaults to the plan's price.
//
// Mounted with a `key` on the request id so a freshly opened dialog starts
// empty instead of carrying the previous row's plan.
function AcceptPendingEnrollmentDialog({open, pending, onClose}) {
    const {t} = useI18n();
    const acceptPending = useAcceptPendingEnrollment();

    const [planId, setPlanId] = useState('');
    const [amount, setAmount] = useState('');

    const courseId = pending?.course?.id;
    const plans = usePlans(courseId);
    const planOptions = useMemo(() => plans.data ?? [], [plans.data]);

    const selectedPlan = useMemo(
        () => planOptions.find((plan) => plan.id === planId),
        [planOptions, planId]
    );

    const submit = () => {
        if (!planId) {
            toaster.add({name: 'pending-invalid', theme: 'danger', title: t('pendingEnrollment.planRequired')});
            return;
        }

        acceptPending.mutate(
            {id: pending.id, planId, amount: toOptionalNumber(amount)},
            {
                onSuccess: () => {
                    toaster.add({
                        name: 'pending-accepted',
                        theme: 'success',
                        title: t('pendingEnrollment.accepted'),
                    });
                    onClose();
                },
                onError: (error) =>
                    toaster.add({
                        name: 'pending-accept-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    }),
            }
        );
    };

    return (
        <Dialog open={open} onClose={onClose} size="m">
            <Dialog.Header caption={t('pendingEnrollment.acceptTitle')}/>
            <Dialog.Body>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <Alert theme="info" message={t('pendingEnrollment.acceptNote')}/>

                    <FormField label={t('pendingEnrollment.student')}>
                        <TextInput size="l" value={fullName(pending?.user)} disabled/>
                    </FormField>

                    <FormField label={t('pendingEnrollment.course')}>
                        <TextInput size="l" value={pending?.course?.title ?? ''} disabled/>
                    </FormField>

                    {/* Read-only: the term came with the request, and the API
                        takes only a plan and an amount here. */}
                    <FormField label={t('pendingEnrollment.term')} hint={t('pendingEnrollment.termHint')}>
                        <TextInput
                            size="l"
                            value={`${formatDate(pending?.start)} — ${formatDate(pending?.end)}`}
                            disabled
                        />
                    </FormField>

                    <FormField
                        label={t('pendingEnrollment.plan')}
                        required
                        hint={selectedPlan ? `${formatMoney(selectedPlan.price)} · ${selectedPlan.month}` : undefined}
                    >
                        <Select
                            size="l"
                            width="max"
                            value={planId ? [planId] : []}
                            onUpdate={([value]) => setPlanId(value)}
                            loading={plans.isFetching}
                        >
                            {planOptions.map((plan) => (
                                <Select.Option key={plan.id} value={plan.id}>
                                    {`${plan.title} — ${formatMoney(plan.price)} / ${plan.month}`}
                                </Select.Option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label={t('pendingEnrollment.amount')} hint={t('pendingEnrollment.amountHint')}>
                        <TextInput size="l" type="number" value={amount} onUpdate={setAmount}/>
                    </FormField>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                textButtonCancel={t('common.cancel')}
                onClickButtonApply={submit}
                textButtonApply={t('pendingEnrollment.accept')}
                propsButtonApply={{loading: acceptPending.isPending}}
            />
        </Dialog>
    );
}

export default AcceptPendingEnrollmentDialog;
