'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

const PERMISSIONS = [
  { key: 'tickets.view', label: 'View Support Tickets' },
  { key: 'tickets.reply', label: 'Reply to Tickets' },
  { key: 'tickets.close', label: 'Close Tickets' },
  { key: 'tickets.assign', label: 'Assign Tickets' },
  { key: 'payments.view', label: 'View Payments' },
  { key: 'payments.update', label: 'Update Payment Status' },
  { key: 'documents.view', label: 'View Client Documents' },
  { key: 'documents.review', label: 'Review Documents' },
  { key: 'clients.view', label: 'View Clients' },
]

export default function AdminRoles() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', permissions: [] as string[] })
  const [err, setErr] = useState('')

  const fetchRoles = () => {
    fetch('/api/admin/roles')
      .then(r => r.json())
      .then(d => { setRoles(d.roles || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchRoles() }, [])

  const togglePerm = (key: string) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key) ? f.permissions.filter(p => p !== key) : [...f.permissions, key],
    }))
  }

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setErr('Role name required.'); return }
    setCreating(true)
    setErr('')
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowNew(false)
      setForm({ name: '', permissions: [] })
      fetchRoles()
    } else {
      const d = await res.json()
      setErr(d.error || 'Failed to create role.')
    }
    setCreating(false)
  }

  const deleteRole = async (id: string) => {
    if (!confirm('Delete this role? Employees with this role will lose access.')) return
    await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' })
    fetchRoles()
  }

  return (
    <>
      <div className="pg-title">Role Management</div>
      <div className="pg-sub">Create and manage employee roles with granular permissions.</div>

      <div className="alert alert-info">
        <i className="fas fa-info-circle" /> System roles (ADMIN, CLIENT) are built-in and cannot be modified. Custom roles are for employee access control.
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Custom Roles ({roles.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
            <i className="fas fa-plus" /> Create Role
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Role Name</th><th>Permissions</th><th>Employees</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {/* Built-in roles */}
                {[
                  { name: 'ADMIN', perms: 'Full Access', count: '—', builtin: true },
                  { name: 'SUPPORT', perms: 'Tickets, Documents', count: '—', builtin: true },
                  { name: 'PAYMENTS', perms: 'Payments, Documents', count: '—', builtin: true },
                ].map(r => (
                  <tr key={r.name} style={{ background: '#fafafa' }}>
                    <td><span style={{ fontWeight: 700 }}>{r.name}</span> <span className="badge b-processing" style={{ fontSize: '.65rem' }}>Built-in</span></td>
                    <td><span style={{ fontSize: '.8rem', color: '#666' }}>{r.perms}</span></td>
                    <td>—</td>
                    <td>—</td>
                    <td><span style={{ color: '#999', fontSize: '.8rem' }}>System role</span></td>
                  </tr>
                ))}

                {roles.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 24 }}>No custom roles created yet.</td></tr>
                )}
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td style={{ fontWeight: 600 }}>{role.name}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(JSON.parse(role.permissions || '[]') as string[]).slice(0, 3).map((p: string) => (
                          <span key={p} className="badge b-processing" style={{ fontSize: '.65rem' }}>{p}</span>
                        ))}
                        {JSON.parse(role.permissions || '[]').length > 3 && (
                          <span style={{ fontSize: '.72rem', color: '#666' }}>+{JSON.parse(role.permissions || '[]').length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td>{role._count?.users ?? 0}</td>
                    <td>{formatDate(role.createdAt)}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteRole(role.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <button className="modal-close" onClick={() => setShowNew(false)}><i className="fas fa-times" /></button>
            <h3>Create Custom Role</h3>
            <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 20 }}>Define a role name and select permissions for employees.</p>
            {err && <div className="alert alert-err">{err}</div>}
            <form onSubmit={createRole}>
              <div className="form-group">
                <label>Role Name *</label>
                <input className="form-control" placeholder="e.g. Senior Support" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {PERMISSIONS.map((p) => (
                    <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '.85rem' }}>
                      <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} style={{ accentColor: 'var(--red)', width: 15, height: 15 }} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><i className="fas fa-spinner fa-spin" /> Creating...</> : <><i className="fas fa-shield-alt" /> Create Role</>}
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
