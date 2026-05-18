import {useEffect} from "react";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import {useAcceptAssignment, useGetPendingAssignments, useRejectAssignment} from "@/services/assignment/query.js";
import {getAvatarPalette, getFullName, getInitials} from "@/utils/user.js";

export default function TeacherSessionsPage() {
    const {setHeader} = useHeader()
    const {data: pending, isLoading} = useGetPendingAssignments()
    const accept = useAcceptAssignment()
    const reject = useRejectAssignment()

    useEffect(() => {
        setHeader({title: 'Student Assignments'})
    }, [setHeader])

    const list = pending ?? []

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <SectionCard title={'Pending Requests'}>
                {isLoading && <span style={{color: 'var(--it-text-secondary)'}}>Loading...</span>}
                {!isLoading && list.length === 0 && (
                    <span style={{color: 'var(--it-text-secondary)'}}>No pending requests.</span>
                )}
                {list.map(a => (
                    <div
                        key={a.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            padding: 14,
                            border: '1px solid var(--it-border)',
                            borderRadius: 10,
                        }}
                    >
                        <Avatar
                            initials={a.student?.user ? getInitials(a.student.user) : '?'}
                            palette={getAvatarPalette(a.id)}
                            size={40}
                        />
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                            <span style={{fontSize: 14, fontWeight: 600}}>
                                {a.student?.user ? getFullName(a.student.user) : 'Student'}
                            </span>
                            <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                {new Date(a.startDate).toLocaleDateString()} → {new Date(a.endDate).toLocaleDateString()}
                            </span>
                        </div>
                        <ResourceBadge theme={'info'}>{a.status}</ResourceBadge>
                        <Button view={'action'} onClick={() => accept.mutate(a.id)} loading={accept.isPending}>
                            Accept
                        </Button>
                        <Button view={'outlined'} onClick={() => reject.mutate(a.id)} loading={reject.isPending}>
                            Reject
                        </Button>
                    </div>
                ))}
            </SectionCard>
        </div>
    )
}
