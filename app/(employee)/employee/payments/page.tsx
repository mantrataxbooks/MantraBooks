'use client'
import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function EmployeePayments() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/invoices?all=true&status=${filter}`)
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  const downloadPDF = async (id: string, invoiceNo: string) => {
    setDownloading(id)
    const res = await fetch(`/api/invoices/${id}/pdf`)
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${invoiceNo}.pdf`; a.click()
      URL.revokeObjectURL(url)
    }
    setDownloading(null)
  }

  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((s: number, i: any) => s + Number(i.total), 0)
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((s: number, i: any) => s + Number(i.total), 0)

  return (
    <>
      <div className="pg-title">Payment Records</div>
      <div className="pg-sub">Monitor invoices and payment activity.</div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="si" style={{ background: 'rgba(243,156,18,.12)', color: 'var(--warn)' }}><i className="fas fa-clock" /></div>
          <div className="sv" style={{ fontSize: '1.2rem' }}>{formatCurrency(totalPending)}</div>
          <div className="sl">Pending Amount</div>
        </div>
        <div className="stat-box">
          <div className="si" style={{ background: 'rgba(39,174,96,.12)', color: 'var(--ok)' }}><i className="fas fa-check-circle" /></div>
          <div className="sv" style={{ fontSize: '1.2rem' }}>{formatCurrency(totalPaid)}</div>
          <div className="sl">Paid Amount</div>
        </div>
        <div className="stat-box">
          <div className="si" style={{ background: 'rgba(52,152,219,.12)', color: 'var(--info)' }}><i className="fas fa-file-invoice" /></div>
          <div className="sv">{invoices.length}</div>
          <div className="sl">Total Invoices</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Invoices</h3>
          <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All</option>
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
              <thead><tr><th>Invoice No</th><th>Client</th><th>Type</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Paid On</th><th></th></tr></thead>
              <tbody>
                {invoices.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No invoices found.</td></tr>
                  : invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700, color: 'var(--red)' }}>{inv.invoiceNo}</td>
                      <td>{inv.client?.name}</td>
                      <td><span className={`badge b-${inv.type.toLowerCase()}`}>{inv.type}</span></td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(Number(inv.total))}</td>
                      <td><span className={`badge b-${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                      <td>{formatDate(inv.dueDate)}</td>
                      <td>{formatDate(inv.paidAt)}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => downloadPDF(inv.id, inv.invoiceNo)} disabled={downloading === inv.id}>
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
    </>
  )
}
