import {Icon} from '@/ui/components/icon/index.jsx'

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    full = false,
    type = 'button',
    className = '',
    ...rest
}) {
    const cls = [
        'it-btn',
        `it-btn--${variant}`,
        `it-btn--${size}`,
        full && 'it-btn--full',
        className,
    ].filter(Boolean).join(' ')

    return (
        <button type={type} className={cls} {...rest}>
            {leftIcon && <Icon name={leftIcon} size={size === 'xl' ? 18 : 16}/>}
            {children}
            {rightIcon && <Icon name={rightIcon} size={size === 'xl' ? 18 : 16}/>}
        </button>
    )
}

export function IconButton({icon, size = 16, title, className = '', ...rest}) {
    return (
        <button type="button" title={title} className={`it-btn it-btn--icon ${className}`} {...rest}>
            <Icon name={icon} size={size}/>
        </button>
    )
}

export default Button
