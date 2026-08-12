import {Card, Skeleton} from '@gravity-ui/uikit';

function StatCard({label, value, icon: Icon, loading}) {
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
            </div>
        </Card>
    );
}

export default StatCard;
