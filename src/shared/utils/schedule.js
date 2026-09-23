// A group's weekly schedule is `{Mon: ['18:00-19:30', ...], ...}` - the only
// schedule left in the app since mentors no longer have their own.

export function countSlots(schedule) {
    return Object.values(schedule ?? {}).reduce((sum, slots) => sum + slots.length, 0);
}

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// The time values are free text set by the admin (`18:00-19:30`, `20:00 -
// special session`), not HH:MM slots. The server rejects blank entries, so
// drafts - which may hold empty rows while typing - are trimmed and emptied
// days dropped before saving.
export function cleanFreeSchedule(schedule) {
    const cleaned = {};
    WEEK_DAYS.forEach((day) => {
        const entries = (schedule?.[day] ?? []).map((entry) => entry.trim()).filter(Boolean);
        if (entries.length > 0) cleaned[day] = entries;
    });
    return cleaned;
}
