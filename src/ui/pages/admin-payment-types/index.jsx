import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {useHeader} from '@/providers/header.jsx'
import {
    useGetPaymentTypes,
    useCreatePaymentType,
    useUpdatePaymentType,
    useDeletePaymentType,
} from '@/services/payment/query.js'
import {Button, IconButton} from '@/ui/components/button/index.jsx'
import {DataTable} from '@/ui/components/data-table/index.jsx'
import {Toolbar} from '@/ui/components/toolbar/index.jsx'
import {Input} from '@/ui/components/input/index.jsx'
import {FormField} from '@/ui/components/form-field/index.jsx'
import {ImageUpload} from '@/ui/components/image-upload/index.jsx'
import {ConfirmDialog} from '@/ui/components/confirm-dialog/index.jsx'
import {Switch} from '@/ui/components/switch/index.jsx'
import {PaymentTypeIcon} from '@/ui/components/payment-type-icon/index.jsx'

// Mounted only while open, so the initial values below double as a reset.
function PaymentTypeDialog({initial, loading, onClose, onSubmit}) {
    const [title, setTitle] = useState(initial?.title ?? '')
    const [url, setUrl] = useState(initial?.url ?? '')
    // Existing path string → preview only; replaced only if a File is picked.
    const [icon, setIcon] = useState(initial?.icon ?? null)
    const [isActive, setIsActive] = useState(initial ? !!initial.isActive : true)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!title.trim()) return
        const data = {title: title.trim(), url: url.trim(), isActive}
        // Only send the icon field when a new file was picked.
        if (icon instanceof File) data.icon = icon
        onSubmit(data)
    }

    return (
        <div className="it-dialog__backdrop" onClick={onClose}>
            <form className="it-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="it-dialog__title">{initial ? 'Edit Payment Type' : 'Add Payment Type'}</div>

                <ImageUpload
                    value={icon}
                    onChange={setIcon}
                    hint={initial ? 'Leave as-is to keep the current icon.' : 'Logo of the payment provider (SVG, PNG or JPG).'}
                />

                <FormField label="Title">
                    <Input placeholder="e.g. Payme" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus/>
                </FormField>

                <FormField label="URL" hint="Checkout link the student is redirected to.">
                    <Input placeholder="https://checkout.paycom.uz/..." value={url} onChange={(e) => setUrl(e.target.value)}/>
                </FormField>

                <FormField label="Status">
                    <div style={{height: 44, display: 'flex', alignItems: 'center'}}>
                        <Switch checked={isActive} onChange={setIsActive} label={isActive ? 'Active' : 'Inactive'}/>
                    </div>
                </FormField>

                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={!title.trim() || loading}>
                        {loading ? 'Saving…' : initial ? 'Save Changes' : 'Add Payment Type'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export function AdminPaymentTypesPage() {
    const {setHeader} = useHeader()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [dialog, setDialog] = useState(null)   // null | {} | { ...paymentType }
    const [confirm, setConfirm] = useState(null)

    useEffect(() => {
        setHeader({title: 'Payment Types', onBack: () => navigate('/admin/payments')})
        return () => setHeader({})
    }, [setHeader, navigate])

    const {data, isLoading} = useGetPaymentTypes()
    const create = useCreatePaymentType({onSuccess: () => setDialog(null)})
    const update = useUpdatePaymentType({onSuccess: () => setDialog(null)})
    const remove = useDeletePaymentType({onSuccess: () => setConfirm(null)})

    const items = data?.data ?? (Array.isArray(data) ? data : [])
    const filtered = search
        ? items.filter(t => (t.title ?? '').toLowerCase().includes(search.toLowerCase()))
        : items

    const editing = dialog?.id ? dialog : null

    const handleSubmit = (values) => {
        if (editing) update.mutate({id: editing.id, data: values})
        else create.mutate(values)
    }

    return (
        <>
            <Toolbar search={search} onSearchChange={setSearch} placeholder="Search payment types...">
                <Button leftIcon="plus" onClick={() => setDialog({})}>Add Payment Type</Button>
            </Toolbar>

            <DataTable
                loading={isLoading}
                empty="No payment types yet"
                data={filtered}
                rowKey="id"
                columns={[
                    {key: 'num', header: '#', width: 40, muted: true, render: (_, i) => i + 1},
                    {key: 'title', header: 'Payment Type', gap: 12, render: (t) => (
                        <>
                            <PaymentTypeIcon type={t}/>
                            <span style={{color: 'var(--it-text-primary)', fontWeight: 500}}>{t.title}</span>
                        </>
                    )},
                    {key: 'url', header: 'URL', render: (t) => t.url
                        ? (
                            <a
                                href={t.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{color: 'var(--it-green)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
                            >
                                {t.url}
                            </a>
                        )
                        : '—'},
                    {key: 'status', header: 'Status', width: 150, render: (t) => (
                        <div onClick={(e) => e.stopPropagation()}>
                            <Switch
                                checked={!!t.isActive}
                                disabled={update.isPending}
                                label={t.isActive ? 'Active' : 'Inactive'}
                                onChange={(next) => update.mutate({id: t.id, data: {isActive: next}})}
                            />
                        </div>
                    )},
                    {key: 'actions', header: 'Actions', width: 100, render: (t) => (
                        <div style={{display: 'flex', gap: 8}}>
                            <IconButton icon="pencil" title="Edit" onClick={(e) => {e.stopPropagation(); setDialog(t)}}/>
                            <IconButton icon="trash-2" title="Delete" onClick={(e) => {e.stopPropagation(); setConfirm(t)}}/>
                        </div>
                    )},
                ]}
                onRowClick={(t) => setDialog(t)}
                footer={<span>{filtered.length} payment type{filtered.length === 1 ? '' : 's'}</span>}
            />

            {dialog && (
                <PaymentTypeDialog
                    initial={editing}
                    loading={create.isPending || update.isPending}
                    onClose={() => setDialog(null)}
                    onSubmit={handleSubmit}
                />
            )}

            <ConfirmDialog
                open={!!confirm}
                title="Delete payment type?"
                description={`"${confirm?.title}" will be permanently removed.`}
                confirmLabel="Delete"
                loading={remove.isPending}
                onCancel={() => setConfirm(null)}
                onConfirm={() => remove.mutate(confirm.id)}
            />
        </>
    )
}

export default AdminPaymentTypesPage
