'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ clients: 0, invoices: 0, pendingInvoices: 0, revenue: 0, documents: 0, openTickets: 0 })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [recentClients, setRecentClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/clients?limit=5').then(r => r.json()),
      fetch('/api/invoices?all=true&limit=5').then(r => r.json()),
      fetch('/api/documents?all=true&limit=1').then(r => r.json()),
      fetch('/api/tickets?all=true&status=OPEN').then(r => r.json()),
    ]).then(([clientsData, invData, docsData, tktsData]) => {
      const invoices = invData.invoices || []
      const paidInvoices = invoices.filter((i: any) => i.status === 'PAID')
      setStats({
        clients: clientsData.total || 0,
        invoices: invData.total || 0,
        pendingInvoices: invoices.filter((i: any) => i.status === 'PENDING').length,
        revenue: paidInvoices.reduce((s: number, i: any) => s + Number(i.total), 0),
        documents: docsData.total || 0,
        openTickets: tktsData.total || 0,
      })
      setRecentInvoices(invoices.slice(0, 5))
      setRecentClients((clientsData.clients || []).slice(0, 5))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const statBoxes = [
    { icon: 'fa-users', label: 'Total Clients', value: stats.clients, color: 'rgba(52,152,219,.12)', iconColor: 'var(--info)', href: '/admin/clients' },
    { icon: 'fa-file-invoice-dollar', label: 'Total Invoices', value: stats.invoices, color: 'rgba(196,30,58,.12)', iconColor: 'var(--red)', href: '/admin/invoices' },
    { icon: 'fa-clock', label: 'Pending Invoices', value: stats.pendingInvoices, color: 'rgba(243,156,18,.12)', iconColor: 'var(--warn)', href: '/admin/invoices' },
    { icon: 'fa-rupee-sign', label: 'Total Revenue', value: formatCurrency(stats.revenue), color: 'rgba(39,174,96,.12)', iconColor: 'var(--ok)', href: '/admin/invoices' },
    { icon: 'fa-folder-open', label: 'Documents', value: stats.documents, color: 'rgba(155,89,182,.12)', iconColor: '#9b59b6', href: '/admin/documents' },
    { icon: 'fa-headset', label: 'Open Tickets', value: stats.openTickets, color: 'rgba(231,76,60,.12)', iconColor: 'var(--err)', href: '/admin/tickets' },
  ]

  return (
    <>
      <div className="pg-title">Admin Dashboard</div>
      <div className="pg-sub">Complete overview of all business activity.</div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }} /></div>
      ) : (
        <>
          <div className="stats-row">
            {statBoxes.map((s) => (
              <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
                <div className="stat-box" style={{ cursor: 'pointer', transition: 'all .2s' }}>
                  <div className="si" style={{ background: s.color, color: s.iconColor }}><i className={`fas ${s.icon}`} /></div>
                  <div className="sv" style={{ fontSize: typeof s.value === 'string' ? '1.2rem' : '1.7rem' }}>{s.value}</div>
                  <div className="sl">{s.label}</div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 18 }}>
            <div className="card">
              <div className="card-header">
                <h3>Recent Invoices</h3>
                <Link href="/admin/invoices" className="btn btn-primary btn-sm">View All</Link>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {recentInvoices.length === 0
                      ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 24 }}>No invoices yet.</td></tr>
                      : recentInvoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 700, color: 'var(--red)' }}>{inv.invoiceNo}</td>
                          <td>{inv.client?.name}</td>
                          <td>{formatCurrency(Number(inv.total))}</td>
                          <td><span className={`badge b-${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                          <td>{formatDate(inv.createdAt)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Recent Clients</h3>
                <Link href="/admin/clients" className="btn btn-primary btn-sm">View All</Link>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th></tr></thead>
                  <tbody>
                    {recentClients.length === 0
                      ? <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: 24 }}>No clients yet.</td></tr>
                      : recentClients.map((c: any) => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 500 }}>{c.name}</td>
                          <td>{c.email}</td>
                          <td><span className={`badge ${c.isActive ? 'b-active' : 'b-inactive'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td>{formatDate(c.createdAt)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
