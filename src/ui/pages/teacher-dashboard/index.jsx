import {useEffect} from "react";
import {useNavigate} from "react-router";
import {Button} from "@gravity-ui/uikit";
import {useHeader} from "@/providers/header.jsx";
import StatCard from "@/ui/components/stat-card/index.jsx";
import SectionCard from "@/ui/components/section-card/index.jsx";
import Avatar from "@/ui/components/avatar/index.jsx";
import ResourceBadge from "@/ui/components/resource-badge/index.jsx";
import {useAcceptAssignment, useGetPendingAssignments, useRejectAssignment} from "@/services/assignment/query.js";
import {getAvatarPalette, getFullName, getInitials} from "@/utils/user.js";

export default function TeacherDashboardPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const {data: pending, isLoading} = useGetPendingAssignments()
    const accept = useAcceptAssignment()
    const reject = useRejectAssignment()

    useEffect(() => {
        setHeader({title: 'Dashboard'})
    }, [setHeader])

    const list = pending ?? []

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16}}>
                <StatCard value={list.length} label={'Pending Offers'} icon={'shield-check'} iconTheme={'blue'}/>
                <StatCard
                    value={list.filter(a => new Date(a.startDate) > new Date()).length}
                    label={'Upcoming'}
                    icon={'calendar'}
                    iconTheme={'green'}
                />
                <StatCard
                    value={list.filter(a => new Date(a.startDate) <= new Date()).length}
                    label={'Active Now'}
                    icon={'video'}
                    iconTheme={'purple'}
                />
            </div>

            <SectionCard
                title={
                    <>
                        <span style={{fontSize: 16, fontWeight: 700}}>Pending Student Requests</span>
                        <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                            Accept or reject assignment offers
                        </span>
                    </>
                }
                action={
                    <Button view={'outlined'} onClick={() => navigate('/teacher/sessions')}>
                        See all
                    </Button>
                }
            >
                {isLoading && <span style={{color: 'var(--it-text-secondary)'}}>Loading...</span>}
                {!isLoading && list.length === 0 && (
                    <span style={{color: 'var(--it-text-secondary)'}}>No pending offers.</span>
                )}
                {list.slice(0, 5).map(a => (
                    <div
                        key={a.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 14,
                            border: '1px solid var(--it-border)',
                            borderRadius: 10,
                        }}
                    >
                        <Avatar
                            initials={a.student?.user ? getInitials(a.student.user) : '?'}
                            palette={getAvatarPalette(a.id)}
                            size={36}
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
