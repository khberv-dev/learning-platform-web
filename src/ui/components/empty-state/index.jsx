import {Icon} from '@/ui/components/icon/index.jsx'

export function EmptyState({icon = 'inbox', title, hint, action}) {
    return (
        <div className="it-empty">
            <div className="it-empty__icon">
                <Icon name={icon} size={36}/>
            </div>
            {title && <div className="it-empty__title">{title}</div>}
            {hint && <div className="it-empty__hint">{hint}</div>}
            {action}
        </div>
    )
}

export default EmptyState
