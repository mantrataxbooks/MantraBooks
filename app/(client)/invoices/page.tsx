'use client'
import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then(data => { setInvoices(data.invoices || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const downloadPDF = async (id: string, invoiceNo: string) => {
    setDownloading(id)
    const res = await fetch(`/api/invoices/${id}/pdf`)
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNo}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    }
    setDownloading(null)
  }

  const filtered = invoices.filter(inv =>
    !filter || inv.status === filter
  )

  return (
    <>
      <div className="pg-title">My Invoices</div>
      <div className="pg-sub">View and download all your invoices.</div>

      <div className="card">
        <div className="card-header">
          <h3>All Invoices ({filtered.length})</h3>
          <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Type</th>
                  <th>Subtotal</th>
                  <th>GST</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Paid On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No invoices found.</td></tr>
                ) : filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: 'var(--red)' }}>{inv.invoiceNo}</td>
                    <td><span className={`badge b-${inv.type.toLowerCase()}`}>{inv.type}</span></td>
                    <td>{formatCurrency(Number(inv.subtotal))}</td>
                    <td>{formatCurrency(Number(inv.gstAmount))}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(Number(inv.total))}</td>
                    <td><span className={`badge b-${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td>{formatDate(inv.paidAt)}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => downloadPDF(inv.id, inv.invoiceNo)}
                        disabled={downloading === inv.id}
                      >
                        {downloading === inv.id ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-file-pdf" /> PDF</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary cards */}
      {!loading && invoices.length > 0 && (
        <div className="stats-row">
          {[
            { label: 'Total Billed', value: formatCurrency(invoices.reduce((s, i) => s + Number(i.total), 0)), color: 'rgba(52,152,219,.12)', iconColor: 'var(--info)', icon: 'fa-rupee-sign' },
            { label: 'Total Paid', value: formatCurrency(invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.total), 0)), color: 'rgba(39,174,96,.12)', iconColor: 'var(--ok)', icon: 'fa-check-circle' },
            { label: 'Pending Amount', value: formatCurrency(invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + Number(i.total), 0)), color: 'rgba(243,156,18,.12)', iconColor: 'var(--warn)', icon: 'fa-clock' },
          ].map((s) => (
            <div key={s.label} className="stat-box">
              <div className="si" style={{ background: s.color, color: s.iconColor }}><i className={`fas ${s.icon}`} /></div>
              <div className="sv" style={{ fontSize: '1.2rem' }}>{s.value}</div>
              <div className="sl">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
