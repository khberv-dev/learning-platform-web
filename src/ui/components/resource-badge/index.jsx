const map = {
    active: {label: 'Active', bg: 'var(--it-success-bg)', fg: 'var(--it-success-text)'},
    inactive: {label: 'Inactive', bg: 'var(--it-danger-bg)', fg: 'var(--it-danger-text)'},
    suspended: {label: 'Suspended', bg: 'var(--it-warning-bg)', fg: 'var(--it-warning-text-strong)'},
    fired: {label: 'Fired', bg: 'var(--it-danger-bg)', fg: 'var(--it-danger-text)'},
    pending: {label: 'Pending', bg: 'var(--it-warning-bg)', fg: 'var(--it-warning-text-strong)'},
    expired: {label: 'Expired', bg: 'var(--it-surface-alt)', fg: 'var(--it-text-secondary)'},
    rejected: {label: 'Rejected', bg: 'var(--it-danger-bg)', fg: 'var(--it-danger-text)'},
}

export function ResourceBadge({status, label, withDot = false, size = 'md'}) {
    const key = typeof status === 'string' ? status.toLowerCase() : status
    const s = map[key] ?? {label: label ?? status, bg: 'var(--it-surface-alt)', fg: 'var(--it-text-body)'}
    return (
        <span
            className="it-badge"
            style={{
                background: s.bg,
                color: s.fg,
                height: size === 'sm' ? 22 : 26,
                fontSize: size === 'sm' ? 11 : 12,
                padding: size === 'sm' ? '0 10px' : '0 12px',
            }}
        >
            {withDot && (
                <span style={{width: 8, height: 8, borderRadius: 999, background: s.fg}}/>
            )}
            {label ?? s.label}
        </span>
    )
}

export default ResourceBadge
