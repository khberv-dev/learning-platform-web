import {Button} from '@gravity-ui/uikit';
import {ChevronLeft} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import Breadcrumbs from '@/ui/components/breadcrumbs.jsx';

// Pages own their own header rather than pushing a title up into the layout -
// each one renders this at the top of its content. `breadcrumbs` is the
// ancestor trail for pages that sit inside a hierarchy.
function PageHeader({title, description, actions, backTo, breadcrumbs}) {
    const navigate = useNavigate();

    return (
        <div style={{marginBottom: 20}}>
            {breadcrumbs && <Breadcrumbs items={breadcrumbs}/>}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: 10, minWidth: 0}}>
                    {backTo && (
                        <Button
                            view="flat"
                            size="l"
                            pin="circle-circle"
                            onClick={() => navigate(backTo)}
                            aria-label="Back"
                        >
                            <Button.Icon>
                                <ChevronLeft size={18}/>
                            </Button.Icon>
                        </Button>
                    )}
                    <div style={{minWidth: 0}}>
                        <h1 style={{fontSize: 22, fontWeight: 600, margin: 0}}>{title}</h1>
                        {description && (
                            <div style={{fontSize: 13, color: 'var(--g-color-text-secondary)', marginTop: 4}}>
                                {description}
                            </div>
                        )}
                    </div>
                </div>
                {actions && <div style={{display: 'flex', gap: 8, flexShrink: 0}}>{actions}</div>}
            </div>
        </div>
    );
}

export default PageHeader;
