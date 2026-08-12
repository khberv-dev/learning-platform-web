import {Breadcrumbs as GravityBreadcrumbs} from '@gravity-ui/uikit';
import {useNavigate} from 'react-router-dom';

// `items` is the ancestor trail: [{title, to}, ...] ending with the current
// page, whose `to` is omitted (Gravity marks the last item as current).
//
// Items keep a real `href` so middle-click and "open in new tab" behave like
// links, but a plain click is intercepted and routed through React Router
// instead of reloading the app.
function Breadcrumbs({items}) {
    const navigate = useNavigate();

    if (!items?.length) return null;

    return (
        // Gravity collapses the trail by measured width, dropping leading
        // items into a "..." menu. `showRoot` pins the first crumb - the
        // section root, the most useful jump target - so only the middle
        // collapses on a narrow viewport.
        <GravityBreadcrumbs showRoot style={{marginBottom: 8}}>
            {items.map((item, index) => (
                <GravityBreadcrumbs.Item
                    key={item.to ?? `current-${index}`}
                    href={item.to}
                    onClick={(event) => {
                        if (!item.to) return;
                        // Let the browser handle modified clicks (new tab etc).
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                        event.preventDefault();
                        navigate(item.to);
                    }}
                >
                    {item.title}
                </GravityBreadcrumbs.Item>
            ))}
        </GravityBreadcrumbs>
    );
}

export default Breadcrumbs;
