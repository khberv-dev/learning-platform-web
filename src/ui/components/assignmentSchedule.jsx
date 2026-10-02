import {Label} from '@gravity-ui/uikit';
import {useI18n} from '@/shared/i18n/i18nContext.jsx';
import {assignmentSlots, weekdayKey} from '@/shared/utils/assignmentSchedule.js';

// Chips, one per lesson slot: "Dushanba 10:00". `short` abbreviates the day
// for table cells.
export function AssignmentScheduleView({schedule, short = false}) {
    const {t} = useI18n();
    const slots = assignmentSlots(schedule);

    if (!slots.length) return <span style={{color: 'var(--g-color-text-secondary)'}}>—</span>;

    return (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
            {slots.map(([day, time], index) => {
                const name = t(weekdayKey(day));
                return (
                    <Label key={`${day}-${time}-${index}`} size="xs" theme="normal">
                        {short ? name.slice(0, 3) : name} {time}
                    </Label>
                );
            })}
        </div>
    );
}
