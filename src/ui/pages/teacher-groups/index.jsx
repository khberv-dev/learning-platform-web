import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetGroups} from '@/services/group/query.js'
import {Button} from '@/ui/components/button/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {Toolbar} from '@/ui/components/toolbar/index.jsx'
import {Pagination} from '@/ui/components/pagination/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {EmptyState} from '@/ui/components/empty-state/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {formatDate} from '@/utils/lib.js'

export function TeacherGroupsPage() {
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const limit = 12

    useEffect(() => {
        setHeader({
            title: 'Groups',
            actions: <Button leftIcon="plus" onClick={() => navigate('/teacher/groups/new')}>Create Group</Button>,
        })
        return () => setHeader({})
    }, [setHeader, navigate])

    const {data, isLoading} = useGetGroups({page, limit})
    const items = data?.data ?? []
    const totalPages = data?.totalPages ?? 1
    const total = data?.total ?? 0
    const filtered = search ? items.filter(g => g.name?.toLowerCase().includes(search.toLowerCase())) : items

    return (
        <>
            <Toolbar search={search} onSearchChange={setSearch} placeholder="Search groups..." searchWidth={300}/>

            {isLoading ? (
                <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>
            ) : filtered.length === 0 ? (
                <Card padding={0}>
                    <EmptyState
                        icon="users-round"
                        title={search ? 'No matches' : 'No groups yet'}
                        hint={search ? 'Try a different search.' : 'Create your first group to organize students.'}
                        action={!search && <Button leftIcon="plus" onClick={() => navigate('/teacher/groups/new')}>Create Group</Button>}
                    />
                </Card>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16}}>
                    {filtered.map((g) => (
                        <Card
                            key={g.id}
                            padding={20}
                            gap={12}
                            style={{cursor: 'pointer', transition: 'box-shadow 120ms ease, transform 120ms ease'}}
                            onClick={() => navigate(`/teacher/groups/${g.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--it-shadow-md)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
                        >
                            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12}}>
                                <div style={{width: 44, height: 44, borderRadius: 10, background: 'var(--it-violet-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <Icon name="users-round" size={20} color="var(--it-violet-text)"/>
                                </div>
                                <ResourceBadge status={g.isActive ? 'active' : 'inactive'} size="sm"/>
                            </div>
                            <div style={{fontSize: 16, fontWeight: 700, color: 'var(--it-text-primary)'}}>{g.name}</div>
                            {g.description && (
                                <div style={{fontSize: 13, color: 'var(--it-text-secondary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                    {g.description}
                                </div>
                            )}
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--it-text-tertiary)', marginTop: 4}}>
                                <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
                                    <Icon name="calendar" size={12}/> {formatDate(g.createdAt)}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                        Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1}–{(page - 1) * limit + filtered.length} of {total} groups
                    </span>
                    <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
                </div>
            )}
        </>
    )
}

export default TeacherGroupsPage
