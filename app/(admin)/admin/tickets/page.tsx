'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

const priorityColors: Record<string, string> = { LOW: 'b-low', MEDIUM: 'b-medium', HIGH: 'b-high', URGENT: 'b-urgent' }
const statusColors: Record<string, string> = { OPEN: 'b-open', IN_PROGRESS: 'b-in_progress', RESOLVED: 'b-completed', CLOSED: 'b-inactive' }

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)

  const fetchTickets = () => {
    Promise.all([
      fetch(`/api/tickets?all=true&status=${filter}`).then(r => r.json()),
      fetch('/api/admin/employees').then(r => r.json()),
    ]).then(([tkData, empData]) => {
      setTickets(tkData.tickets || [])
      setEmployees((empData.employees || []).filter((e: any) => e.role === 'SUPPORT' && e.isActive))
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchTickets() }, [filter])

  const openTicket = async (ticket: any) => {
    setSelected(ticket)
    const res = await fetch(`/api/tickets/${ticket.id}`)
    const data = await res.json()
    setMessages(data.messages || [])
  }

  const updateTicket = async (field: string, value: string) => {
    await fetch(`/api/tickets/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    fetchTickets()
    const res = await fetch(`/api/tickets/${selected.id}`)
    const data = await res.json()
    setSelected(data.ticket)
    setMessages(data.messages || [])
  }

  const sendMessage = async () => {
    if (!newMsg.trim() || !selected) return
    setSending(true)
    await fetch(`/api/tickets/${selected.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMsg }),
    })
    setNewMsg('')
    const res = await fetch(`/api/tickets/${selected.id}`)
    const data = await res.json()
    setMessages(data.messages || [])
    setSending(false)
  }

  return (
    <>
      <div className="pg-title">Support Tickets</div>
      <div className="pg-sub">Manage, assign, and respond to all client support tickets.</div>

      {!selected ? (
        <div className="card">
          <div className="card-header">
            <h3>All Tickets ({tickets.length})</h3>
            <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>Ticket#</th><th>Client</th><th>Title</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Updated</th><th></th></tr></thead>
                <tbody>
                  {tickets.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No tickets found.</td></tr>
                    : tickets.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, color: 'var(--red)' }}>{t.ticketNo}</td>
                        <td>{t.client?.name}</td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                        <td><span className={`badge ${priorityColors[t.priority]}`}>{t.priority}</span></td>
                        <td><span className={`badge ${statusColors[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                        <td>{t.assignee?.name || <span style={{ color: '#999' }}>Unassigned</span>}</td>
                        <td>{formatDate(t.updatedAt)}</td>
                        <td><button className="btn btn-secondary btn-sm" onClick={() => openTicket(t)}>Open</button></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>{selected.ticketNo} — {selected.title}</h3>
              <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${priorityColors[selected.priority]}`}>{selected.priority}</span>
                <span className={`badge ${statusColors[selected.status]}`}>{selected.status.replace('_', ' ')}</span>
                <span style={{ fontSize: '.78rem', color: '#666' }}>Client: {selected.client?.name}</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}><i className="fas fa-arrow-left" /> Back</button>
          </div>
          <div className="card-body">
            {/* Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '.75rem' }}>Status</label>
                <select className="form-control" value={selected.status} onChange={e => updateTicket('status', e.target.value)}>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '.75rem' }}>Assign To</label>
                <select className="form-control" value={selected.assignedTo || ''} onChange={e => updateTicket('assignedTo', e.target.value)}>
                  <option value="">Unassigned</option>
                  {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </div>
            </div>

            {/* Messages */}
            <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {messages.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender?.role === 'CLIENT' ? 'flex-start' : 'flex-end' }}>
                  <div style={{ background: m.sender?.role === 'CLIENT' ? '#f0f0f0' : 'linear-gradient(135deg,#C41E3A,#8B0000)', color: m.sender?.role === 'CLIENT' ? '#333' : '#fff', padding: '10px 14px', borderRadius: 10, maxWidth: '75%', fontSize: '.85rem', lineHeight: 1.6 }}>
                    {m.message}
                  </div>
                  <span style={{ fontSize: '.72rem', color: '#999', marginTop: 4 }}>{m.sender?.name} · {formatDate(m.createdAt)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <textarea className="form-control" rows={2} placeholder="Reply to client..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !newMsg.trim()}>
                {sending ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
