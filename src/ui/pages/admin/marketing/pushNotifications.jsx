import {useMemo, useState} from 'react';
import {Alert, Button, Label, Select, TextArea, TextInput} from '@gravity-ui/uikit';
import {BellRing, Send, Smartphone, TriangleAlert, Trash2} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {MAX_PUSH_PHONE_NUMBERS, PUSH_AUDIENCE, useSendPush} from '@/services/notification/query.js';
import {formatPhone} from '@/shared/utils/format.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import FormField from '@/ui/components/formField.jsx';
import ConfirmDialog from '@/ui/components/confirmDialog.jsx';
import StatCard from '@/ui/components/statCard.jsx';

// The DTO's own limits - enforced here too so an over-long message fails in the
// field rather than as a 400.
const MAX_TITLE = 100;
const MAX_BODY = 1000;
const PHONE_PATTERN = /^998\d{9}$/;

// Numbers are usually pasted in from somewhere else, so the box takes them one
// per line or separated by commas; each entry is then stripped down to digits,
// which is how they are stored (998XXXXXXXXX).
function parsePhoneNumbers(raw) {
    const parsed = raw
        .split(/[\n,;]+/)
        .map((part) => part.replace(/\D/g, ''))
        .filter(Boolean);

    return [...new Set(parsed)];
}

function ReportPhoneList({title, phoneNumbers, theme}) {
    if (!phoneNumbers?.length) return null;

    return (
        <div>
            <div style={{fontSize: 13, fontWeight: 500, marginBottom: 6}}>
                {title} ({phoneNumbers.length})
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                {phoneNumbers.map((phoneNumber) => (
                    <Label key={phoneNumber} theme={theme}>
                        {formatPhone(phoneNumber)}
                    </Label>
                ))}
            </div>
        </div>
    );
}

