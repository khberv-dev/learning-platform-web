import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetStudents} from '@/services/student/query.js'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {DataTable} from '@/ui/components/data-table/index.jsx'
import {Toolbar} from '@/ui/components/toolbar/index.jsx'
import {Pagination} from '@/ui/components/pagination/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {IconButton} from '@/ui/components/button/index.jsx'
import {fullName} from '@/utils/lib.js'

export function AdminStudentsPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const limit = 10

    useEffect(() => { setHeader({title: 'Students'}); return () => setHeader({}) }, [setHeader])

    const {data, isLoading} = useGetStudents({page, limit})
    const items = data?.data ?? []
    const filtered = search ? items.filter(s => fullName(s.user).toLowerCase().includes(search.toLowerCase())) : items
    const totalPages = data?.totalPages ?? 1
    const total = data?.total ?? 0

    return (
        <>
            <Toolbar search={search} onSearchChange={setSearch} placeholder="Search students..."/>
            <DataTable
                loading={isLoading}
                empty="No students yet"
                data={filtered}
                columns={[
                    {key: 'num', header: '#', width: 40, muted: true, render: (_, i) => (page - 1) * limit + i + 1},
                    {key: 'name', header: 'Full Name', gap: 12, render: (s) => (
                        <>
                            <Avatar name={fullName(s.user)} src={s.user?.avatar}/>
                            <span style={{color: 'var(--it-text-primary)', fontWeight: 500}}>{fullName(s.user)}</span>
                        </>
                    )},
                    {key: 'phone', header: 'Phone Number', width: 180, render: (s) => s.user?.phoneNumber ? `+${s.user.phoneNumber}` : '—'},
                    {key: 'level', header: 'Level', width: 90, render: (s) => s.level ?? '—'},
                    {key: 'status', header: 'Status', width: 110, render: (s) => (
                        <ResourceBadge status={s.user?.isActive === false ? 'inactive' : 'active'}/>
                    )},
                    {key: 'actions', header: 'Actions', width: 100, render: (s) => (
                        <div style={{display: 'flex', gap: 8}}>
                            <IconButton icon="pencil" title="Edit" onClick={(e) => {e.stopPropagation(); navigate(`/admin/students/${s.id}/edit`)}}/>
                            <IconButton icon="eye" title="View" onClick={(e) => {e.stopPropagation(); navigate(`/admin/students/${s.id}`)}}/>
                        </div>
                    )},
                ]}
                onRowClick={(s) => navigate(`/admin/students/${s.id}`)}
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

export default AdminStudentsPage
