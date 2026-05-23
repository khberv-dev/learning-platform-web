import {Icon} from '@/ui/components/icon/index.jsx'

export function Pagination({page = 1, totalPages = 1, onChange}) {
    if (totalPages <= 1) return null
    const pages = makeRange(page, totalPages)
    return (
        <div className="it-pagination">
            <button
                className="it-pagination__btn"
                onClick={() => onChange?.(page - 1)}
                disabled={page <= 1}
                aria-label="Previous"
            >
                <Icon name="chevron-left" size={16}/>
            </button>
            {pages.map((p, i) => p === '…' ? (
                <span key={`gap-${i}`} className="it-pagination__btn" style={{background: 'transparent', cursor: 'default'}}>…</span>
            ) : (
                <button
                    key={p}
                    className={`it-pagination__btn ${p === page ? 'it-pagination__btn--active' : ''}`}
                    onClick={() => onChange?.(p)}
                >
                    {p}
                </button>
            ))}
            <button
                className="it-pagination__btn"
                onClick={() => onChange?.(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next"
            >
                <Icon name="chevron-right" size={16}/>
            </button>
        </div>
    )
}

function makeRange(current, total) {
    const result = []
    const window = 1
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - window && i <= current + window)) {
            result.push(i)
        } else if (result[result.length - 1] !== '…') {
            result.push('…')
        }
    }
    return result
}

export default Pagination
