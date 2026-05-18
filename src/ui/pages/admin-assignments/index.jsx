import {useEffect, useState} from "react";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import DataTable from "@/ui/components/data-table/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import {useGetAllAssignments} from "@/services/assignment/query.js";
import {getFullName} from "@/utils/user.js";

const STATUSES = ['all', 'pending', 'active', 'rejected', 'expired']

const BADGE = {
    pending: 'info',
    active: 'success',
    rejected: 'danger',
    expired: 'neutral',
}

export default function AdminAssignmentsPage() {
    const {setHeader} = useHeader()
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        setHeader({title: 'Assignments'})
    }, [setHeader])

    const {data, isLoading} = useGetAllAssignments(filter === 'all' ? undefined : filter)

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                {STATUSES.map(s => (
                    <Button
                        key={s}
                        view={filter === s ? 'action' : 'outlined'}
                        size={'m'}
                        onClick={() => setFilter(s)}
                    >
                        {s}
                    </Button>
                ))}
            </div>

            <DataTable
                emptyText={isLoading ? 'Loading...' : 'No assignments'}
                columns={[
                    {title: '#', render: (_, i) => <span style={{color: 'var(--it-text-secondary)'}}>{i + 1}</span>},
                    {title: 'Student', render: (r) => r.student?.user ? getFullName(r.student.user) : '—'},
                    {title: 'Teacher', render: (r) => r.teacher?.user ? getFullName(r.teacher.user) : '—'},
                    {
                        title: 'Period',
                        render: (r) =>
                            `${new Date(r.startDate).toLocaleDateString()} → ${new Date(r.endDate).toLocaleDateString()}`,
                    },
                    {
                        title: 'Status',
                        render: (r) => <ResourceBadge theme={BADGE[r.status] ?? 'neutral'}>{r.status}</ResourceBadge>,
                    },
                ]}
                rows={data ?? []}
            />
        </div>
    )
}
