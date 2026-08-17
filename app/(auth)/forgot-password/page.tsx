'use client'
import { useState } from 'react'
import { LogoMark } from '@/components/LogoMark'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setStatus('ok')
    } else {
      const data = await res.json()
      setErrMsg(data.error || 'Something went wrong.')
      setStatus('err')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div className="logo">
            <LogoMark href="/" size="md" />
          </div>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 5 }}>Forgot Password</h2>
        <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 22 }}>Enter your email and we'll send a reset link.</p>

        {status === 'ok' ? (
          <div>
            <div className="alert alert-ok">
              <i className="fas fa-check-circle" /> Reset link sent! Check your email inbox.
            </div>
            <p style={{ fontSize: '.85rem', color: '#666', marginBottom: 16 }}>Didn't receive it? Check your spam folder or try again.</p>
            <button className="btn btn-outline btn-block" onClick={() => setStatus('idle')}>
              <i className="fas fa-redo" /> Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'err' && <div className="alert alert-err"><i className="fas fa-exclamation-circle" /> {errMsg}</div>}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-group">
                <i className="fas fa-envelope input-icon" />
                <input className="form-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={status === 'loading'}>
              {status === 'loading' ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : <><i className="fas fa-paper-plane" /> Send Reset Link</>}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '.85rem', color: '#666' }}>
          Remember your password?{' '}
          <Link href="/login" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}
