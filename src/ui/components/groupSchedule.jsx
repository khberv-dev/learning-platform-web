import {Button, Label, TextInput} from '@gravity-ui/uikit';
import {Plus, X} from 'lucide-react';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {WEEK_DAYS} from '@/shared/utils/schedule.js';

// A group's schedule is free text per weekday (`18:00-19:30`), so it gets a
// row-per-entry editor rather than the mentor's 30-minute slot grid.
export function GroupScheduleEditor({value, onChange}) {
    const {t} = useI18n();

    const setDay = (day, entries) => onChange({...value, [day]: entries});

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            {WEEK_DAYS.map((day) => {
                const entries = value[day] ?? [];
                return (
                    <div key={day} style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
                        <div style={{width: 110, flexShrink: 0, paddingTop: 6, fontSize: 13, fontWeight: 600}}>
                            {t(`schedule.${day}`)}
                        </div>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center'}}>
                            {entries.map((entry, index) => (
                                // Index keys are safe here: rows have no identity
                                // beyond position and are edited in place.
                                <TextInput
                                    key={index}
                                    value={entry}
                                    onUpdate={(next) =>
                                        setDay(day, entries.map((item, i) => (i === index ? next : item)))
                                    }
                                    placeholder="18:00-19:30"
                                    style={{width: 190}}
                                    endContent={
                                        <Button
                                            view="flat-secondary"
                                            size="s"
                                            aria-label={t('common.delete')}
                                            onClick={() => setDay(day, entries.filter((_, i) => i !== index))}
                                        >
                                            <Button.Icon>
                                                <X size={14}/>
                                            </Button.Icon>
                                        </Button>
                                    }
                                />
                            ))}
                            <Button view="flat" size="m" onClick={() => setDay(day, [...entries, ''])}>
                                <Button.Icon>
                                    <Plus size={14}/>
                                </Button.Icon>
                                {t('group.addTime')}
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// The compact form for a list row: which weekdays have times set, as their
// translated labels, not a bare count - a name reads at a glance, a number
// doesn't say which days.
export function GroupScheduleDays({value}) {
    const {t} = useI18n();
    const days = WEEK_DAYS.filter((day) => (value?.[day] ?? []).length > 0);

    if (days.length === 0) return '—';

    return (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
            {days.map((day) => (
                <Label key={day} theme="info" size="xs">
                    {t(`schedule.${day}`)}
                </Label>
            ))}
        </div>
    );
}

export function GroupScheduleView({value}) {
    const {t} = useI18n();
    const days = WEEK_DAYS.filter((day) => (value?.[day] ?? []).length > 0);

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {days.map((day) => (
                <div key={day} style={{display: 'flex', gap: 12, alignItems: 'baseline'}}>
                    <div style={{width: 110, flexShrink: 0, fontSize: 13, fontWeight: 600}}>
                        {t(`schedule.${day}`)}
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                        {value[day].map((entry, index) => (
                            <Label key={index} theme="info">
                                {entry}
                            </Label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
