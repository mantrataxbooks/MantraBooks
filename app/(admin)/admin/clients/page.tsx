'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
  'Chandigarh','Dadra & Nagar Haveli','Daman & Diu','Lakshadweep','Andaman & Nicobar',
]

const emptyForm = {
  name: '', email: '', phone: '', company: '',
  gstNumber: '', cinNumber: '',
  address: '', city: '', state: '', pincode: '',
}

export default function AdminClients() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewClient, setViewClient] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [impersonating, setImpersonating] = useState<string | null>(null)

  const fetchClients = (q = '') => {
    setLoading(true)
    fetch(`/api/admin/clients?search=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setClients(d.clients || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchClients() }, [])

  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }))

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchClients(search)
  }

  const viewAsClient = (id: string) => {
    window.open(`/admin/clients/${id}/view`, '_blank')
  }

  const loginAsClient = async (id: string) => {
    setImpersonating(id)
    const res = await fetch(`/api/admin/clients/${id}/impersonate`, { method: 'POST' })
    const d = await res.json()
    setImpersonating(null)
    if (d.token) window.open(`/impersonate?token=${d.token}`, '_blank')
    else alert(d.error || 'Failed to impersonate.')
  }

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateErr('')
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowModal(false)
      setForm(emptyForm)
      fetchClients(search)
    } else {
      const d = await res.json()
      setCreateErr(d.error || 'Failed to create client.')
    }
    setCreating(false)
  }

  return (
    <>
      <div className="pg-title">Clients</div>
      <div className="pg-sub">Manage all client accounts and their business details.</div>

      <div className="card">
        <div className="card-header">
          <h3>All Clients ({total})</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="form-control" placeholder="Search name, email, GST, CIN..." value={search}
              onChange={e => { setSearch(e.target.value); fetchClients(e.target.value) }} style={{ width: 260 }} />
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus" /> New Client
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>GST No.</th>
                  <th>CIN No.</th>
                  <th>City / State</th>
                  <th>Status</th>
                  <th>Invoices</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0
                  ? <tr><td colSpan={11} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No clients found.</td></tr>
                  : clients.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || '—'}</td>
                      <td>{c.company || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{c.gstNumber || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{c.cinNumber || '—'}</td>
                      <td>{c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state || '—'}</td>
                      <td><span className={`badge ${c.isActive ? 'b-active' : 'b-inactive'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>{c._count?.invoices ?? 0}</td>
                      <td>{formatDate(c.createdAt)}</td>
                      <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewClient(c)} title="Quick details">
                          <i className="fas fa-info-circle" />
                        </button>
                        <button className="btn btn-sm" style={{ background: '#1565C0', color: '#fff' }} onClick={() => viewAsClient(c.id)} title="View client portal in new tab">
                          <i className="fas fa-eye" /> View
                        </button>
                        <button className="btn btn-sm" style={{ background: '#6A1B9A', color: '#fff' }} onClick={() => loginAsClient(c.id)} disabled={impersonating === c.id || !c.isActive} title="Login as client (changes session)">
                          {impersonating === c.id ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-user-secret" />}
                        </button>
                        <button className={`btn btn-sm ${c.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(c.id, c.isActive)}>
                          {c.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE CLIENT MODAL */}
      {showModal && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            <h3>Create New Client</h3>
            <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 20 }}>Welcome email with login credentials sent automatically.</p>
            {createErr && <div className="alert alert-err">{createErr}</div>}

            <form onSubmit={createClient}>
              {/* Section: Personal */}
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Personal Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
                <div className="form-group"><label>Email Address *</label><input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                <div className="form-group"><label>Phone</label><input className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              </div>

              {/* Section: Business */}
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, margin: '14px 0 10px' }}>Business Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Company Name</label>
                  <input className="form-control" placeholder="ABC Enterprises Pvt Ltd" value={form.company} onChange={e => set('company', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>GST Number <span style={{ color: '#999', fontWeight: 400 }}>(15 digits)</span></label>
                  <input className="form-control" placeholder="27AAAAA0000A1Z5" maxLength={15}
                    value={form.gstNumber} onChange={e => set('gstNumber', e.target.value.toUpperCase())}
                    style={{ fontFamily: 'monospace', letterSpacing: 1 }} />
                </div>
                <div className="form-group">
                  <label>CIN Number <span style={{ color: '#999', fontWeight: 400 }}>(21 chars)</span></label>
                  <input className="form-control" placeholder="U12345MH2010PTC123456" maxLength={21}
                    value={form.cinNumber} onChange={e => set('cinNumber', e.target.value.toUpperCase())}
                    style={{ fontFamily: 'monospace', letterSpacing: 1 }} />
                </div>
              </div>

              {/* Section: Address */}
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, margin: '14px 0 10px' }}>Registered Address</div>
              <div className="form-group">
                <label>Street Address</label>
                <textarea className="form-control" rows={2} placeholder="Building, Street, Area"
                  value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 12 }}>
                <div className="form-group"><label>City</label><input className="form-control" placeholder="Mumbai" value={form.city} onChange={e => set('city', e.target.value)} /></div>
                <div className="form-group">
                  <label>State</label>
                  <select className="form-control" value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>PIN Code</label><input className="form-control" placeholder="400001" maxLength={6} value={form.pincode} onChange={e => set('pincode', e.target.value)} /></div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><i className="fas fa-spinner fa-spin" /> Creating...</> : <><i className="fas fa-user-plus" /> Create Client</>}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CLIENT MODAL */}
      {viewClient && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setViewClient(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <button className="modal-close" onClick={() => setViewClient(null)}><i className="fas fa-times" /></button>
            <h3>{viewClient.name}</h3>
            <span className={`badge ${viewClient.isActive ? 'b-active' : 'b-inactive'}`} style={{ marginBottom: 20, display: 'inline-block' }}>
              {viewClient.isActive ? 'Active' : 'Inactive'}
            </span>

            {[
              { section: 'Contact', rows: [
                ['Email', viewClient.email],
                ['Phone', viewClient.phone],
              ]},
              { section: 'Business', rows: [
                ['Company', viewClient.company],
                ['GST Number', viewClient.gstNumber],
                ['CIN Number', viewClient.cinNumber],
              ]},
              { section: 'Address', rows: [
                ['Street', viewClient.address],
                ['City', viewClient.city],
                ['State', viewClient.state],
                ['PIN Code', viewClient.pincode],
              ]},
              { section: 'Account', rows: [
                ['Invoices', viewClient._count?.invoices ?? 0],
                ['Documents', viewClient._count?.documents ?? 0],
                ['Joined', formatDate(viewClient.createdAt)],
              ]},
            ].map(({ section, rows }) => (
              <div key={section} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{section}</div>
                <div style={{ background: 'var(--bg)', borderRadius: 8, overflow: 'hidden' }}>
                  {rows.map(([label, value]) => value ? (
                    <div key={label as string} style={{ display: 'flex', padding: '9px 14px', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                      <span style={{ color: '#666', width: 120, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontWeight: 500, fontFamily: (label === 'GST Number' || label === 'CIN Number') ? 'monospace' : 'inherit', letterSpacing: (label === 'GST Number' || label === 'CIN Number') ? 1 : 0 }}>{value}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            ))}

            <button className="btn btn-secondary btn-block" onClick={() => setViewClient(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
