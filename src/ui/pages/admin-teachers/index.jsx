import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router";
import {Button, TextInput} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import Icon from "@/ui/components/icon/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import DataTable from "@/ui/components/data-table/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import {useGetAllTeachers} from "@/services/teacher/query.js";
import {getAvatarPalette, getFullName, getInitials} from "@/utils/user.js";

export default function AdminTeachersPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')

    useEffect(() => {
        setHeader({title: 'Teachers'})
    }, [setHeader])

    const {data: teachers, isLoading} = useGetAllTeachers()

    const filtered = useMemo(() => {
        const list = teachers ?? []
        if (!search) return list
        const q = search.toLowerCase()
        return list.filter(t => getFullName(t.user).toLowerCase().includes(q))
    }, [teachers, search])

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
                <TextInput
                    size={'l'}
                    placeholder={'Search teachers...'}
                    value={search}
                    onUpdate={setSearch}
                    style={{maxWidth: 360}}
                    startContent={
                        <span style={{paddingLeft: 8, display: 'inline-flex'}}>
                            <Icon name={'search'} size={16} color={'var(--it-text-secondary)'}/>
                        </span>
                    }
                />
                <Button
                    view={'action'}
                    size={'l'}
                    onClick={() => navigate('/admin/teachers/new')}
                >
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                        <Icon name={'plus'} size={16} color={'#FFFFFF'}/>
                        Add Teacher
                    </span>
                </Button>
            </div>

            <DataTable
                emptyText={isLoading ? 'Loading...' : 'No teachers yet'}
                columns={[
                    {
                        title: '#',
                        render: (_, i) => (
                            <span style={{color: 'var(--it-text-secondary)'}}>{i + 1}</span>
                        ),
                    },
                    {
                        title: 'Full Name',
                        render: (r) => (
                            <div
                                style={{display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'}}
                                onClick={() => navigate(`/admin/teachers/${r.id}`)}
                            >
                                <Avatar
                                    initials={getInitials(r.user)}
                                    palette={getAvatarPalette(r.id)}
                                    size={32}
                                />
                                <span style={{fontWeight: 600}}>{getFullName(r.user)}</span>
                            </div>
                        ),
                    },
                    {title: 'Phone Number', render: (r) => r.user?.phoneNumber ?? '—'},
                    {title: 'Profession', render: (r) => r.profession ?? '—'},
                    {
                        title: 'Status',
                        render: (r) => <ResourceBadge active={r.status === 'active'}>{r.status}</ResourceBadge>,
                    },
                    {
                        title: 'Actions',
                        align: 'right',
                        render: (r) => (
                            <div style={{display: 'inline-flex', gap: 8}}>
                                <Button view={'flat'} onClick={() => navigate(`/admin/teachers/${r.id}/edit`)}>
                                    <Icon name={'pencil'} size={16} color={'var(--it-text-secondary)'}/>
                                </Button>
                            </div>
                        ),
                    },
                ]}
                rows={filtered}
            />

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: 13, color: 'var(--it-text-secondary)'}}>
                    Showing {filtered.length} of {teachers?.length ?? 0} teachers
                </span>
            </div>
        </div>
    )
}
