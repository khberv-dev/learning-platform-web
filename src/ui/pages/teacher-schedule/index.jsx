import {useEffect, useState} from 'react'
import {useHeader} from '@/providers/header.jsx'
import {useGetMySchedule, useSetMySchedule} from '@/services/teacher/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_LABELS = {Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday'}

// Generate HH:00 and HH:30 slots from 07:00 to 21:30
const SLOTS = []
for (let h = 7; h <= 21; h++) {
    SLOTS.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 21) SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}
SLOTS.push('21:00')
// dedupe
const ALL_SLOTS = [...new Set(SLOTS)]

function scheduleToSet(schedule) {
    const set = new Set()
    for (const [day, slots] of Object.entries(schedule ?? {})) {
        for (const slot of slots) set.add(`${day}:${slot}`)
    }
    return set
}

function setToSchedule(set) {
    const out = {}
    for (const key of set) {
        const [day, slot] = key.split(/:(.+)/)
        if (!out[day]) out[day] = []
        out[day].push(slot)
    }
    // Sort slots within each day
    for (const day of Object.keys(out)) out[day].sort()
    return out
}

export function TeacherSchedulePage() {
    const {setHeader} = useHeader()
    const {data: savedSchedule, isLoading} = useGetMySchedule()
    const save = useSetMySchedule()

    const [selected, setSelected] = useState(new Set())
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        setHeader({title: 'My Schedule'})
        return () => setHeader({})
    }, [setHeader])

    useEffect(() => {
        if (savedSchedule) {
            queueMicrotask(() => {
                setSelected(scheduleToSet(savedSchedule))
                setDirty(false)
            })
        }
    }, [savedSchedule])

    const toggle = (day, slot) => {
        const key = `${day}:${slot}`
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
        setDirty(true)
    }

    const toggleDay = (day) => {
        const daySlots = ALL_SLOTS.map(s => `${day}:${s}`)
        const allOn = daySlots.every(k => selected.has(k))
        setSelected(prev => {
            const next = new Set(prev)
            if (allOn) daySlots.forEach(k => next.delete(k))
            else daySlots.forEach(k => next.add(k))
            return next
        })
        setDirty(true)
    }

    const toggleSlot = (slot) => {
        const rowKeys = DAYS.map(d => `${d}:${slot}`)
        const allOn = rowKeys.every(k => selected.has(k))
        setSelected(prev => {
            const next = new Set(prev)
            if (allOn) rowKeys.forEach(k => next.delete(k))
            else rowKeys.forEach(k => next.add(k))
            return next
        })
        setDirty(true)
    }

    const handleSave = () => {
        save.mutate(setToSchedule(selected), {
            onSuccess: () => setDirty(false),
        })
    }

    const totalSlots = selected.size

    if (isLoading) {
        return <Card padding={40} style={{textAlign: 'center', color: 'var(--it-text-tertiary)'}}>Loading schedule…</Card>
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <Card padding={20} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12}}>
                <div>
                    <div style={{fontWeight: 700, fontSize: 15}}>Weekly Availability</div>
                    <div style={{fontSize: 13, color: 'var(--it-text-tertiary)', marginTop: 2}}>
                        {totalSlots} slot{totalSlots !== 1 ? 's' : ''} selected · click cells to toggle · click day or time to toggle all
                    </div>
                </div>
                <div style={{display: 'flex', gap: 8}}>
                    {dirty && (
                        <Button
                            variant="secondary"
                            onClick={() => { setSelected(scheduleToSet(savedSchedule)); setDirty(false) }}
                        >
                            Discard
                        </Button>
                    )}
                    <Button
                        leftIcon="save"
                        disabled={!dirty || save.isPending}
                        onClick={handleSave}
                    >
                        {save.isPending ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </Card>

            <Card padding={0} style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', minWidth: 640}}>
                    <thead>
                        <tr>
                            <th style={{width: 64, padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--it-text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--it-border)'}}>
                                Time
                            </th>
                            {DAYS.map(day => {
                                const daySlots = ALL_SLOTS.map(s => `${day}:${s}`)
                                const count = daySlots.filter(k => selected.has(k)).length
                                const allOn = count === daySlots.length
                                return (
                                    <th key={day} style={{padding: '12px 4px', borderBottom: '1px solid var(--it-border)'}}>
                                        <button
                                            onClick={() => toggleDay(day)}
                                            title={`Toggle all ${DAY_LABELS[day]}`}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                                background: allOn ? 'var(--it-success-bg)' : 'transparent',
                                                border: '1px solid',
                                                borderColor: allOn ? 'var(--it-green)' : 'transparent',
                                                borderRadius: 6, padding: '4px 8px', cursor: 'pointer', width: '100%',
                                            }}
                                        >
                                            <span style={{fontSize: 13, fontWeight: 700, color: allOn ? 'var(--it-green)' : 'var(--it-text-primary)'}}>{day}</span>
                                            {count > 0 && (
                                                <span style={{fontSize: 10, color: 'var(--it-green)', fontWeight: 600}}>{count}</span>
                                            )}
                                        </button>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {ALL_SLOTS.map((slot, i) => {
                            const rowKeys = DAYS.map(d => `${d}:${slot}`)
                            const rowCount = rowKeys.filter(k => selected.has(k)).length
                            const rowAllOn = rowCount === DAYS.length
                            return (
                            <tr key={slot} style={{background: i % 2 === 0 ? 'transparent' : 'var(--it-surface-hover)'}}>
                                <td style={{padding: '4px 8px', whiteSpace: 'nowrap'}}>
                                    <button
                                        onClick={() => toggleSlot(slot)}
                                        title={`Toggle all ${slot}`}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: rowAllOn ? 'var(--it-success-bg)' : 'transparent',
                                            border: '1px solid',
                                            borderColor: rowAllOn ? 'var(--it-green)' : 'transparent',
                                            borderRadius: 5, padding: '2px 8px', cursor: 'pointer', width: '100%',
                                        }}
                                    >
                                        <span style={{fontSize: 12, color: rowAllOn ? 'var(--it-green)' : 'var(--it-text-tertiary)', fontVariantNumeric: 'tabular-nums', fontWeight: rowAllOn ? 700 : 400}}>
                                            {slot}
                                        </span>
                                        {rowCount > 0 && !rowAllOn && (
                                            <span style={{fontSize: 10, color: 'var(--it-green)', fontWeight: 600}}>{rowCount}</span>
                                        )}
                                    </button>
                                </td>
                                {DAYS.map(day => {
                                    const key = `${day}:${slot}`
                                    const on = selected.has(key)
                                    return (
                                        <td key={day} style={{padding: '3px 4px', textAlign: 'center'}}>
                                            <button
                                                onClick={() => toggle(day, slot)}
                                                title={`${DAY_LABELS[day]} ${slot}`}
                                                style={{
                                                    width: '100%', height: 28, borderRadius: 5, border: '1px solid',
                                                    borderColor: on ? 'var(--it-green)' : 'var(--it-border)',
                                                    background: on ? 'var(--it-green)' : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'background 80ms ease, border-color 80ms ease',
                                                }}
                                            />
                                        </td>
                                    )
                                })}
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    )
}

export default TeacherSchedulePage
