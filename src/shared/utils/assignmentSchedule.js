// An assignment's schedule is an array of objects, each mapping lowercase
// weekdays to one `HH:mm` time - `[{mon: '10:00', thu: '20:00'}, {sat: '09:30'}]`
// - so a weekday can appear in more than one object. A different shape from a
// group's `{Mon: [...]}` free text, so it gets its own helpers; the weekday
// names reuse the group schedule's `schedule.Mon`… strings.
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const weekdayKey = (day) => `schedule.${day.charAt(0).toUpperCase()}${day.slice(1)}`;

// Every (day, time) pair across all objects, Monday first, then by time.
export function assignmentSlots(schedule) {
    return (Array.isArray(schedule) ? schedule : [])
        .flatMap((slot) => Object.entries(slot ?? {}))
        .filter(([day]) => WEEKDAYS.includes(day))
        .sort(([dayA, timeA], [dayB, timeB]) =>
            dayA === dayB ? String(timeA).localeCompare(String(timeB)) : WEEKDAYS.indexOf(dayA) - WEEKDAYS.indexOf(dayB)
        );
}