// The only place a message is sent by hand. Everything else the app pushes is
// event-driven and lives in the API.
function AdminPushNotifications() {
    const {t} = useI18n();
    const sendPush = useSendPush();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState(PUSH_AUDIENCE.PHONES);
    const [phonesRaw, setPhonesRaw] = useState('');
    const [errors, setErrors] = useState({});
    const [confirming, setConfirming] = useState(false);
    // Kept until the next send so the admin can read the report after the
    // toast is gone.
    const [report, setReport] = useState(null);

    const toPhones = audience === PUSH_AUDIENCE.PHONES;

    const {valid, invalid} = useMemo(() => {
        const parsed = parsePhoneNumbers(phonesRaw);
        return {
            valid: parsed.filter((phoneNumber) => PHONE_PATTERN.test(phoneNumber)),
            invalid: parsed.filter((phoneNumber) => !PHONE_PATTERN.test(phoneNumber)),
        };
    }, [phonesRaw]);

    const validate = () => {
        const next = {};
        if (!title.trim()) next.title = t('push.titleRequired');
        if (!body.trim()) next.body = t('push.bodyRequired');
        if (toPhones) {
            if (invalid.length > 0) next.phones = t('push.invalidPhones');
            else if (valid.length === 0) next.phones = t('push.phonesRequired');
            else if (valid.length > MAX_PUSH_PHONE_NUMBERS) next.phones = t('push.tooManyPhones');
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // A push cannot be recalled, and three of the four audiences are a mass
    // send - so the recipients are named back to the admin before it goes.
    const requestSend = () => {
        if (!validate()) return;
        setConfirming(true);
    };

    const send = () => {
        sendPush.mutate(
            {
                title: title.trim(),
                body: body.trim(),
                audience,
                phoneNumbers: toPhones ? valid : undefined,
            },
            {
                onSuccess: (result) => {
                    setReport(result);
                    setConfirming(false);
                    toaster.add({
                        name: 'push-sent',
                        theme: 'success',
                        title: t('push.sent'),
                        content: t('push.sentTo', {count: result?.sent ?? 0}),
                    });
                },
                onError: (error) => {
                    setConfirming(false);
                    // 503 means GOOGLE_SERVICES_JSON is missing on the server;
                    // its message says so, so it is shown as-is.
                    toaster.add({
                        name: 'push-failed',
                        theme: 'danger',
                        title: extractApiErrorMessage(error, t('common.error')),
                    });
                },
            }
        );
    };

    const clear = () => {
        setTitle('');
        setBody('');
        setPhonesRaw('');
        setErrors({});
        setReport(null);
    };

    const audienceLabel = t(`push.audience${audience.charAt(0).toUpperCase()}${audience.slice(1)}`);

    return (
        <>
            <PageHeader title={t('push.title')} description={t('push.note')}/>

            <div style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720}}>
                <PageSection title={t('push.compose')}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <FormField
                            label={t('push.messageTitle')}
                            required
                            error={errors.title}
                            hint={`${title.length}/${MAX_TITLE}`}
                        >
                            <TextInput
                                size="l"
                                value={title}
                                onUpdate={setTitle}
                                maxLength={MAX_TITLE}
                                validationState={errors.title ? 'invalid' : undefined}
                            />
                        </FormField>

                        <FormField
                            label={t('push.messageBody')}
                            required
                            error={errors.body}
                            hint={`${body.length}/${MAX_BODY}`}
                        >
                            <TextArea
                                size="l"
                                minRows={4}
                                value={body}
                                onUpdate={setBody}
                                maxLength={MAX_BODY}
                                validationState={errors.body ? 'invalid' : undefined}
                            />
                        </FormField>

                        <FormField label={t('push.audience')} required hint={t('push.audienceHint')}>
                            <Select
                                size="l"
                                width="max"
                                value={[audience]}
                                onUpdate={([value]) => setAudience(value)}
                            >
                                <Select.Option value={PUSH_AUDIENCE.PHONES}>
                                    {t('push.audiencePhones')}
                                </Select.Option>
                                <Select.Option value={PUSH_AUDIENCE.STUDENTS}>
                                    {t('push.audienceStudents')}
                                </Select.Option>
                                <Select.Option value={PUSH_AUDIENCE.TEACHERS}>
                                    {t('push.audienceTeachers')}
                                </Select.Option>
                                <Select.Option value={PUSH_AUDIENCE.ALL}>
                                    {t('push.audienceAll')}
                                </Select.Option>
                            </Select>
                        </FormField>

                        {toPhones ? (
                            <FormField
                                label={t('push.phoneNumbers')}
                                required
                                error={errors.phones}
                                hint={t('push.phoneNumbersHint')}
                            >
                                <TextArea
                                    size="l"
                                    minRows={3}
                                    value={phonesRaw}
                                    onUpdate={setPhonesRaw}
                                    placeholder="998900012644"
                                    validationState={errors.phones ? 'invalid' : undefined}
                                />
                            </FormField>
                        ) : (
                            // Nothing here narrows a mass send, so the warning
                            // is the only thing standing between a typo and
                            // every device the app is installed on.
                            <Alert theme="warning" message={t('push.massWarning')}/>
                        )}

                        {toPhones && (valid.length > 0 || invalid.length > 0) && (
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center'}}>
                                <Label theme="info">{t('push.recipients', {count: valid.length})}</Label>
                                {invalid.map((phoneNumber) => (
                                    <Label key={phoneNumber} theme="danger" icon={<TriangleAlert size={13}/>}>
                                        {phoneNumber}
                                    </Label>
                                ))}
                            </div>
                        )}

                        <div style={{display: 'flex', gap: 8}}>
                            <Button
                                view="action"
                                size="l"
                                onClick={requestSend}
                                loading={sendPush.isPending}
                            >
                                <Button.Icon>
                                    <Send size={16}/>
                                </Button.Icon>
                                {t('push.send')}
                            </Button>
                            <Button view="flat" size="l" onClick={clear} disabled={sendPush.isPending}>
                                <Button.Icon>
                                    <Trash2 size={16}/>
                                </Button.Icon>
                                {t('push.clear')}
                            </Button>
                        </div>
                    </div>
                </PageSection>

                {report && (
                    <PageSection title={t('push.report')} description={t('push.reportNote')}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: 12,
                                }}
                            >
                                <StatCard label={t('push.devices')} value={report.devices} icon={Smartphone}/>
                                <StatCard label={t('push.delivered')} value={report.sent} icon={BellRing}/>
                                <StatCard label={t('push.failed')} value={report.failed}/>
                                <StatCard label={t('push.removedTokens')} value={report.removedTokens}/>
                            </div>

                            {/* Only a `phones` send reports misses, and the two
                                kinds mean different things: a wrong number, or
                                a user who never opened the app. */}
                            <ReportPhoneList
                                title={t('push.notFound')}
                                phoneNumbers={report.notFound}
                                theme="danger"
                            />
                            <ReportPhoneList
                                title={t('push.withoutDevice')}
                                phoneNumbers={report.withoutDevice}
                                theme="warning"
                            />
                        </div>
                    </PageSection>
                )}
            </div>

            <ConfirmDialog
                open={confirming}
                title={t('push.send')}
                message={
                    toPhones
                        ? t('push.confirmPhones', {count: valid.length})
                        : t('push.confirmMass', {audience: audienceLabel})
                }
                confirmText={t('push.send')}
                danger={false}
                loading={sendPush.isPending}
                onConfirm={send}
                onClose={() => setConfirming(false)}
            />
        </>
    );
}

export default AdminPushNotifications;
