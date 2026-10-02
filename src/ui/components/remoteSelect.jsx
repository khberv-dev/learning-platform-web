import {useMemo, useState} from 'react';
import {Label, Select} from '@gravity-ui/uikit';
import FormField from '@/ui/components/formField.jsx';

// A server-searched Select. The options are only the current search page, so
// the picked items are remembered separately and merged back in - otherwise a
// selection would vanish from the list the moment the search text changed.
function RemoteSelect({label, hint, multiple, items, picked, onPick, onSearch, loading, getLabel}) {
    const [remembered, setRemembered] = useState({});

    const options = useMemo(() => {
        const byId = new Map(items.map((item) => [item.id, item]));
        picked.forEach((id) => {
            if (!byId.has(id) && remembered[id]) byId.set(id, remembered[id]);
        });
        return [...byId.values()];
    }, [items, picked, remembered]);

    const handleUpdate = (ids) => {
        setRemembered((current) => {
            const next = {...current};
            options.forEach((item) => {
                if (ids.includes(item.id)) next[item.id] = item;
            });
            return next;
        });
        onPick(ids);
    };

    return (
        <FormField label={label} hint={hint}>
            <Select
                size="l"
                width="max"
                multiple={multiple}
                filterable
                value={picked}
                onUpdate={handleUpdate}
                onFilterChange={onSearch}
                loading={loading}
                // The list is already filtered server-side.
                filterOption={() => true}
            >
                {options.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                        {getLabel(item)}
                    </Select.Option>
                ))}
            </Select>
            {/* The dropdown's own popup is portaled and can grow tall enough to
                cover the dialog's footer, so a pick made just before clicking
                Save isn't provable from the (now-closed) control alone. These
                chips stay put regardless of the dropdown's state, confirm what
                is actually about to be saved, and let a pick be undone without
                reopening the list. */}
            {multiple && picked.length > 0 && (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8}}>
                    {picked.map((id) => {
                        const item = options.find((option) => option.id === id);
                        return (
                            <Label
                                key={id}
                                theme="info"
                                type="close"
                                onCloseClick={() => handleUpdate(picked.filter((pickedId) => pickedId !== id))}
                            >
                                {item ? getLabel(item) : id}
                            </Label>
                        );
                    })}
                </div>
            )}
        </FormField>
    );
}

export default RemoteSelect;
