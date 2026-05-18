export default function DataTable({columns, rows, emptyText = 'No data'}) {
    return (
        <div
            style={{
                background: 'var(--it-surface)',
                border: '1px solid var(--it-border)',
                borderRadius: 'var(--it-radius-lg)',
                boxShadow: 'var(--it-shadow-sm)',
                overflow: 'hidden',
            }}
        >
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                <tr>
                    {columns.map((c, i) => (
                        <th
                            key={i}
                            style={{
                                textAlign: c.align ?? 'left',
                                padding: '14px 22px',
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--it-text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: 0.6,
                                background: 'var(--it-surface-hover)',
                                borderBottom: '1px solid var(--it-border)',
                            }}
                        >
                            {c.title}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rows.length === 0 && (
                    <tr>
                        <td
                            colSpan={columns.length}
                            style={{
                                padding: 32,
                                textAlign: 'center',
                                color: 'var(--it-text-secondary)',
                                fontSize: 14,
                            }}
                        >
                            {emptyText}
                        </td>
                    </tr>
                )}
                {rows.map((row, ri) => (
                    <tr
                        key={row.id ?? ri}
                        style={{
                            borderTop: '1px solid var(--it-border)',
                            transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--it-surface-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        {columns.map((c, ci) => (
                            <td
                                key={ci}
                                style={{
                                    padding: '14px 22px',
                                    fontSize: 14,
                                    color: 'var(--it-text-primary)',
                                    verticalAlign: 'middle',
                                    textAlign: c.align ?? 'left',
                                }}
                            >
                                {c.render ? c.render(row, ri) : row[c.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}
