import {Card, Skeleton} from '@gravity-ui/uikit';

// `breakdown` is an optional [{key, label, value, color}] list rendered under
// the value, for a total that splits into parts.
function StatCard({label, value, icon: Icon, loading, breakdown}) {
    return (
        <Card view="outlined" style={{padding: 16, display: 'flex', alignItems: 'center', gap: 14}}>
            {Icon && (
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--g-color-base-selection)',
                        color: 'var(--g-color-text-brand)',
                        flexShrink: 0,
                    }}
                >
                    <Icon size={20}/>
                </div>
            )}
            <div style={{minWidth: 0}}>
                <div style={{fontSize: 12, color: 'var(--g-color-text-secondary)'}}>{label}</div>
                {loading ? (
                    <Skeleton style={{width: 60, height: 24, marginTop: 4}}/>
                ) : (
                    <div style={{fontSize: 22, fontWeight: 600, lineHeight: '28px'}}>{value ?? '—'}</div>
                )}
                {breakdown && !loading && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            columnGap: 12,
                            rowGap: 2,
                            marginTop: 4,
                            fontSize: 12,
                            color: 'var(--g-color-text-secondary)',
                        }}
                    >
                        {breakdown.map((item) => (
                            <span key={item.key} style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                                {item.color && (
                                    <span
                                        style={{width: 8, height: 8, borderRadius: '50%', background: item.color}}
                                    />
                                )}
                                {item.label}:
                                <span style={{color: 'var(--g-color-text-primary)', fontWeight: 600}}>
                                    {item.value ?? '—'}
                                </span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}

export default StatCard;
