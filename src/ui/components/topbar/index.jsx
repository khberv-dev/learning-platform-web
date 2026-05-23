import {Icon} from '@/ui/components/icon/index.jsx'
import {Avatar} from '@/ui/components/avatar/index.jsx'
import {useHeader} from '@/providers/header.jsx'
import {useAuth} from '@/providers/auth.jsx'
import {fullName} from '@/utils/lib.js'

export function Topbar() {
    const {title, subtitle, onBack, actions} = useHeader()
    const {user} = useAuth() ?? {}
    const name = fullName(user) || 'User'

    return (
        <header className="it-topbar">
            <div className="it-topbar__left">
                {onBack && (
                    <button className="it-topbar__back" onClick={onBack} aria-label="Back">
                        <Icon name="chevron-left" size={20}/>
                    </button>
                )}
                <div style={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
                    <h1 className="it-topbar__title">{title}</h1>
                    {subtitle && <span className="it-topbar__subtitle">{subtitle}</span>}
                </div>
            </div>
            <div className="it-topbar__right">
                {actions}
                <span className="it-topbar__bell" role="button" aria-label="Notifications">
                    <Icon name="bell" size={20}/>
                </span>
                <Avatar name={name} size={36}/>
            </div>
        </header>
    )
}

export default Topbar
