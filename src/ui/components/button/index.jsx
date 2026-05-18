import {Button as GButton} from "@gravity-ui/uikit";
import Icon from "@/ui/components/icon/index.jsx";

const VARIANT_VIEW = {
    primary: 'action',
    secondary: 'outlined',
    ghost: 'flat',
    danger: 'outlined-danger',
}

const VARIANT_ICON_COLOR = {
    primary: '#FFFFFF',
    secondary: 'currentColor',
    ghost: 'currentColor',
    danger: 'var(--it-danger-text)',
}

export default function Button({
                                   variant = 'primary',
                                   size = 'l',
                                   icon,
                                   iconRight,
                                   children,
                                   style,
                                   ...props
                               }) {
    const view = VARIANT_VIEW[variant] ?? 'action'
    const iconColor = VARIANT_ICON_COLOR[variant]

    return (
        <GButton view={view} size={size} style={style} {...props}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                {icon && <Icon name={icon} size={16} color={iconColor}/>}
                {children && <span>{children}</span>}
                {iconRight && <Icon name={iconRight} size={16} color={iconColor}/>}
            </span>
        </GButton>
    )
}

export function IconButton({icon, tone = 'neutral', size = 'm', ...props}) {
    const color =
        tone === 'danger' ? 'var(--it-danger-text)' :
            tone === 'brand' ? 'var(--it-green-700)' :
                'var(--it-text-secondary)'

    return (
        <GButton view={'flat'} size={size} {...props}>
            <Icon name={icon} size={16} color={color}/>
        </GButton>
    )
}
