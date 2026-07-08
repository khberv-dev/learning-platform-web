export function UploadProgress({progress}) {
    if (progress == null) return null
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: 12, color: 'var(--it-text-secondary)'}}>Uploading…</span>
                <span style={{fontSize: 12, fontWeight: 700, color: 'var(--it-text-primary)'}}>{progress}%</span>
            </div>
            <div style={{height: 4, borderRadius: 999, background: 'var(--it-surface-alt)', overflow: 'hidden'}}>
                <div style={{
                    height: '100%',
                    borderRadius: 999,
                    background: 'var(--it-info-text)',
                    width: `${progress}%`,
                    transition: 'width 0.15s ease',
                }}/>
            </div>
        </div>
    )
}

export default UploadProgress
