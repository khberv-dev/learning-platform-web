import {Input} from '@/ui/components/input/index.jsx'

export function Toolbar({children, search, onSearchChange, placeholder = 'Search...', searchWidth = 300, style}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, ...style}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, flex: 1}}>
                {onSearchChange != null && (
                    <div style={{width: searchWidth, maxWidth: '100%'}}>
                        <Input
                            leftIcon="search"
                            placeholder={placeholder}
                            value={search ?? ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            size="sm"
                        />
                    </div>
                )}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                {children}
            </div>
        </div>
    )
}

export default Toolbar
