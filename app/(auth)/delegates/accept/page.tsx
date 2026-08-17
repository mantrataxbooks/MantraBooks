'use client'
import { Suspense, useEffect, useState } from 'react'
import { LogoMark } from '@/components/LogoMark'
import { useSearchParams, useRouter } from 'next/navigation'

function AcceptContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) { setError('Invalid invite link.'); setLoading(false); return }
    fetch(`/api/delegates/accept?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setInfo(d)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load invite.'); setLoading(false) })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/delegates/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name: info?.hasAccount ? undefined : name, password: info?.hasAccount ? undefined : password }),
    })
    const d = await res.json()
    setSubmitting(false)
    if (d.error) { setError(d.error); return }
    setDone(true)
  }

  return (
    <div className="auth-card" style={{ maxWidth: 440 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div className="logo">
          <LogoMark href="/" size="md" />
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#666' }}><i className="fas fa-spinner fa-spin" /> Loading invite...</p>}

      {error && !loading && (
        <div className="alert alert-err">
          <i className="fas fa-exclamation-circle" /> {error}
          <div style={{ marginTop: 12 }}><a href="/login" style={{ color: 'var(--red)', fontWeight: 600 }}>← Go to login</a></div>
        </div>
      )}

      {done && (
        <div className="alert alert-ok">
          <i className="fas fa-check-circle" /> Access granted! You can now log in.
          <div style={{ marginTop: 12 }}>
            <a href="/login" className="btn btn-primary btn-sm">Go to Login →</a>
          </div>
        </div>
      )}

      {info && !done && !error && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ background: 'rgba(196,30,58,.08)', color: 'var(--red)', border: '1px solid rgba(196,30,58,.2)', padding: '4px 14px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700 }}>
              <i className="fas fa-user-friends" style={{ marginRight: 6 }} />DELEGATE INVITATION
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>You've been invited</h2>
          <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 20 }}>
            <strong>{info.ownerName}</strong>{info.ownerCompany ? ` (${info.ownerCompany})` : ''} has invited you to access their account at Mantra Taxbooks.
          </p>
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px', fontSize: '.83rem', marginBottom: 20, color: '#555' }}>
            <i className="fas fa-envelope" style={{ marginRight: 8, color: 'var(--red)' }} />
            Invite sent to: <strong>{info.email}</strong>
          </div>

          {info.hasAccount ? (
            <>
              <div className="alert" style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', borderRadius: 8, padding: '10px 14px', fontSize: '.85rem', marginBottom: 16 }}>
                <i className="fas fa-info-circle" /> You already have an account. Click Accept to grant access.
              </div>
              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-err" style={{ marginBottom: 10 }}>{error}</div>}
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? <><i className="fas fa-spinner fa-spin" /> Accepting...</> : <><i className="fas fa-check" /> Accept &amp; Grant Access</>}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Full Name *</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
              </div>
              <div className="form-group">
                <label>Create Password *</label>
                <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
              </div>
              {error && <div className="alert alert-err">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? <><i className="fas fa-spinner fa-spin" /> Creating account...</> : <><i className="fas fa-user-check" /> Create Account &amp; Accept</>}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

export default function AcceptDelegatePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Suspense fallback={<div style={{ textAlign: 'center' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--red)' }} /></div>}>
        <AcceptContent />
      </Suspense>
    </div>
  )
}
