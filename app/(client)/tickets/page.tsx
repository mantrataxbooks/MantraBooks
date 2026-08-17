'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

const priorityColors: Record<string, string> = { LOW: 'b-low', MEDIUM: 'b-medium', HIGH: 'b-high', URGENT: 'b-urgent' }
const statusColors: Record<string, string> = { OPEN: 'b-open', IN_PROGRESS: 'b-in_progress', RESOLVED: 'b-completed', CLOSED: 'b-inactive' }

export default function ClientTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newTicket, setNewTicket] = useState({ title: '', message: '', priority: 'MEDIUM' })
  const [creating, setCreating] = useState(false)

  const fetchTickets = () => {
    fetch('/api/tickets')
      .then(r => r.json())
      .then(d => { setTickets(d.tickets || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchTickets() }, [])

  const openTicket = async (ticket: any) => {
    setSelected(ticket)
    const res = await fetch(`/api/tickets/${ticket.id}`)
    const data = await res.json()
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

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket),
    })
    setNewTicket({ title: '', message: '', priority: 'MEDIUM' })
    setShowNew(false)
    setCreating(false)
    fetchTickets()
  }

  return (
    <>
      <div className="pg-title">Support Tickets</div>
      <div className="pg-sub">Raise and track support tickets with your CA team.</div>

      {!selected ? (
        <>
          <div className="card">
            <div className="card-header">
              <h3>My Tickets ({tickets.length})</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
                <i className="fas fa-plus" /> New Ticket
              </button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
            ) : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Ticket#</th><th>Title</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Last Update</th><th></th></tr></thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No tickets yet. <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>Raise one</button></td></tr>
                    ) : tickets.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, color: 'var(--red)' }}>{t.ticketNo}</td>
                        <td style={{ fontWeight: 500 }}>{t.title}</td>
                        <td><span className={`badge ${priorityColors[t.priority]}`}>{t.priority}</span></td>
                        <td><span className={`badge ${statusColors[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                        <td>{t.assignee?.name || '—'}</td>
                        <td>{formatDate(t.updatedAt)}</td>
                        <td><button className="btn btn-secondary btn-sm" onClick={() => openTicket(t)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* New ticket modal */}
          {showNew && (
            <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
              <div className="modal">
                <button className="modal-close" onClick={() => setShowNew(false)}><i className="fas fa-times" /></button>
                <h3>Raise a Support Ticket</h3>
                <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 20 }}>Describe your issue and our team will respond promptly.</p>
                <form onSubmit={createTicket}>
                  <div className="form-group">
                    <label>Subject</label>
                    <input className="form-control" placeholder="Brief description of your issue" value={newTicket.title} onChange={e => setNewTicket(n => ({ ...n, title: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-control" value={newTicket.priority} onChange={e => setNewTicket(n => ({ ...n, priority: e.target.value }))}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea className="form-control" rows={4} placeholder="Describe your issue in detail..." value={newTicket.message} onChange={e => setNewTicket(n => ({ ...n, message: e.target.value }))} required />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" disabled={creating}>
                      {creating ? <><i className="fas fa-spinner fa-spin" /> Creating...</> : <><i className="fas fa-plus" /> Create Ticket</>}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Ticket detail view */
        <div className="card">
          <div className="card-header">
            <div>
              <h3>{selected.ticketNo} — {selected.title}</h3>
              <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                <span className={`badge ${priorityColors[selected.priority]}`}>{selected.priority}</span>
                <span className={`badge ${statusColors[selected.status]}`}>{selected.status.replace('_', ' ')}</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>
              <i className="fas fa-arrow-left" /> Back
            </button>
          </div>
          <div className="card-body">
            <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {messages.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender?.role === 'CLIENT' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ background: m.sender?.role === 'CLIENT' ? 'linear-gradient(135deg,#C41E3A,#8B0000)' : '#f0f0f0', color: m.sender?.role === 'CLIENT' ? '#fff' : '#333', padding: '10px 14px', borderRadius: 10, maxWidth: '75%', fontSize: '.85rem', lineHeight: 1.6 }}>
                    {m.message}
                  </div>
                  <span style={{ fontSize: '.72rem', color: '#999', marginTop: 4 }}>{m.sender?.name} · {formatDate(m.createdAt)}</span>
                </div>
              ))}
            </div>

            {selected.status !== 'CLOSED' && selected.status !== 'RESOLVED' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <textarea className="form-control" rows={2} placeholder="Type your message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !newMsg.trim()}>
                  {sending ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
