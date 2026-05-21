import { useMemo, useState } from 'react'
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  CaretLeft,
  CaretRight,
  DotsThreeVertical,
} from '@phosphor-icons/react'
import {
  EXCEPTION_ROWS,
  SEVERITY_LABEL,
  type ExceptionRow,
} from '../data/exceptions'

const COLUMNS = [
  { key: 'severity', label: 'Severity', cls: 'col-severity' },
  { key: 'type', label: 'Type', cls: 'col-type' },
  { key: 'route', label: 'Route', cls: 'col-route' },
  { key: 'order', label: 'Order', cls: 'col-order' },
  { key: 'stop', label: 'Pickup → Drop-off', cls: 'col-stop' },
  { key: 'driver', label: 'Driver', cls: 'col-driver' },
  { key: 'detected', label: 'Detected', cls: 'col-detected' },
] as const

export function ExceptionsTable({
  onOpenDrawer,
}: {
  onOpenDrawer: (row: ExceptionRow) => void
}) {
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [page, setPage] = useState(1)

  const total = EXCEPTION_ROWS.length
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
  const currentPage = Math.min(page, totalPages)

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return EXCEPTION_ROWS.slice(start, start + rowsPerPage)
  }, [currentPage, rowsPerPage])

  return (
    <div className="table-section">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} className={c.cls}>
                  {c.label}
                </th>
              ))}
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <Row key={r.id} row={r} onSelect={() => onOpenDrawer(r)} />
            ))}
          </tbody>
        </table>
        {!pageRows.length && (
          <div className="empty-state">No exceptions match your filter.</div>
        )}
      </div>

      <div className="table-footer">
        <span className="row-count">{total} row(s)</span>
        <div className="pagination-controls">
          <div className="rows-per-page">
            Rows per page
            <select
              className="rpp-select"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(1)
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <div className="page-nav">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
              title="First page"
            >
              <CaretDoubleLeft size={13} />
            </button>
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              title="Previous page"
            >
              <CaretLeft size={13} />
            </button>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              title="Next page"
            >
              <CaretRight size={13} />
            </button>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setPage(totalPages)}
              title="Last page"
            >
              <CaretDoubleRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  row,
  onSelect,
}: {
  row: ExceptionRow
  onSelect: () => void
}) {
  return (
    <tr onClick={onSelect}>
      <td className="col-severity">
        <span className={`badge badge-${row.severity}`}>
          <span className="dot" />
          {SEVERITY_LABEL[row.severity]}
        </span>
      </td>
      <td className="col-type">{row.type}</td>
      <td className="col-route">{row.route}</td>
      <td className="col-order">{row.order}</td>
      <td className="col-stop">
        <div className="addr">
          <div className="line1">{row.pickup} →</div>
          <div className="line2">{row.dropoff}</div>
        </div>
      </td>
      <td className="col-driver">{row.driver}</td>
      <td className="col-detected">{row.detected}</td>
      <td className="col-actions">
        <button
          className="row-action-btn"
          title="More actions"
          onClick={(e) => e.stopPropagation()}
        >
          <DotsThreeVertical size={14} weight="bold" />
        </button>
      </td>
    </tr>
  )
}
