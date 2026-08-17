'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ClientDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({ invoices: 0, pending: 0, paid: 0, documents: 0, tickets: 0 })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/invoices?limit=5').then(r => r.json()),
      fetch('/api/documents?limit=1').then(r => r.json()),
      fetch('/api/tickets?limit=1').then(r => r.json()),
    ]).then(([invData, docsData, tktsData]) => {
      const invoices: any[] = invData.invoices || []
      setRecentInvoices(invoices.slice(0, 5))
      setStats({
        invoices: invData.total || 0,
        pending: invoices.filter((i: any) => i.status === 'PENDING').length,
        paid: invoices.filter((i: any) => i.status === 'PAID').length,
        documents: docsData.total || 0,
        tickets: tktsData.total || 0,
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const statBoxes = [
    { icon: 'fa-file-invoice-dollar', label: 'Total Invoices', value: stats.invoices, color: 'rgba(52,152,219,.12)', iconColor: 'var(--info)' },
    { icon: 'fa-clock', label: 'Pending', value: stats.pending, color: 'rgba(243,156,18,.12)', iconColor: 'var(--warn)' },
    { icon: 'fa-check-circle', label: 'Paid', value: stats.paid, color: 'rgba(39,174,96,.12)', iconColor: 'var(--ok)' },
    { icon: 'fa-folder-open', label: 'Documents', value: stats.documents, color: 'rgba(196,30,58,.12)', iconColor: 'var(--red)' },
    { icon: 'fa-headset', label: 'Open Tickets', value: stats.tickets, color: 'rgba(155,89,182,.12)', iconColor: '#9b59b6' },
  ]

  return (
    <>
      <div className="pg-title">Welcome back, {session?.user?.name?.split(' ')[0]}!</div>
      <div className="pg-sub">Here's an overview of your account activity.</div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }} /></div>
      ) : (
        <>
          <div className="stats-row">
            {statBoxes.map((s) => (
              <div key={s.label} className="stat-box">
                <div className="si" style={{ background: s.color, color: s.iconColor }}><i className={`fas ${s.icon}`} /></div>
                <div className="sv">{s.value}</div>
                <div className="sl">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
            <div className="card">
              <div className="card-header">
                <h3>Recent Invoices</h3>
                <Link href="/invoices" className="btn btn-primary btn-sm">View All</Link>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Invoice</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {recentInvoices.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: 24 }}>No invoices yet.</td></tr>
                    ) : recentInvoices.map((inv: any) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600, color: 'var(--red)' }}>{inv.invoiceNo}</td>
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
              <div className="card-header"><h3>Quick Actions</h3></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { href: '/documents', icon: 'fa-cloud-upload-alt', label: 'Upload Documents', color: 'btn-primary' },
                  { href: '/tickets', icon: 'fa-plus-circle', label: 'Raise Support Ticket', color: 'btn-success' },
                  { href: '/invoices', icon: 'fa-file-pdf', label: 'Download Invoices', color: 'btn-secondary' },
                  { href: '/change-password', icon: 'fa-key', label: 'Change Password', color: 'btn-secondary' },
                ].map((a) => (
                  <Link key={a.href} href={a.href} className={`btn ${a.color}`}>
                    <i className={`fas ${a.icon}`} /> {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
