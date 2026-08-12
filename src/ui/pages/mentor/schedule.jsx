import {useState} from 'react';
import {Alert, Button} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {useMySchedule, useSetMySchedule} from '@/services/mentor/query.js';
import {toaster} from '@/shared/toaster.js';
import {extractApiErrorMessage} from '@/shared/utils/apiError.js';
import PageHeader from '@/ui/components/pageHeader.jsx';
import PageSection from '@/ui/components/pageSection.jsx';
import {ErrorState, LoadingState} from '@/ui/components/stateViews.jsx';

// The API accepts exactly these day keys and only HH:00 / HH:30 times.
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SLOTS = Array.from({length: 48}, (_, index) => {
    const hour = String(Math.floor(index / 2)).padStart(2, '0');
    const minute = index % 2 === 0 ? '00' : '30';
    return `${hour}:${minute}`;
});

// Working hours only - a full 24-hour grid is unusable and mentors never book
// overnight slots.
const VISIBLE_SLOTS = SLOTS.filter((slot) => {
    const hour = Number(slot.slice(0, 2));
    return hour >= 7 && hour <= 22;
});

function ScheduleGrid({initialSchedule}) {
    const {t} = useI18n();
    const setSchedule = useSetMySchedule();
    const [draft, setDraft] = useState(initialSchedule);

    const toggle = (day, slot) => {
        setDraft((current) => {
            const slots = current[day] ?? [];
            const next = slots.includes(slot)
                ? slots.filter((item) => item !== slot)
                : [...slots, slot].sort();
            // Drop the key entirely when a day empties - the API validates the
            // shape of every key it receives.
            const updated = {...current, [day]: next};
            if (next.length === 0) delete updated[day];
            return updated;
        });
    };

    const save = () => {
        setSchedule.mutate(draft, {
            onSuccess: () =>
                toaster.add({name: 'schedule-saved', theme: 'success', title: t('schedule.saved')}),
            onError: (error) =>
                toaster.add({
                    name: 'schedule-failed',
                    theme: 'danger',
                    title: extractApiErrorMessage(error, t('common.error')),
                }),
        });
    };

    const totalSlots = Object.values(draft).reduce((sum, slots) => sum + slots.length, 0);

    return (
        <>
            <PageHeader
                title={t('schedule.title')}
                description={`${t('common.total')}: ${totalSlots}`}
                actions={
                    <Button view="action" onClick={save} loading={setSchedule.isPending}>
                        {t('common.save')}
                    </Button>
                }
            />

            <Alert theme="info" message={t('schedule.note')} style={{marginBottom: 16}}/>

            <PageSection>
                <div style={{overflowX: 'auto'}}>
                    <div style={{display: 'flex', gap: 12, minWidth: 720}}>
                        {DAYS.map((day) => (
                            <div key={day} style={{flex: 1, minWidth: 92}}>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        marginBottom: 8,
                                        paddingBottom: 8,
                                        borderBottom: '1px solid var(--g-color-line-generic)',
                                    }}
                                >
                                    {t(`schedule.${day}`)}
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                                    {VISIBLE_SLOTS.map((slot) => {
                                        const selected = (draft[day] ?? []).includes(slot);
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => toggle(day, slot)}
                                                style={{
                                                    padding: '4px 0',
                                                    fontSize: 12,
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    border: '1px solid',
                                                    borderColor: selected
                                                        ? 'var(--g-color-base-brand)'
                                                        : 'var(--g-color-line-generic)',
                                                    background: selected
                                                        ? 'var(--g-color-base-brand)'
                                                        : 'transparent',
                                                    color: selected
                                                        ? 'var(--g-color-text-light-primary)'
                                                        : 'var(--g-color-text-primary)',
                                                }}
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PageSection>
        </>
    );
}

// The grid seeds its draft from the loaded schedule and remounts when that
// changes, rather than syncing server state into a draft inside an effect.
function MentorSchedule() {
    const query = useMySchedule();

    if (query.isPending) return <LoadingState rows={8}/>;
    if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch}/>;

    return <ScheduleGrid initialSchedule={query.data ?? {}}/>;
}

export default MentorSchedule;
