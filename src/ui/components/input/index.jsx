import {forwardRef, useState} from 'react'
import {Icon} from '@/ui/components/icon/index.jsx'

export const Input = forwardRef(function Input({
    leftIcon,
    rightIcon,
    onRightIconClick,
    invalid = false,
    size = 'lg',
    className = '',
    type = 'text',
    ...rest
}, ref) {
    const [reveal, setReveal] = useState(false)
    const isPassword = type === 'password'
    const actualType = isPassword && reveal ? 'text' : type

    const cls = [
        'it-input',
        size === 'sm' ? 'it-input--sm' : size === 'md' ? '' : 'it-input--lg',
        invalid && 'it-input--invalid',
        className,
    ].filter(Boolean).join(' ')

    return (
        <div className={cls}>
            {leftIcon && <Icon name={leftIcon} size={16} className="it-input__icon"/>}
            <input ref={ref} type={actualType} className="it-input__el" {...rest}/>
            {isPassword ? (
                <span className="it-input__addon" onClick={() => setReveal(v => !v)} role="button" tabIndex={-1}>
                    <Icon name={reveal ? 'eye-off' : 'eye'} size={16}/>
                </span>
            ) : rightIcon && (
                <span className="it-input__addon" onClick={onRightIconClick} role={onRightIconClick ? 'button' : undefined}>
                    <Icon name={rightIcon} size={16}/>
                </span>
            )}
        </div>
    )
})

export const Textarea = forwardRef(function Textarea({className = '', ...rest}, ref) {
    return <textarea ref={ref} className={`it-textarea ${className}`} {...rest}/>
})

export default Input
