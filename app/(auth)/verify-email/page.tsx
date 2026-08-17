'use client'
import { useEffect, useState, Suspense } from 'react'
import { LogoMark } from '@/components/LogoMark'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'ok' | 'err' | 'already'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('err')
      setMessage('No verification token found. Please use the link from your email.')
      return
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) {
          if (data.message === 'Email already verified.') {
            setStatus('already')
          } else {
            setStatus('ok')
          }
        } else {
          setStatus('err')
          setMessage(data.error || 'Verification failed.')
        }
      })
      .catch(() => {
        setStatus('err')
        setMessage('Something went wrong. Please try again.')
      })
  }, [searchParams])

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div className="logo">
            <LogoMark href="/" size="md" />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <div style={{ width: 64, height: 64, background: 'rgba(196,30,58,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.6rem', color: 'var(--red)' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Verifying your email…</h2>
            <p style={{ color: '#666', fontSize: '.85rem' }}>Please wait a moment.</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <div style={{ width: 64, height: 64, background: 'rgba(39,174,96,.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '1.8rem', color: '#27AE60' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8, color: '#1A1A1A' }}>Email Verified!</h2>
            <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 28 }}>
              Your email address has been verified successfully. Your account is now fully active.
            </p>
            <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>
              <i className="fas fa-tachometer-alt" /> Go to Dashboard
            </Link>
          </>
        )}

        {status === 'already' && (
          <>
            <div style={{ width: 64, height: 64, background: 'rgba(52,152,219,.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '1.8rem', color: '#3498DB' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Already Verified</h2>
            <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 28 }}>Your email is already verified. You can sign in to your account.</p>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>
              <i className="fas fa-sign-in-alt" /> Sign In
            </Link>
          </>
        )}

        {status === 'err' && (
          <>
            <div style={{ width: 64, height: 64, background: 'rgba(231,76,60,.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="fas fa-times-circle" style={{ fontSize: '1.8rem', color: '#E74C3C' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 28 }}>{message}</p>
            <Link href="/login" className="btn btn-primary" style={{ display: 'inline-flex', marginRight: 12 }}>
              <i className="fas fa-sign-in-alt" /> Sign In
            </Link>
            <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
              <i className="fas fa-home" /> Home
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'var(--red)' }} />
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
