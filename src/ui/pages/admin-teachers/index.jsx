import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetTeachers} from '@/services/teacher/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {DataTable} from '@/ui/components/data-table/index.jsx'
import {Toolbar} from '@/ui/components/toolbar/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {Pagination} from '@/ui/components/pagination/index.jsx'
import {fullName} from '@/utils/lib.js'

export function AdminTeachersPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const limit = 10

    useEffect(() => { setHeader({title: 'Teachers'}); return () => setHeader({}) }, [setHeader])

    const {data, isLoading} = useGetTeachers({page, limit})
    const items = data?.data ?? []
    const filtered = search ? items.filter(t => fullName(t.user).toLowerCase().includes(search.toLowerCase())) : items
    const totalPages = data?.totalPages ?? 1
    const total = data?.total ?? 0

    return (
        <>
            <Toolbar search={search} onSearchChange={setSearch} placeholder="Search teachers...">
                <Button leftIcon="plus" onClick={() => navigate('/admin/teachers/new')}>
                    Add Teacher
                </Button>
            </Toolbar>

            <DataTable
                loading={isLoading}
                empty="No teachers yet"
                data={filtered}
                rowKey="id"
                columns={[
                    {key: 'num', header: '#', width: 40, muted: true, render: (_, i) => (page - 1) * limit + i + 1},
                    {key: 'name', header: 'Full Name', gap: 12, render: (t) => (
                        <>
                            <Avatar name={fullName(t.user)} src={t.user?.avatar}/>
                            <span style={{color: 'var(--it-text-primary)', fontWeight: 500}}>{fullName(t.user)}</span>
                        </>
                    )},
                    {key: 'phone', header: 'Phone Number', width: 180, render: (t) => formatPhone(t.user?.phoneNumber)},
                    {key: 'profession', header: 'Profession', width: 180, render: (t) => t.profession || '—'},
                    {key: 'status', header: 'Status', width: 110, render: (t) => (
                        <ResourceBadge status={t.user?.isActive === false ? 'inactive' : t.status}/>
                    )},
                    {key: 'actions', header: 'Actions', width: 100, render: (t) => (
                        <div style={{display: 'flex', gap: 8}}>
                            <IconButton icon="pencil" title="Edit" onClick={(e) => {e.stopPropagation(); navigate(`/admin/teachers/${t.id}/edit`)}}/>
                            <IconButton icon="eye" title="View" onClick={(e) => {e.stopPropagation(); navigate(`/admin/teachers/${t.id}`)}}/>
                        </div>
                    )},
                ]}
                onRowClick={(t) => navigate(`/admin/teachers/${t.id}`)}
                footer={
                    <>
                        <span>Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1}–{(page - 1) * limit + filtered.length} of {total} teachers</span>
                        <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
                    </>
                }
            />
        </>
    )
}

function formatPhone(num) {
    if (!num) return '—'
    return `+${num}`
}

export default AdminTeachersPage
