import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {useGetPayments, useGetPaymentTypes, useDeletePayment} from '@/services/payment/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {DataTable} from '@/ui/components/data-table/index.jsx'
import {Toolbar} from '@/ui/components/toolbar/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {Pagination} from '@/ui/components/pagination/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {PaymentTypeIcon} from '@/ui/components/payment-type-icon/index.jsx'
import {fullName, formatDate} from '@/utils/lib.js'

const selectStyle = {
    height: 36, padding: '0 12px',
    background: 'var(--it-surface-input)',
    border: '1px solid var(--it-border-strong)',
    borderRadius: 8, fontSize: 13,
}

export function AdminPaymentsPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [paymentTypeId, setPaymentTypeId] = useState('')
    const [confirm, setConfirm] = useState(null)
    const limit = 10

    useEffect(() => { setHeader({title: 'Payments'}); return () => setHeader({}) }, [setHeader])

    const {data, isLoading} = useGetPayments({page, limit, paymentTypeId})
    const {data: typesData} = useGetPaymentTypes()
    const remove = useDeletePayment({onSuccess: () => setConfirm(null)})

    const types = typesData?.data ?? (Array.isArray(typesData) ? typesData : [])
    const items = data?.data ?? []
    const filtered = search
        ? items.filter(p => fullName(p.user).toLowerCase().includes(search.toLowerCase()))
        : items
    const totalPages = data?.totalPages ?? 1
    const total = data?.total ?? 0

    return (
        <>
            <Toolbar search={search} onSearchChange={setSearch} placeholder="Search by student...">
                <select
                    value={paymentTypeId}
                    onChange={(e) => { setPaymentTypeId(e.target.value); setPage(1) }}
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
                                {fullName(p.user) || `User #${p.userId}`}
                            </span>
                        </>
                    )},
                    {key: 'type', header: 'Payment Type', width: 200, gap: 10, render: (p) => (
                        <>
                            <PaymentTypeIcon type={p.paymentType} size={28}/>
                            <span>{p.paymentType?.title ?? '—'}</span>
                        </>
                    )},
                    {key: 'enrollment', header: 'Enrollment', render: (p) => enrollmentLabel(p)},
                    {key: 'date', header: 'Date', width: 170, render: (p) => formatDate(p.createdAt, true) || '—'},
                    {key: 'actions', header: 'Actions', width: 80, render: (p) => (
                        <IconButton icon="trash-2" title="Delete" onClick={(e) => {e.stopPropagation(); setConfirm(p)}}/>
                    )},
                ]}
                footer={
                    <>
                        <span>Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1}–{(page - 1) * limit + filtered.length} of {total} payments</span>
                        <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
                    </>
                }
            />

            <ConfirmDialog
                open={!!confirm}
                title="Delete payment?"
                description="This payment record will be permanently removed."
                confirmLabel="Delete"
                loading={remove.isPending}
                onCancel={() => setConfirm(null)}
                onConfirm={() => remove.mutate(confirm.id)}
            />
        </>
    )
}

function enrollmentLabel(payment) {
    const enrollment = payment.enrollment
    if (!enrollment && !payment.enrollmentId) {
        return <span style={{color: 'var(--it-text-tertiary)'}}>— (no enrollment)</span>
    }
    const course = enrollment?.course?.title
    return course ?? `Enrollment #${payment.enrollmentId}`
}

export default AdminPaymentsPage
