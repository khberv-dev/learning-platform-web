import {Pagination, Table, withTableSorting} from '@gravity-ui/uikit';
import {QueryState} from '@/ui/components/stateViews.jsx';
import {PAGE_SIZE_OPTIONS} from '@/shared/pagination.js';

// Built once at module scope - rebuilding it per render would remount the
// table on every keystroke.
const SortableTable = withTableSorting(Table);

// Wraps Gravity's Table with the loading / error / empty states and the
// pagination footer every list page in this app needs.
//
// `query` is the react-query result whose data is the API's paginated envelope
// ({data, total, page, limit, totalPages}). Pass `rows` directly instead for
// endpoints that return a bare array.
//
// Sorting is server-side: mark a column with `meta: {sort: true}` and pass
// `sortBy`/`sortOrder`/`onSortChange`. The column's `id` must be the field name
// the API accepts, since it is sent verbatim as `sortBy`.
function DataTable({
    query,
    columns,
    rows,
    getRowId,
    onRowClick,
    page,
    limit,
    onPageChange,
    emptyTitle,
    sortBy,
    sortOrder,
    onSortChange,
    defaultSortBy = 'createdAt',
}) {
    const envelope = query?.data;
    const items = rows ?? envelope?.data ?? [];
    const total = envelope?.total ?? items.length;

    // Keyed off the *smallest* page size rather than the current one: at 50/page
    // with 20 rows there's a single page, but hiding the control would strand
    // the user with no way to switch back down to 15.
    const paginated = Boolean(onPageChange) && total > PAGE_SIZE_OPTIONS[0];

    const sortable = Boolean(onSortChange);

    // Gravity models sort as a list (it supports shift-click multi-sort) in
    // lowercase; the API takes a single uppercase field + direction.
    const sortState = sortable && sortBy ? [{column: sortBy, order: String(sortOrder).toLowerCase()}] : [];

    const handleSortStateChange = (nextState) => {
        // A third click clears the column. The API always sorts by something,
        // so fall back to the page's default rather than sending nothing.
        const next = nextState.at(-1);
        if (!next) {
            onSortChange(defaultSortBy, 'DESC');
            return;
        }
        onSortChange(next.column, next.order.toUpperCase());
    };

    const tableProps = sortable
        ? {
              sortState,
              onSortStateChange: handleSortStateChange,
              // The rows on screen are one server-sorted page; re-sorting them
              // client-side would only shuffle that page.
              disableDataSorting: true,
          }
        : {};

    // The row area scrolls and the pagination stays with the table rather than
    // being pushed below the fold - see the .page-fill notes in index.css.
    return (
        <QueryState query={query} isEmpty={items.length === 0} emptyTitle={emptyTitle}>
            <div className="data-table">
                <div className="data-table__scroll">
                    <SortableTable
                        data={items}
                        columns={columns}
                        getRowId={getRowId ?? ((row) => row.id)}
                        onRowClick={onRowClick}
                        getRowClassNames={onRowClick ? () => ['data-table__row_clickable'] : undefined}
                        width="max"
                        {...tableProps}
                    />
                </div>
                {paginated && (
                    <div className="data-table__footer">
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
