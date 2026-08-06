import {useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetStudents} from '@/services/student/query.js'
import {useGetCourses} from '@/services/course/query.js'
import {useGetPlans} from '@/services/plan/query.js'
import {useCreateEnrollment} from '@/services/enrollment/query.js'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {Button} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {SectionCard} from '@/ui/components/section-card/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {fullName, formatDate, formatNumber} from '@/utils/lib.js'

const selectStyle = {
    width: '100%', height: 44, padding: '0 14px',
    background: 'var(--it-surface-input)',
    border: '1px solid var(--it-border-strong)',
    borderRadius: 8, fontSize: 14,
}

const NO_PLAN = 'none'

// Mounted only while open, so the initial values below double as a reset.
function EnrollDialog({studentId, studentName, loading, onClose, onSubmit}) {
    const [courseId, setCourseId] = useState('')
    const [planId, setPlanId] = useState(NO_PLAN)
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')
    const [amount, setAmount] = useState('')

    const {data: courses} = useGetCourses()
    const {data: plans} = useGetPlans(courseId)

    const planList = plans ?? []
    const plan = planList.find(p => p.id === planId)
    // Without a plan there is no duration to derive the end date from, so the API requires it.
    const needsEnd = !plan
    const valid = courseId && (!needsEnd || end)

    const pickCourse = (id) => {
        setCourseId(id)
        setPlanId(NO_PLAN)   // plans are per course
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!valid) return
        const data = {studentId}
        if (plan) data.planId = plan.id
        else data.courseId = courseId
        if (start) data.start = new Date(start).toISOString()
        if (end) data.end = new Date(end).toISOString()
        if (amount !== '') data.purchaseAmount = Number(amount) || 0
        onSubmit(data)
    }

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form className="it-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="it-dialog__title">Enroll in a course</div>
                <div className="it-dialog__body">
                    {studentName} is enrolled straight away, with no payment recorded.
                </div>

                <FormField label="Course">
                    <select
                        value={courseId}
                        onChange={(e) => pickCourse(e.target.value)}
                        style={{...selectStyle, color: courseId ? 'var(--it-text-primary)' : 'var(--it-text-tertiary)'}}
                    >
                        <option value="">Select a course</option>
                        {(courses ?? []).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </FormField>

                <FormField
                    label="Plan"
                    hint={plan
                        ? `Ends ${plan.month} month${plan.month === 1 ? '' : 's'} after the start date.`
                        : 'Without a plan you set the end date yourself.'}
                >
                    <select
                        value={planId}
                        onChange={(e) => setPlanId(e.target.value)}
                        disabled={!courseId}
                        style={{...selectStyle, color: plan ? 'var(--it-text-primary)' : 'var(--it-text-tertiary)'}}
                    >
                        <option value={NO_PLAN}>No plan — custom dates</option>
                        {planList.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.title} · {p.month} mo · {p.price ? `${formatNumber(p.price)} UZS` : 'Free'}
                            </option>
                        ))}
                    </select>
                </FormField>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                    <FormField label="Starts" hint="Defaults to now.">
                        <Input type="date" value={start} onChange={(e) => setStart(e.target.value)}/>
                    </FormField>
                    <FormField label={needsEnd ? 'Ends (required)' : 'Ends'} hint={needsEnd ? undefined : 'Defaults to the plan duration.'}>
                        <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} invalid={needsEnd && !end}/>
                    </FormField>
                </div>

                <FormField
                    label="Purchase amount (UZS)"
                    hint={plan ? 'Defaults to the plan price. Recorded in the purchase history.' : 'Defaults to 0. Recorded in the purchase history.'}
                >
                    <Input
                        type="number"
                        min={0}
                        step={1000}
                        placeholder={plan?.price ? String(plan.price) : '0'}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </FormField>

                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={!valid || loading}>
                        {loading ? 'Enrolling…' : 'Enroll'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export function AdminStudentProfilePage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data} = useGetStudents({page: 1, limit: 100})
    const [enrollOpen, setEnrollOpen] = useState(false)
    const enroll = useCreateEnrollment({onSuccess: () => setEnrollOpen(false)})

    const student = useMemo(() => (data?.data ?? []).find(s => s.id === id), [data, id])

    useEffect(() => {
        setHeader({
            title: 'Student Profile',
            onBack: () => navigate('/admin/students'),
            actions: (
                <Button variant="secondary" size="sm" leftIcon="pencil" onClick={() => navigate(`/admin/students/${id}/edit`)}>
                    Edit
                </Button>
            ),
        })
        return () => setHeader({})
    }, [setHeader, navigate, id])

    if (!student) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    const name = fullName(student.user)
    const status = student.user?.isActive === false ? 'inactive' : 'active'
    const enrollments = student.enrollments ?? []

    return (
        <div style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, flex: 1}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <Card padding={24} gap={16} style={{alignItems: 'center'}}>
                    <Avatar name={name} src={student.user?.avatar} size={80} fontSize={28}/>
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: 18, fontWeight: 700}}>{name}</div>
                        <div style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>Level {student.level ?? 'A1'}</div>
                    </div>
                    <ResourceBadge status={status} withDot/>
                    <div style={{height: 1, background: 'var(--it-border-row)', width: '100%'}}/>
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                        <Stat value={student.points ?? 0} label="Points"/>
                        <Sep/>
                        <Stat value={student.coins ?? 0} label="Coins"/>
                        <Sep/>
                        <Stat value={student.balance ?? 0} label="Balance"/>
                        <Sep/>
                        <Stat value={enrollments.length} label="Courses"/>
                    </div>
                </Card>

                <SectionCard title="Contact Info">
                    <InfoRow icon="phone" label="Phone" value={student.user?.phoneNumber ? `+${student.user.phoneNumber}` : '—'}/>
                    <InfoRow icon="mail" label="Email" value={student.user?.email ?? '—'}/>
                    <InfoRow icon="calendar" label="Joined" value={formatDate(student.createdAt)}/>
                </SectionCard>
            </div>

            <SectionCard
                title={`Enrolled Courses (${enrollments.length})`}
                action={
                    <Button size="sm" leftIcon="plus" onClick={() => setEnrollOpen(true)}>
                        Enroll in Course
                    </Button>
                }
            >
                {enrollments.length === 0 ? (
                    <div style={{color: 'var(--it-text-tertiary)', padding: 12}}>No active enrollments.</div>
                ) : enrollments.map((e) => (
                    <div key={e.id} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--it-border-row)'}}>
                        <div style={{width: 40, height: 40, borderRadius: 10, background: 'var(--it-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Icon name="book-open" size={18} color="var(--it-info-text)"/>
                        </div>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 3}}>
                            <div style={{fontSize: 14, fontWeight: 600}}>{e.course?.title}</div>
                            <div style={{fontSize: 12, color: 'var(--it-text-tertiary)'}}>
                                {formatDate(e.start)} → {formatDate(e.end)}
                            </div>
                        </div>
                        <ResourceBadge status="active" size="sm"/>
                    </div>
                ))}
            </SectionCard>

            {enrollOpen && (
                <EnrollDialog
                    studentId={student.id}
                    studentName={name}
                    loading={enroll.isPending}
                    onClose={() => setEnrollOpen(false)}
                    onSubmit={(data) => enroll.mutate(data)}
                />
            )}
        </div>
    )
}

function InfoRow({icon, label, value}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{width: 32, height: 32, borderRadius: 8, background: 'var(--it-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name={icon} size={14} color="var(--it-text-secondary)"/>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <span style={{fontSize: 11, color: 'var(--it-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4}}>{label}</span>
                <span style={{fontSize: 14, color: 'var(--it-text-primary)', fontWeight: 500}}>{value}</span>
            </div>
        </div>
    )
}
function Stat({value, label}) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
            <span style={{fontSize: 18, fontWeight: 700}}>{value}</span>
            <span style={{fontSize: 11, color: 'var(--it-text-secondary)'}}>{label}</span>
        </div>
    )
}
function Sep() { return <div style={{width: 1, height: 40, background: 'var(--it-border)'}}/> }

export default AdminStudentProfilePage
