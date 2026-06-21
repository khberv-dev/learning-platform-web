import {useEffect, useMemo, useState} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {
    useGetPendingAssignments,
    useAcceptAssignment,
    useRejectAssignment,
    useGetTeacherAssignmentHistory,
} from '@/services/assignment/query.js'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {DataTable} from '@/ui/components/data-table/index.jsx'
import {Toolbar} from '@/ui/components/toolbar/index.jsx'
import {Pagination} from '@/ui/components/pagination/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {fullName, formatDate} from '@/utils/lib.js'

export function TeacherStudentsPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const limit = 10

    useEffect(() => { setHeader({title: 'My Students'}); return () => setHeader({}) }, [setHeader])

    const {data: pending = []} = useGetPendingAssignments()
    const {data: history, isLoading} = useGetTeacherAssignmentHistory({page, limit})
    const accept = useAcceptAssignment()
    const reject = useRejectAssignment()

    const pendingItems = useMemo(
        () => (pending ?? []).filter(p => p.status === 'pending'),
        [pending],
    )

    const historyItems = history?.data ?? []
    const totalPages = history?.totalPages ?? 1
    const total = history?.total ?? 0

    const filtered = search
        ? historyItems.filter(a => fullName(a.student?.user).toLowerCase().includes(search.toLowerCase()))
        : historyItems

    return (
        <>
            {pendingItems.length > 0 && (
                <Card padding={20} gap={16} style={{background: 'var(--it-warning-bg)', borderColor: 'var(--it-warning-border)'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span style={{fontSize: 15, fontWeight: 700, color: 'var(--it-warning-text-strong)'}}>
                            Pending Requests
                        </span>
                        <span style={{
                            width: 24, height: 24, borderRadius: 12,
                            background: 'var(--it-danger-text)', color: '#FFFFFF',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12,
                        }}>{pendingItems.length}</span>
                    </div>
                    {pendingItems.map((p) => (
                        <div key={p.id} style={{display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 16px', background: 'var(--it-surface)', border: '1px solid var(--it-border)', borderRadius: 10}}>
                            <Avatar name={fullName(p.student?.user)} src={p.student?.user?.avatar}/>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                                <span style={{fontWeight: 600}}>{fullName(p.student?.user) || 'Student'}</span>
                                <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                    {formatDate(p.startDate)} → {formatDate(p.endDate)}
                                </span>
                            </div>
                            <Button size="sm" onClick={() => accept.mutate(p.id)} disabled={accept.isPending}>Accept</Button>
                            <Button size="sm" variant="secondary" onClick={() => reject.mutate(p.id)} disabled={reject.isPending}>Reject</Button>
                        </div>
                    ))}
                </Card>
            )}

            <Toolbar search={search} onSearchChange={setSearch} placeholder="Search students..." searchWidth={280}/>

            <DataTable
                loading={isLoading}
                empty="No students yet"
                data={filtered}
                columns={[
                    {key: 'num', header: '#', width: 40, muted: true, render: (_, i) => (page - 1) * limit + i + 1},
                    {key: 'name', header: 'Student Name', gap: 12, render: (a) => (
                        <>
                            <Avatar name={fullName(a.student?.user)} src={a.student?.user?.avatar}/>
                            <span style={{color: 'var(--it-text-primary)', fontWeight: 500}}>{fullName(a.student?.user)}</span>
                        </>
                    )},
                    {key: 'phone', header: 'Phone', width: 180, render: (a) => a.student?.user?.phoneNumber ? `+${a.student.user.phoneNumber}` : '—'},
                    {key: 'enrolled', header: 'Since', width: 160, render: (a) => formatDate(a.startDate)},
                    {key: 'status', header: 'Status', width: 110, render: (a) => <ResourceBadge status={a.status}/>},
                    {key: 'actions', header: 'Action', width: 60, render: (a) => (
                        <IconButton
                            icon="message-circle"
                            title="Open chat"
                            onClick={() => navigate(`/teacher/chat?userId=${a.student?.user?.id}`)}
                        />
                    )},
                ]}
                footer={
                    <>
                        <span>Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1}–{(page - 1) * limit + filtered.length} of {total} students</span>
                        <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
                    </>
                }
            />
        </>
    )
}

export default TeacherStudentsPage
