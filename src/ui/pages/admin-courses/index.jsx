import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetCourses, useDeleteCourse} from '@/services/course/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {DataTable} from '@/ui/components/data-table/index.jsx'
import {Toolbar} from '@/ui/components/toolbar/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {cdnUrl} from '@/services/config.js'

export function AdminCoursesPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [pendingDelete, setPendingDelete] = useState(null)
    const del = useDeleteCourse({onSuccess: () => setPendingDelete(null)})

    useEffect(() => { setHeader({title: 'Courses'}); return () => setHeader({}) }, [setHeader])

    const {data, isLoading} = useGetCourses()
    const items = data ?? []
    const filtered = search ? items.filter(c => c.title?.toLowerCase().includes(search.toLowerCase())) : items

    return (
        <>
            <Toolbar search={search} onSearchChange={setSearch} placeholder="Search courses...">
                <Button leftIcon="plus" onClick={() => navigate('/admin/courses/new')}>Add Course</Button>
            </Toolbar>
            <DataTable
                loading={isLoading}
                empty="No courses yet"
                data={filtered}
                columns={[
                    {key: 'num', header: '#', width: 40, muted: true, render: (_, i) => i + 1},
                    {key: 'title', header: 'Title', gap: 12, render: (c) => (
                        <>
                            <div style={{width: 44, height: 44, borderRadius: 8, background: cdnUrl(c.image) ? `center/cover no-repeat url(${cdnUrl(c.image)})` : 'var(--it-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--it-info-text)'}}>
                                {!c.image && (c.title?.[0] ?? '?').toUpperCase()}
                            </div>
                            <span style={{color: 'var(--it-text-primary)', fontWeight: 500}}>{c.title}</span>
                        </>
                    )},
                    {key: 'units', header: 'Units', width: 100, render: (c) => c.units?.length ?? 0},
                    {key: 'lessons', header: 'Lessons', width: 100, render: (c) => c.lessonsCount ?? 0},
                    {key: 'status', header: 'Status', width: 110, render: (c) => (
                        <ResourceBadge status={c.isActive ? 'active' : 'inactive'}/>
                    )},
                    {key: 'actions', header: 'Actions', width: 120, render: (c) => (
                        <div style={{display: 'flex', gap: 8}}>
                            <IconButton icon="folder-open" title="Manage" onClick={(e) => {e.stopPropagation(); navigate(`/admin/courses/${c.id}`)}}/>
                            <IconButton icon="trash-2" title="Delete" onClick={(e) => {e.stopPropagation(); setPendingDelete(c)}}/>
                        </div>
                    )},
                ]}
                onRowClick={(c) => navigate(`/admin/courses/${c.id}`)}
                footer={<span>Showing {filtered.length} of {items.length} courses</span>}
            />
            <ConfirmDialog
                open={!!pendingDelete}
                title="Delete course?"
                description={`"${pendingDelete?.title}" will be permanently removed along with its units and lessons.`}
                confirmLabel="Delete"
                loading={del.isPending}
                onCancel={() => setPendingDelete(null)}
                onConfirm={() => del.mutate(pendingDelete.id)}
            />
        </>
    )
}

export default AdminCoursesPage
