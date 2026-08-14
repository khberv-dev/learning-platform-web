import {Card} from '@gravity-ui/uikit';

// The standard page block: an optional title row with actions, then content.
//
// `className` exists so list pages can pass `page-fill__section`, which turns
// the card into the flex column the scrolling table needs.
function PageSection({title, description, actions, children, style, className}) {
    return (
        <Card view="outlined" className={className} style={{padding: 20, ...style}}>
            {(title || actions) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 16,
                        marginBottom: children ? 16 : 0,
                        flexShrink: 0,
                    }}
                >
                    <div style={{minWidth: 0}}>
                        {title && <div style={{fontSize: 16, fontWeight: 600}}>{title}</div>}
                        {description && (
                            <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)', marginTop: 4}}>
                                {description}
                            </div>
                        )}
                    </div>
                    {actions && <div style={{display: 'flex', gap: 8, flexShrink: 0}}>{actions}</div>}
                </div>
            )}
            {children}
        </Card>
    );
}

export default PageSection;
