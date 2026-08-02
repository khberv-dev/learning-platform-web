import {Icon} from '@/ui/components/icon/index.jsx'
import {cdnUrl} from '@/services/config.js'

export function PaymentTypeIcon({type, size = 36}) {
    const url = type?.icon ? cdnUrl(type.icon) : null

    return (
        <span
            style={{
                width: size, height: size, borderRadius: 8, flex: 'none',
                background: 'var(--it-surface-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--it-text-secondary)', overflow: 'hidden',
            }}
        >
            {url
                ? <img src={url} alt={type?.title ?? ''} style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
                : <Icon name="credit-card" size={Math.round(size * 0.5)}/>}
        </span>
    )
}

export default PaymentTypeIcon
