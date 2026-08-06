import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {
    useGetPayments,
    useGetPaymentTypes,
    useUpdatePaymentStatus,
    useDeletePayment,
} from '@/services/payment/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {DataTable} from '@/ui/components/data-table/index.jsx'
import {Toolbar} from '@/ui/components/toolbar/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {Pagination} from '@/ui/components/pagination/index.jsx'
import {ResourceBadge} from '@/ui/components/resource-badge/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {PaymentTypeIcon} from '@/ui/components/payment-type-icon/index.jsx'
import {fullName, formatDate, formatNumber} from '@/utils/lib.js'

const selectStyle = {
    height: 36, padding: '0 12px',
    background: 'var(--it-surface-input)',
    border: '1px solid var(--it-border-strong)',
    borderRadius: 8, fontSize: 13,
}

// Reuses the palette ResourceBadge already defines for other resources.
const STATUS_BADGE = {
    created: {status: 'pending', label: 'Created'},
    paid: {status: 'active', label: 'Paid'},
    cancelled: {status: 'rejected', label: 'Cancelled'},
}

// Mounted only while open, so the initial values below double as a reset.
function ConfirmPaymentDialog({payment, loading, onClose, onSubmit}) {
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')

    const months = payment.plan?.month
    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({
            status: 'paid',
            start: start ? new Date(start).toISOString() : undefined,
            end: end ? new Date(end).toISOString() : undefined,
        })
    }

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form className="it-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="it-dialog__title">Confirm payment?</div>
                <div className="it-dialog__body">
                    The enrollment for {payment.enrollment?.course?.title ?? 'this course'} becomes active
                    and a purchase record is written.
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                    <FormField label="Starts" hint="Defaults to now.">
                        <Input type="date" value={start} onChange={(e) => setStart(e.target.value)}/>
                    </FormField>
                    <FormField
                        label="Ends"
                        hint={months ? `Defaults to +${months} month${months === 1 ? '' : 's'}.` : 'Defaults to the plan duration.'}
                    >
                        <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)}/>
                    </FormField>
                </div>

                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={loading}>
                        {loading ? 'Saving…' : 'Confirm Payment'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export function AdminPaymentsPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [paymentTypeId, setPaymentTypeId] = useState('')
    const [status, setStatus] = useState('')
    const [confirmPaid, setConfirmPaid] = useState(null)
    const [confirmCancel, setConfirmCancel] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const limit = 10

    useEffect(() => { setHeader({title: 'Payments'}); return () => setHeader({}) }, [setHeader])

    const {data, isLoading} = useGetPayments({page, limit, paymentTypeId, status})
    const {data: typesData} = useGetPaymentTypes()
    const updateStatus = useUpdatePaymentStatus({
        onSuccess: () => { setConfirmPaid(null); setConfirmCancel(null) },
    })
    const remove = useDeletePayment({onSuccess: () => setConfirmDelete(null)})

    const types = Array.isArray(typesData) ? typesData : (typesData?.data ?? [])
    const items = data?.data ?? []
    const filtered = search
        ? items.filter(p => fullName(p.user).toLowerCase().includes(search.toLowerCase()))
        : items
    const totalPages = data?.totalPages ?? 1
    const total = data?.total ?? 0

    const resetPage = (setter) => (value) => { setter(value); setPage(1) }

    return (
        <>
            <Toolbar search={search} onSearchChange={setSearch} placeholder="Search by student...">
                <select
                    value={status}
                    onChange={(e) => resetPage(setStatus)(e.target.value)}
                    style={{...selectStyle, color: status ? 'var(--it-text-primary)' : 'var(--it-text-tertiary)'}}
                >
                    <option value="">All statuses</option>
                    <option value="created">Created</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    value={paymentTypeId}
                    onChange={(e) => resetPage(setPaymentTypeId)(e.target.value)}
                    style={{...selectStyle, color: paymentTypeId ? 'var(--it-text-primary)' : 'var(--it-text-tertiary)'}}
                >
                    <option value="">All payment types</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <Button variant="secondary" leftIcon="credit-card" onClick={() => navigate('/admin/payments/types')}>
                    Payment Types
                </Button>
            </Toolbar>

            <DataTable
                loading={isLoading}
                empty="No payments yet"
                data={filtered}
                rowKey="id"
                columns={[
                    {key: 'num', header: '#', width: 40, muted: true, render: (_, i) => (page - 1) * limit + i + 1},
                    {key: 'user', header: 'Student', gap: 12, render: (p) => (
                        <>
                            <Avatar name={fullName(p.user)} src={p.user?.avatar}/>
                            <span style={{color: 'var(--it-text-primary)', fontWeight: 500}}>
                                {fullName(p.user) || '—'}
                            </span>
                        </>
                    )},
                    {key: 'course', header: 'Course / Plan', render: (p) => (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden'}}>
                            <span>{p.enrollment?.course?.title ?? '—'}</span>
                            <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>
                                {p.plan ? `${p.plan.title} · ${p.plan.month} mo` : 'No plan'}
                            </span>
                        </div>
                    )},
                    // The charged amount is frozen on the payment, so later plan price changes don't rewrite history.
                    {key: 'amount', header: 'Amount', width: 130, render: (p) => p.amount
                        ? `${formatNumber(p.amount)} UZS`
                        : <span style={{color: 'var(--it-text-tertiary)'}}>Free</span>},
                    {key: 'type', header: 'Payment Type', width: 170, gap: 10, render: (p) => p.paymentType
                        ? (
                            <>
                                <PaymentTypeIcon type={p.paymentType} size={28}/>
                                <span>{p.paymentType.title}</span>
                            </>
                        )
                        : <span style={{color: 'var(--it-text-tertiary)'}}>Not selected</span>},
                    {key: 'status', header: 'Status', width: 110, render: (p) => {
                        const badge = STATUS_BADGE[p.status] ?? {status: p.status, label: p.status}
                        return <ResourceBadge status={badge.status} label={badge.label}/>
                    }},
                    {key: 'date', header: 'Date', width: 160, render: (p) => formatDate(p.createdAt, true) || '—'},
                    {key: 'actions', header: 'Actions', width: 120, render: (p) => (
                        <div style={{display: 'flex', gap: 8}}>
                            {p.status === 'created' && (
                                <>
                                    <IconButton
                                        icon="check"
                                        title="Confirm payment"
                                        onClick={(e) => {e.stopPropagation(); setConfirmPaid(p)}}
                                    />
                                    <IconButton
                                        icon="x"
                                        title="Cancel payment"
                                        onClick={(e) => {e.stopPropagation(); setConfirmCancel(p)}}
                                    />
                                </>
                            )}
                            <IconButton
                                icon="trash-2"
                                title="Delete"
                                onClick={(e) => {e.stopPropagation(); setConfirmDelete(p)}}
                            />
                        </div>
                    )},
                ]}
                footer={
                    <>
                        <span>Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1}–{(page - 1) * limit + filtered.length} of {total} payments</span>
                        <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
                    </>
                }
            />

            {confirmPaid && (
                <ConfirmPaymentDialog
                    payment={confirmPaid}
                    loading={updateStatus.isPending}
                    onClose={() => setConfirmPaid(null)}
                    onSubmit={(values) => updateStatus.mutate({id: confirmPaid.id, ...values})}
                />
            )}

            <ConfirmDialog
                open={!!confirmCancel}
                title="Cancel payment?"
                description="The payment and its enrollment are both marked cancelled."
                confirmLabel="Cancel Payment"
                cancelLabel="Keep"
                loading={updateStatus.isPending}
                onCancel={() => setConfirmCancel(null)}
                onConfirm={() => updateStatus.mutate({id: confirmCancel.id, status: 'cancelled'})}
            />

            <ConfirmDialog
                open={!!confirmDelete}
                title="Delete payment?"
                description="This payment record will be permanently removed."
                confirmLabel="Delete"
                loading={remove.isPending}
                onCancel={() => setConfirmDelete(null)}
                onConfirm={() => remove.mutate(confirmDelete.id)}
            />
        </>
    )
}

export default AdminPaymentsPage
