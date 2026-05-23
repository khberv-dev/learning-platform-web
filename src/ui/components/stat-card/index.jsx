import {Icon} from '@/ui/components/icon/index.jsx'

const tones = {
    blue:   {bg: 'var(--it-info-bg)',   fg: 'var(--it-info-text)'},
    orange: {bg: 'var(--it-orange-bg)', fg: 'var(--it-orange-text)'},
    violet: {bg: 'var(--it-violet-bg)', fg: 'var(--it-violet-text)'},
    green:  {bg: 'var(--it-success-bg)', fg: 'var(--it-success-text)'},
    red:    {bg: 'var(--it-danger-bg)', fg: 'var(--it-danger-text)'},
    yellow: {bg: 'var(--it-warning-bg)', fg: 'var(--it-warning-text)'},
}

export function StatCard({icon, tone = 'blue', value, label, delta}) {
    const t = tones[tone] ?? tones.blue

    return (
        <div className="it-stat">
            <div className="it-stat__head">
                <span className="it-stat__icon" style={{background: t.bg, color: t.fg}}>
                    <Icon name={icon} size={20}/>
                </span>
                {delta && (
                    <span className={`it-stat__delta ${delta.dir === 'down' ? 'it-stat__delta--down' : 'it-stat__delta--up'}`}>
                        <Icon name={delta.dir === 'down' ? 'arrow-down-right' : 'arrow-up-right'} size={12}/>
                        {delta.value}
                    </span>
                )}
            </div>
            <div className="it-stat__value">{value}</div>
            <div className="it-stat__label">{label}</div>
        </div>
    )
}

export default StatCard
