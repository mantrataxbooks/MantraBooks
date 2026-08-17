'use client'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
  'Chandigarh','Dadra & Nagar Haveli','Daman & Diu','Lakshadweep','Andaman & Nicobar',
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', phone: '', company: '', gstNumber: '', cinNumber: '',
    address: '', city: '', state: '', pincode: '',
  })
  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Avatar state
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwShow, setPwShow] = useState({ current: false, new: false, confirm: false })
  const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [pwErr, setPwErr] = useState('')

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setEmail(d.user.email || '')
          setEmailVerified(d.user.emailVerified ?? false)
          setAvatarSignedUrl(d.user.avatarSignedUrl || null)
          setForm({
            name: d.user.name || '',
            phone: d.user.phone || '',
            company: d.user.company || '',
            gstNumber: d.user.gstNumber || '',
            cinNumber: d.user.cinNumber || '',
            address: d.user.address || '',
            city: d.user.city || '',
            state: d.user.state || '',
            pincode: d.user.pincode || '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) setMsg({ type: 'ok', text: 'Profile updated successfully.' })
    else setMsg({ type: 'err', text: d.error || 'Failed to update profile.' })
  }

  const handleResend = async () => {
    setResendStatus('loading')
    const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
    const d = await res.json()
    setResendStatus(res.ok ? 'ok' : 'err')
    if (!res.ok) console.error(d.error)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setAvatarMsg(null)
    setAvatarUploading(true)

    try {
      const presignRes = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: file.type, filename: file.name, size: file.size }),
      })
      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error || 'Failed to get upload URL')
      }
      const { uploadUrl, s3Key } = await presignRes.json()

      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!s3Res.ok) throw new Error('Upload to storage failed')

      const saveRes = await fetch('/api/auth/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Key }),
      })
      if (!saveRes.ok) throw new Error('Failed to save photo')

      // Refresh signed URL for display
      const profileRes = await fetch('/api/auth/profile')
      const profileData = await profileRes.json()
      if (profileData.user?.avatarSignedUrl) setAvatarSignedUrl(profileData.user.avatarSignedUrl)

      setAvatarMsg({ type: 'ok', text: 'Photo updated successfully!' })
    } catch (err: any) {
      setAvatarMsg({ type: 'err', text: err.message || 'Upload failed. Please try again.' })
    } finally {
      setAvatarUploading(false)
    }
  }

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwErr('New passwords do not match.')
      setPwStatus('err')
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwErr('New password must be at least 8 characters.')
      setPwStatus('err')
      return
    }
    setPwStatus('loading')
    setPwErr('')

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    })

    if (res.ok) {
      setPwStatus('ok')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      const data = await res.json()
      setPwErr(data.error || 'Failed to change password.')
      setPwStatus('err')
    }
  }

  const isDelegate = !!session?.user?.delegateFor
  const initials = form.name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || '?'

  return (
    <>
      <div className="pg-title">My Profile</div>
      <div className="pg-sub">Manage your personal information and account security.</div>

      {isDelegate && (
        <div className="alert alert-warn" style={{ marginBottom: 20 }}>
          <i className="fas fa-info-circle" /> You are viewing as a delegate. Profile editing is restricted to the account owner.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'var(--red)' }} /></div>
      ) : (
        <>
          {/* Avatar Card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h3><i className="fas fa-camera" style={{ marginRight: 8, color: 'var(--red)' }} />Profile Photo</h3></div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#C41E3A,#8B0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '3px solid var(--border)' }}>
                  {avatarSignedUrl ? (
                    <img src={avatarSignedUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 700 }}>{initials}</span>
                  )}
                </div>
                <div>
                  {!isDelegate && (
                    <>
                      <p style={{ fontSize: '.83rem', color: '#666', marginBottom: 10 }}>JPG, PNG, or WebP — max 2 MB</p>
                      {avatarMsg && (
                        <div className={`alert ${avatarMsg.type === 'ok' ? 'alert-ok' : 'alert-err'}`} style={{ marginBottom: 8, padding: '6px 12px', fontSize: '.8rem' }}>
                          <i className={`fas fa-${avatarMsg.type === 'ok' ? 'check-circle' : 'exclamation-circle'}`} /> {avatarMsg.text}
                        </div>
                      )}
                      {avatarUploading ? (
                        <button className="btn btn-secondary btn-sm" disabled><i className="fas fa-spinner fa-spin" /> Uploading...</button>
                      ) : (
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <i className="fas fa-camera" /> Change Photo
                          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                        </label>
                      )}
                    </>
                  )}
                  {isDelegate && <span style={{ fontSize: '.83rem', color: '#999' }}>Contact the account owner to change photo.</span>}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {msg && (
              <div className={`alert ${msg.type === 'ok' ? 'alert-ok' : 'alert-err'}`} style={{ marginBottom: 18 }}>
                <i className={`fas fa-${msg.type === 'ok' ? 'check-circle' : 'exclamation-circle'}`} /> {msg.text}
              </div>
            )}

            {/* Personal */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3><i className="fas fa-user" style={{ marginRight: 8, color: 'var(--red)' }} />Personal Information</h3></div>
              <div className="card-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required disabled={isDelegate} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      Email Address
                      {emailVerified
                        ? <span style={{ background: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: 8, fontSize: '.68rem', fontWeight: 700 }}><i className="fas fa-check-circle" style={{ marginRight: 3 }} />Verified</span>
                        : <span style={{ background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: 8, fontSize: '.68rem', fontWeight: 700 }}><i className="fas fa-exclamation-circle" style={{ marginRight: 3 }} />Not Verified</span>
                      }
                    </label>
                    <input className="form-control" value={email} disabled style={{ background: '#f9f9f9', color: '#888' }} />
                    {!emailVerified && !isDelegate && (
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '.75rem', color: '#856404' }}>Check your inbox for the verification link.</span>
                        {resendStatus === 'ok'
                          ? <span style={{ fontSize: '.75rem', color: '#27AE60', fontWeight: 600 }}><i className="fas fa-check" /> Email sent!</span>
                          : <button type="button" onClick={handleResend} disabled={resendStatus === 'loading'} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                              {resendStatus === 'loading' ? <><i className="fas fa-spinner fa-spin" /> Sending…</> : 'Resend verification email'}
                            </button>
                        }
                      </div>
                    )}
                    {emailVerified && <span style={{ fontSize: '.72rem', color: '#999', marginTop: 4, display: 'block' }}>Contact support to change email.</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-group">
                      <i className="fas fa-phone input-icon" />
                      <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" disabled={isDelegate} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3><i className="fas fa-building" style={{ marginRight: 8, color: 'var(--red)' }} />Business Details</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label>Company Name</label>
                  <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} placeholder="ABC Enterprises Pvt Ltd" disabled={isDelegate} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>GST Number <span style={{ color: '#999', fontWeight: 400 }}>(15 digits)</span></label>
                    <input className="form-control" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value.toUpperCase())} maxLength={15} placeholder="27AAAAA0000A1Z5" style={{ fontFamily: 'monospace', letterSpacing: 1 }} disabled={isDelegate} />
                  </div>
                  <div className="form-group">
                    <label>CIN Number <span style={{ color: '#999', fontWeight: 400 }}>(21 chars)</span></label>
                    <input className="form-control" value={form.cinNumber} onChange={e => set('cinNumber', e.target.value.toUpperCase())} maxLength={21} placeholder="U12345MH2010PTC123456" style={{ fontFamily: 'monospace', letterSpacing: 1 }} disabled={isDelegate} />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3><i className="fas fa-map-marker-alt" style={{ marginRight: 8, color: 'var(--red)' }} />Registered Address</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label>Street Address</label>
                  <textarea className="form-control" rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Building, Street, Area" disabled={isDelegate} />
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>City</label>
                    <input className="form-control" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" disabled={isDelegate} />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <select className="form-control" value={form.state} onChange={e => set('state', e.target.value)} disabled={isDelegate}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>PIN Code</label>
                    <input className="form-control" value={form.pincode} onChange={e => set('pincode', e.target.value)} maxLength={6} placeholder="400001" disabled={isDelegate} />
                  </div>
                </div>
              </div>
            </div>

            {!isDelegate && (
              <div style={{ marginBottom: 24 }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin" /> Saving...</> : <><i className="fas fa-save" /> Save Profile</>}
                </button>
              </div>
            )}
          </form>

          {/* Security — Change Password */}
          {!isDelegate && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3><i className="fas fa-shield-alt" style={{ marginRight: 8, color: 'var(--red)' }} />Security — Change Password</h3></div>
              <div className="card-body">
                {pwStatus === 'ok' && <div className="alert alert-ok"><i className="fas fa-check-circle" /> Password changed successfully!</div>}
                {pwStatus === 'err' && <div className="alert alert-err"><i className="fas fa-exclamation-circle" /> {pwErr}</div>}

                <form onSubmit={handlePwSubmit}>
                  <div className="form-grid-2">
                    {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => {
                      const labels = { currentPassword: 'Current Password', newPassword: 'New Password', confirmPassword: 'Confirm New Password' }
                      const pwKey = field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'
                      return (
                        <div key={field} className="form-group" style={field === 'currentPassword' ? { gridColumn: '1 / -1' } : {}}>
                          <label>{labels[field]}</label>
                          <div className="input-group" style={{ position: 'relative' }}>
                            <i className="fas fa-lock input-icon" />
                            <input
                              className="form-control"
                              type={pwShow[pwKey as keyof typeof pwShow] ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={pwForm[field]}
                              onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                              required
                            />
                            <button type="button" className="toggle-pw" onClick={() => setPwShow(s => ({ ...s, [pwKey]: !s[pwKey as keyof typeof s] }))}>
                              <i className={`fas fa-${pwShow[pwKey as keyof typeof pwShow] ? 'eye-slash' : 'eye'}`} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="alert alert-info" style={{ fontSize: '.8rem', marginTop: 4, marginBottom: 16 }}>
                    <i className="fas fa-info-circle" /> Use at least 8 characters with a mix of letters, numbers, and symbols.
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={pwStatus === 'loading'}>
                    {pwStatus === 'loading' ? <><i className="fas fa-spinner fa-spin" /> Updating...</> : <><i className="fas fa-key" /> Update Password</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
