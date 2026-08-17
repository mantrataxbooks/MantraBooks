'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

const statusColor: Record<string, string> = {
  PENDING: 'b-warn',
  ACTIVE: 'b-active',
  REVOKED: 'b-inactive',
}

export default function DelegatesPage() {
  const [delegations, setDelegations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const fetchDelegations = () => {
    setLoading(true)
    fetch('/api/delegates')
      .then(r => r.json())
      .then(d => { setDelegations(d.delegations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDelegations() }, [])

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setMsg(null)
    const res = await fetch('/api/delegates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const d = await res.json()
    setInviting(false)
    if (res.ok) {
      setMsg({ type: 'ok', text: `Invitation sent to ${email}` })
      setEmail('')
      fetchDelegations()
    } else {
      setMsg({ type: 'err', text: d.error || 'Failed to send invite.' })
    }
  }

  const revoke = async (id: string) => {
    if (!confirm('Revoke this delegate access?')) return
    await fetch(`/api/delegates?id=${id}`, { method: 'DELETE' })
    fetchDelegations()
  }

  return (
    <>
      <div className="pg-title">Delegate Access</div>
      <div className="pg-sub">Invite someone to view and manage your account on your behalf.</div>

      {/* Invite form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3>Invite a Delegate</h3></div>
        <div style={{ padding: '0 20px 20px' }}>
          <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 16 }}>
            A delegate can view your invoices, upload documents, and raise support tickets. They cannot change your password or account details.
          </p>
          {msg && (
            <div className={`alert ${msg.type === 'ok' ? 'alert-ok' : 'alert-err'}`} style={{ marginBottom: 12 }}>
              <i className={`fas fa-${msg.type === 'ok' ? 'check-circle' : 'exclamation-circle'}`} /> {msg.text}
            </div>
          )}
          <form onSubmit={invite} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 240, marginBottom: 0 }}>
              <label>Email Address</label>
              <div className="input-group">
                <i className="fas fa-envelope input-icon" />
                <input
                  className="form-control"
                  type="email"
                  placeholder="delegate@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={inviting}>
              {inviting ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : <><i className="fas fa-paper-plane" /> Send Invite</>}
            </button>
          </form>
        </div>
      </div>

      {/* Delegations list */}
      <div className="card">
        <div className="card-header"><h3>Active Delegates</h3></div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
        ) : delegations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <i className="fas fa-user-friends" style={{ fontSize: '2rem', marginBottom: 10, display: 'block' }} />
            No delegates yet. Invite someone above.
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Invited On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {delegations.map(d => (
                  <tr key={d.id}>
                    <td>{d.email}</td>
                    <td>{d.delegate?.name || <span style={{ color: '#999' }}>Pending acceptance</span>}</td>
                    <td><span className={`badge ${statusColor[d.status] || 'b-inactive'}`}>{d.status}</span></td>
                    <td>{formatDate(d.createdAt)}</td>
                    <td>
                      {d.status !== 'REVOKED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => revoke(d.id)}>
                          <i className="fas fa-times" /> Revoke
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
    </>
  )
}
