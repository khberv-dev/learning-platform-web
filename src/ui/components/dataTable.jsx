import {Pagination, Table} from '@gravity-ui/uikit';
import {QueryState} from '@/ui/components/stateViews.jsx';
import {PAGE_SIZE_OPTIONS} from '@/shared/pagination.js';

// Wraps Gravity's Table with the loading / error / empty states and the
// pagination footer every list page in this app needs.
//
// `query` is the react-query result whose data is the API's paginated envelope
// ({data, total, page, limit, totalPages}). Pass `rows` directly instead for
// endpoints that return a bare array.
function DataTable({query, columns, rows, getRowId, onRowClick, page, limit, onPageChange, emptyTitle}) {
    const envelope = query?.data;
    const items = rows ?? envelope?.data ?? [];
    const total = envelope?.total ?? items.length;

    // Keyed off the *smallest* page size rather than the current one: at 50/page
    // with 20 rows there's a single page, but hiding the control would strand
    // the user with no way to switch back down to 15.
    const paginated = Boolean(onPageChange) && total > PAGE_SIZE_OPTIONS[0];

    return (
        <QueryState query={query} isEmpty={items.length === 0} emptyTitle={emptyTitle}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <div style={{overflowX: 'auto'}}>
                    <Table
                        data={items}
                        columns={columns}
                        getRowId={getRowId ?? ((row) => row.id)}
                        onRowClick={onRowClick}
                        getRowClassNames={onRowClick ? () => ['data-table__row_clickable'] : undefined}
                        width="max"
                    />
                </div>
                {paginated && (
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Pagination
                            page={page}
                            pageSize={limit}
                            total={total}
                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                            onUpdate={(nextPage, nextPageSize) => onPageChange(nextPage, nextPageSize)}
                            // `compact` (the default) drops the "previous"/"next"
                            // button labels and leaves the arrows alone.
                            compact
                        />
                    </div>
                )}
            </div>
        </QueryState>
    );
}

export default DataTable;
