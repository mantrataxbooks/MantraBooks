'use client'
import { useState, Suspense } from 'react'
import { LogoMark } from '@/components/LogoMark'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setErrMsg('Passwords do not match.'); setStatus('err'); return }
    if (password.length < 8) { setErrMsg('Password must be at least 8 characters.'); setStatus('err'); return }

    setStatus('loading')
    setErrMsg('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    if (res.ok) {
      setStatus('ok')
      setTimeout(() => router.push('/login'), 2500)
    } else {
      const data = await res.json()
      setErrMsg(data.error || 'Invalid or expired link.')
      setStatus('err')
    }
  }

  if (!token) {
    return (
      <div>
        <div className="alert alert-err"><i className="fas fa-exclamation-circle" /> Invalid reset link. Please request a new one.</div>
        <Link href="/forgot-password" className="btn btn-primary btn-block">Request New Link</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {status === 'ok' && <div className="alert alert-ok"><i className="fas fa-check-circle" /> Password reset! Redirecting to login...</div>}
      {status === 'err' && <div className="alert alert-err"><i className="fas fa-exclamation-circle" /> {errMsg}</div>}

      <div className="form-group">
        <label>New Password</label>
        <div className="input-group" style={{ position: 'relative' }}>
          <i className="fas fa-lock input-icon" />
          <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required disabled={status === 'ok'} />
          <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>
            <i className={`fas fa-${showPw ? 'eye-slash' : 'eye'}`} />
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Confirm New Password</label>
        <div className="input-group">
          <i className="fas fa-lock input-icon" />
          <input className="form-control" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required disabled={status === 'ok'} />
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={status === 'loading' || status === 'ok'}>
        {status === 'loading' ? <><i className="fas fa-spinner fa-spin" /> Resetting...</> : <><i className="fas fa-key" /> Reset Password</>}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div className="logo">
            <LogoMark href="/" size="md" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 5 }}>Reset Password</h2>
        <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 22 }}>Enter your new password below.</p>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetForm />
        </Suspense>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '.85rem', color: '#666' }}>
          <Link href="/login" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
