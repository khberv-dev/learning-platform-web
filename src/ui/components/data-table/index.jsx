export function DataTable({
    columns,
    data,
    loading = false,
    empty = 'No data',
    rowKey = 'id',
    footer,
    onRowClick,
}) {
    const rows = data ?? []

    return (
        <div className="it-table">
            <div className="it-table__head">
                {columns.map((col, i) => (
                    <div
                        key={col.key ?? i}
                        className="it-table__cell"
                        style={cellStyle(col)}
                    >
                        {col.header}
                    </div>
                ))}
            </div>
            {loading && rows.length === 0 ? (
                <div className="it-table__empty">Loading…</div>
            ) : rows.length === 0 ? (
                <div className="it-table__empty">{empty}</div>
            ) : rows.map((row, idx) => (
                <div
                    key={row[rowKey] ?? idx}
                    className="it-table__row"
                    onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                    style={{cursor: onRowClick ? 'pointer' : 'default'}}
                >
                    {columns.map((col, i) => (
                        <div
                            key={col.key ?? i}
                            className="it-table__cell"
                            style={cellStyle(col)}
                        >
                            {col.render ? col.render(row, idx) : row[col.key]}
                        </div>
                    ))}
                </div>
            ))}
            {footer && <div className="it-table__footer">{footer}</div>}
        </div>
    )
}

function cellStyle(col) {
    return {
        width: col.width,
        flex: col.width ? 'none' : 1,
        textAlign: col.align ?? 'left',
        color: col.muted ? 'var(--it-text-tertiary)' : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: col.gap,
        justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
    }
}

export default DataTable
