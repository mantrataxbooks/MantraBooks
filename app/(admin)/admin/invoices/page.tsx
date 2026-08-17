'use client'
import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [creating, setCreating] = useState(false)
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const [form, setForm] = useState({
    clientId: '', dueDate: '', notes: '', gstRate: 18,
    items: [{ description: '', qty: 1, rate: 0 }],
  })

  const fetchData = () => {
    Promise.all([
      fetch(`/api/invoices?all=true&status=${filter}`).then(r => r.json()),
      fetch('/api/admin/clients?limit=200').then(r => r.json()),
    ]).then(([invData, cData]) => {
      setInvoices(invData.invoices || [])
      setClients(cData.clients || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [filter])

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, rate: 0 }] }))
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i: number, field: string, value: string | number) =>
    setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }))

  const subtotal = form.items.reduce((s, item) => s + item.qty * item.rate, 0)
  const gstAmount = Math.round(subtotal * form.gstRate / 100 * 100) / 100
  const total = subtotal + gstAmount

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: form.clientId,
        dueDate: form.dueDate || null,
        notes: form.notes,
        gstRate: form.gstRate,
        items: form.items.map(i => ({ ...i, amount: i.qty * i.rate })),
      }),
    })
    if (res.ok) {
      setShowNew(false)
      setForm({ clientId: '', dueDate: '', notes: '', gstRate: 18, items: [{ description: '', qty: 1, rate: 0 }] })
      fetchData()
    }
    setCreating(false)
  }

  const markPaid = async (id: string) => {
    if (!confirm('Mark this invoice as paid? This will generate a Tax Invoice.')) return
    setMarkingPaid(id)
    await fetch(`/api/invoices/${id}/mark-paid`, { method: 'POST' })
    setMarkingPaid(null)
    fetchData()
  }

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

  return (
    <>
      <div className="pg-title">Invoice Management</div>
      <div className="pg-sub">Raise proforma invoices and mark them as paid.</div>

      <div className="card">
        <div className="card-header">
          <h3>All Invoices ({invoices.length})</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
              <i className="fas fa-plus" /> Raise Invoice
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Invoice No</th><th>Client</th><th>Type</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Created</th><th>Actions</th></tr></thead>
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
                      <td>{formatDate(inv.createdAt)}</td>
                      <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => downloadPDF(inv.id, inv.invoiceNo)} disabled={downloading === inv.id}>
                          {downloading === inv.id ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-file-pdf" /> PDF</>}
                        </button>
                        {inv.status === 'PENDING' && inv.type === 'PROFORMA' && (
                          <button className="btn btn-success btn-sm" onClick={() => markPaid(inv.id)} disabled={markingPaid === inv.id}>
                            {markingPaid === inv.id ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-check" /> Mark Paid</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showNew && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <button className="modal-close" onClick={() => setShowNew(false)}><i className="fas fa-times" /></button>
            <h3>Raise Proforma Invoice</h3>
            <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 20 }}>Invoice will be sent to client via email.</p>
            <form onSubmit={createInvoice}>
              <div className="form-group">
                <label>Client *</label>
                <select className="form-control" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>Due Date</label><input className="form-control" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
                <div className="form-group"><label>GST Rate (%)</label><input className="form-control" type="number" value={form.gstRate} onChange={e => setForm(f => ({ ...f, gstRate: Number(e.target.value) }))} min={0} max={28} /></div>
              </div>

              <div className="form-group">
                <label>Line Items</label>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 36px', gap: 8, marginBottom: 8 }}>
                    <input className="form-control" placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} required />
                    <input className="form-control" type="number" placeholder="Qty" value={item.qty} min={1} onChange={e => updateItem(i, 'qty', Number(e.target.value))} />
                    <input className="form-control" type="number" placeholder="Rate ₹" value={item.rate} min={0} onChange={e => updateItem(i, 'rate', Number(e.target.value))} />
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)} disabled={form.items.length === 1}><i className="fas fa-times" /></button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}><i className="fas fa-plus" /> Add Item</button>
              </div>

              {/* Totals preview */}
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: '.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>GST ({form.gstRate}%)</span><span>{formatCurrency(gstAmount)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '.95rem', borderTop: '1px solid var(--border)', paddingTop: 8 }}><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <div className="form-group"><label>Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." /></div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><i className="fas fa-spinner fa-spin" /> Creating...</> : <><i className="fas fa-file-invoice" /> Create Invoice</>}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
