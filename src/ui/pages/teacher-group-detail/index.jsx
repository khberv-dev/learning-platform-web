import {useEffect, useMemo, useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {
    useGetGroup, useUpdateGroup, useDeactivateGroup,
    useAddStudentToGroup, useRemoveStudentFromGroup,
} from '@/services/group/query.js'
import {useGetTeacherAssignmentHistory} from '@/services/assignment/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {Input, Textarea} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Card} from '@/ui/components/card/index.jsx'
import {SectionCard} from '@/ui/components/section-card/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {Icon} from '@/ui/components/icon/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {EmptyState} from '@/ui/components/empty-state/index.jsx'
import {fullName, formatDate} from '@/utils/lib.js'

export function TeacherGroupDetailPage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const {setHeader} = useHeader()
    const {data: group, isLoading} = useGetGroup(id)

    const [editing, setEditing] = useState(false)
    const [confirmDeactivate, setConfirmDeactivate] = useState(false)
    const [addOpen, setAddOpen] = useState(false)
    const [removing, setRemoving] = useState(null)

    const updateGroup = useUpdateGroup({onSuccess: () => setEditing(false)})
    const deactivate = useDeactivateGroup({onSuccess: () => setConfirmDeactivate(false)})
    const addStudent = useAddStudentToGroup({onSuccess: () => setAddOpen(false)})
    const removeStudent = useRemoveStudentFromGroup({onSuccess: () => setRemoving(null)})

    useEffect(() => {
        setHeader({title: 'Group', onBack: () => navigate('/teacher/groups')})
        return () => setHeader({})
    }, [setHeader, navigate])

    if (isLoading || !group) return <div style={{color: 'var(--it-text-secondary)'}}>Loading…</div>

    return (
        <>
            <Card padding={24} gap={16}>
                <div style={{display: 'flex', alignItems: 'flex-start', gap: 20}}>
                    <div style={{width: 64, height: 64, borderRadius: 14, background: 'var(--it-violet-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name="users-round" size={28} color="var(--it-violet-text)"/>
                    </div>
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                            <h2 style={{fontSize: 22, fontWeight: 700, color: 'var(--it-text-primary)'}}>{group.name}</h2>
                            <ResourceBadge status={group.isActive ? 'active' : 'inactive'}/>
                        </div>
                        {group.description && (
                            <p style={{fontSize: 14, color: 'var(--it-text-secondary)', lineHeight: 1.5}}>{group.description}</p>
                        )}
                        <div style={{fontSize: 12, color: 'var(--it-text-tertiary)', marginTop: 4}}>
                            Created {formatDate(group.createdAt)} · {group.students?.length ?? 0} member{group.students?.length === 1 ? '' : 's'}
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                        <Button variant="secondary" size="sm" leftIcon="pencil" onClick={() => setEditing(true)}>Edit</Button>
                        {group.isActive && (
                            <Button variant="secondary" size="sm" leftIcon="archive" onClick={() => setConfirmDeactivate(true)}>
                                Deactivate
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            <SectionCard
                title={`Members (${group.students?.length ?? 0})`}
                action={
                    group.isActive && (
                        <Button size="sm" leftIcon="user-plus" onClick={() => setAddOpen(true)}>Add Student</Button>
                    )
                }
            >
                {(group.students?.length ?? 0) === 0 ? (
                    <EmptyState
                        icon="user-plus"
                        title="No members yet"
                        hint={group.isActive ? 'Add students from your active assignments.' : 'This group is deactivated.'}
                    />
                ) : group.students.map((s) => (
                    <div
                        key={s.id}
                        style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--it-border-row)'}}
                    >
                        <Avatar name={fullName(s.user)} src={s.user?.avatar}/>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                            <span style={{fontWeight: 600, color: 'var(--it-text-primary)'}}>{fullName(s.user) || 'Student'}</span>
                            <span style={{fontSize: 12, color: 'var(--it-text-tertiary)'}}>
                                {s.user?.phoneNumber ? `+${s.user.phoneNumber}` : '—'} · Level {s.level ?? 'A1'}
                            </span>
                        </div>
                        <IconButton
                            icon="user-minus"
                            title="Remove from group"
                            onClick={() => setRemoving(s)}
                        />
                    </div>
                ))}
            </SectionCard>

            <EditGroupDialog
                open={editing}
                group={group}
                loading={updateGroup.isPending}
                onCancel={() => setEditing(false)}
                onSave={(data) => updateGroup.mutate({id, data})}
            />

            <ConfirmDialog
                open={confirmDeactivate}
                title="Deactivate group?"
                description={`"${group.name}" will be archived. You won't be able to add new students.`}
                confirmLabel="Deactivate"
                loading={deactivate.isPending}
                onCancel={() => setConfirmDeactivate(false)}
                onConfirm={() => deactivate.mutate(id)}
            />

            <AddStudentDialog
                open={addOpen}
                group={group}
                onCancel={() => setAddOpen(false)}
                onAdd={(studentId) => addStudent.mutate({groupId: id, studentId})}
                loading={addStudent.isPending}
            />

            <ConfirmDialog
                open={!!removing}
                title="Remove student?"
                description={removing ? `${fullName(removing.user) || 'This student'} will be removed from "${group.name}".` : ''}
                confirmLabel="Remove"
                loading={removeStudent.isPending}
                onCancel={() => setRemoving(null)}
                onConfirm={() => removeStudent.mutate({groupId: id, studentId: removing.id})}
            />
        </>
    )
}

function EditGroupDialog({open, group, loading, onSave, onCancel}) {
    const {register, handleSubmit, reset} = useForm({defaultValues: {name: '', description: ''}})

    useEffect(() => {
        if (open && group) reset({name: group.name ?? '', description: group.description ?? ''})
    }, [open, group, reset])

    if (!open) return null

    return (
        <div className="it-dialog__backdrop" onClick={onCancel}>
            <form
                className="it-dialog"
                style={{maxWidth: 520}}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit((v) => onSave({name: v.name.trim(), description: v.description?.trim() ?? null}))}
            >
                <div className="it-dialog__title">Edit Group</div>
                <FormField label="Name">
                    <Input leftIcon="users-round" {...register('name', {required: true})} autoFocus/>
                </FormField>
                <FormField label="Description">
                    <Textarea rows={3} {...register('description')}/>
                </FormField>
                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" onClick={onCancel} disabled={loading}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
                </div>
            </form>
        </div>
    )
}

function AddStudentDialog({open, group, onCancel, onAdd, loading}) {
    const {data: history} = useGetTeacherAssignmentHistory({page: 1, limit: 100})
    const [search, setSearch] = useState('')

    const candidates = useMemo(() => {
        if (!open) return []
        const memberIds = new Set((group?.students ?? []).map(s => s.id))
        const seen = new Set()
        const out = []
        const now = Date.now()
        for (const a of history?.data ?? []) {
            if (a.status !== 'active') continue
            if (a.endDate && new Date(a.endDate).getTime() <= now) continue
            const s = a.student
            if (!s || memberIds.has(s.id) || seen.has(s.id)) continue
            seen.add(s.id)
            out.push(s)
        }
        return out
    }, [open, history, group])

    const filtered = search
        ? candidates.filter(s => fullName(s.user).toLowerCase().includes(search.toLowerCase()))
        : candidates

    if (!open) return null

    return (
        <div className="it-dialog__backdrop" onClick={onCancel}>
            <div className="it-dialog" style={{maxWidth: 520, gap: 12}} onClick={(e) => e.stopPropagation()}>
                <div className="it-dialog__title">Add Student to Group</div>
                <div className="it-dialog__body">Only students with an active assignment with you can join.</div>
                <Input
                    leftIcon="search"
                    placeholder="Search your students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div style={{maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4}}>
                    {filtered.length === 0 ? (
                        <div style={{padding: 24, textAlign: 'center', color: 'var(--it-text-tertiary)', fontSize: 13}}>
                            {candidates.length === 0 ? 'No eligible students.' : 'No matches.'}
                        </div>
                    ) : filtered.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => onAdd(s.id)}
                            disabled={loading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '8px 12px', borderRadius: 8,
                                background: 'transparent', cursor: 'pointer',
                                border: 0, textAlign: 'left',
                                color: 'var(--it-text-primary)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--it-surface-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <Avatar name={fullName(s.user)} src={s.user?.avatar} size={36}/>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                                <span style={{fontWeight: 600, color: 'var(--it-text-primary)'}}>{fullName(s.user)}</span>
                                <span style={{fontSize: 12, color: 'var(--it-text-tertiary)'}}>
                                    {s.user?.phoneNumber ? `+${s.user.phoneNumber}` : '—'}
                                </span>
                            </div>
                            <Icon name="plus" size={16} color="var(--it-green)"/>
                        </button>
                    ))}
                </div>
                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" onClick={onCancel} disabled={loading}>Close</Button>
                </div>
            </div>
        </div>
    )
}

export default TeacherGroupDetailPage
