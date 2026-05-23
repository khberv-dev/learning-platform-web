import {Button} from '@/ui/components/button/index.jsx'

export function ConfirmDialog({
    open,
    title = 'Are you sure?',
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
    loading = false,
}) {
    if (!open) return null
    return (
        <div className="it-dialog__backdrop" onClick={onCancel}>
            <div className="it-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="it-dialog__title">{title}</div>
                {description && <div className="it-dialog__body">{description}</div>}
                <div className="it-dialog__actions">
                    <Button variant="secondary" size="lg" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
                    <Button variant={variant} size="lg" onClick={onConfirm} disabled={loading}>{confirmLabel}</Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
