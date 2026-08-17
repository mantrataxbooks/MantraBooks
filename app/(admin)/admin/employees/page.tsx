'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [creating, setCreating] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'SUPPORT' as 'SUPPORT' | 'PAYMENTS' })

  const fetchEmployees = () => {
    fetch('/api/admin/employees')
      .then(r => r.json())
      .then(d => { setEmployees(d.employees || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchEmployees() }, [])

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setErr('')
    const res = await fetch('/api/admin/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowNew(false)
      setForm({ name: '', email: '', phone: '', role: 'SUPPORT' })
      fetchEmployees()
    } else {
      const d = await res.json()
      setErr(d.error || 'Failed to create employee.')
    }
    setCreating(false)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchEmployees()
  }

  const roleColors: Record<string, string> = { SUPPORT: 'b-in_progress', PAYMENTS: 'b-processing', ADMIN: 'b-pending' }

  return (
    <>
      <div className="pg-title">Employees</div>
      <div className="pg-sub">Manage employee accounts and their role assignments.</div>

      <div className="card">
        <div className="card-header">
          <h3>All Employees ({employees.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
            <i className="fas fa-user-plus" /> Add Employee
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {employees.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No employees yet.</td></tr>
                  : employees.map((emp) => (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 600 }}>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone || '—'}</td>
                      <td><span className={`badge ${roleColors[emp.role] || 'b-pending'}`}>{emp.role}</span></td>
                      <td><span className={`badge ${emp.isActive ? 'b-active' : 'b-inactive'}`}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>{formatDate(emp.createdAt)}</td>
                      <td>
                        <button className={`btn btn-sm ${emp.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(emp.id, emp.isActive)}>
                          {emp.isActive ? 'Deactivate' : 'Activate'}
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
          <div className="modal">
            <button className="modal-close" onClick={() => setShowNew(false)}><i className="fas fa-times" /></button>
            <h3>Add Employee</h3>
            <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 20 }}>A welcome email with login credentials will be sent to the employee.</p>
            {err && <div className="alert alert-err">{err}</div>}
            <form onSubmit={createEmployee}>
              <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group"><label>Email Address *</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
              <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="form-group">
                <label>Role *</label>
                <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'SUPPORT' | 'PAYMENTS' }))}>
                  <option value="SUPPORT">Support — handles client tickets</option>
                  <option value="PAYMENTS">Payments — handles payment records</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><i className="fas fa-spinner fa-spin" /> Creating...</> : <><i className="fas fa-user-plus" /> Add Employee</>}
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
