import * as Lucide from 'lucide-react'

export function Icon({name, size = 18, color, style, ...rest}) {
    const Cmp = Lucide[toPascal(name)]
    if (!Cmp) return null
    return <Cmp size={size} color={color} style={style} aria-hidden {...rest}/>
}

function toPascal(name) {
    return name
        .split('-')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join('')
}

export default Icon
