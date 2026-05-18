import {useEffect} from "react";
import {useHeader} from "@/providers/header.jsx";
import StatCard from "@/ui/components/stat-card/index.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import {useGetAllTeachers} from "@/services/teacher/query.js";
import {useGetAllCourses} from "@/services/course/query.js";
import {useGetAllAssignments} from "@/services/assignment/query.js";
import {getFullName} from "@/utils/user.js";

export default function AdminDashboardPage() {
    const {setHeader} = useHeader()

    const {data: teachers} = useGetAllTeachers()
    const {data: courses} = useGetAllCourses()
    const {data: assignments} = useGetAllAssignments()

    useEffect(() => {
        setHeader({title: 'Dashboard'})
    }, [setHeader])

    const activeTeachers = (teachers ?? []).filter(t => t.status === 'active').length
    const activeCourses = (courses ?? []).filter(c => c.isActive).length
    const totalLessons = (courses ?? []).reduce((s, c) => s + (c.lessonsCount ?? 0), 0)
    const pendingAssignments = (assignments ?? []).filter(a => a.status === 'pending').length
    const recent = (assignments ?? []).slice(0, 5)

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
                <StatCard value={activeTeachers} label={'Active Teachers'} icon={'users'} iconTheme={'green'}/>
                <StatCard value={activeCourses} label={'Active Courses'} icon={'book-open'} iconTheme={'orange'}/>
                <StatCard value={totalLessons} label={'Total Lessons'} icon={'video'} iconTheme={'purple'}/>
                <StatCard value={pendingAssignments} label={'Pending Assignments'} icon={'shield-check'} iconTheme={'blue'}/>
            </div>

            <SectionCard
                title={
                    <>
                        <span style={{fontSize: 16, fontWeight: 700}}>Recent Assignments</span>
                        <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                            Latest student-teacher matchings
                        </span>
                    </>
                }
            >
                {recent.length === 0 && (
                    <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                        No assignments yet.
                    </span>
                )}
                {recent.map(a => (
                    <div
                        key={a.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 12,
                            border: '1px solid var(--it-border)',
                            borderRadius: 10,
                            gap: 12,
                        }}
                    >
                        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <span style={{fontSize: 14, fontWeight: 600}}>
                                {a.student?.user ? getFullName(a.student.user) : 'Student'} →{' '}
                                {a.teacher?.user ? getFullName(a.teacher.user) : 'Teacher'}
                            </span>
                            <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                {new Date(a.startDate).toLocaleDateString()} → {new Date(a.endDate).toLocaleDateString()}
                            </span>
                        </div>
                        <ResourceBadge
                            theme={
                                a.status === 'active' ? 'success' :
                                    a.status === 'rejected' ? 'danger' :
                                        a.status === 'expired' ? 'neutral' :
                                            'info'
                            }
                        >
                            {a.status}
                        </ResourceBadge>
                    </div>
                ))}
            </SectionCard>
        </div>
    )
}
