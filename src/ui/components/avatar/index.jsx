import {colorFromString, initials} from '@/utils/lib.js'
import {cdnUrl} from '@/services/config.js'

export function Avatar({name, src, size = 36, fontSize, style, className = ''}) {
    const colors = colorFromString(name)
    const url = src ? cdnUrl(src) : null
    const fs = fontSize ?? Math.max(11, Math.round(size * 0.4))

    return (
        <span
            className={`it-avatar ${className}`}
            style={{
                width: size,
                height: size,
                background: url ? 'transparent' : colors.bg,
                color: colors.fg,
                fontSize: fs,
                ...style,
            }}
            aria-label={name}
        >
            {url ? <img src={url} alt={name}/> : initials(name)}
        </span>
    )
}

export default Avatar
