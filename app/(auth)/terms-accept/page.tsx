'use client'
import { useState, useEffect } from 'react'
import { LogoMark } from '@/components/LogoMark'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TermsAcceptPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
    if (status === 'authenticated' && !session?.user?.needsTerms) {
      router.replace('/dashboard')
    }
  }, [status, session, router])

  const handleAccept = async () => {
    if (!agreed) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/accept-terms', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to save')
      await update({ needsTerms: false })
      router.replace('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="ta-page">
        <div className="ta-card" style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: '#C41E3A' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="ta-page">
      <div className="ta-card">
        {/* Logo */}
        <div className="ta-logo">
          <LogoMark href="/" size="md" />
        </div>

        {/* Google success indicator */}
        <div className="ta-google-badge">
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <i className="fas fa-check-circle" style={{ color: '#27AE60' }} />
          Signed in with Google
        </div>

        <h2 className="ta-title">One last step</h2>
        <p className="ta-sub">
          Review and accept our terms to start using MantraTaxbooks.
        </p>

        {/* What we collect */}
        <div className="ta-info-box">
          <div className="ta-info-title">
            <i className="fas fa-info-circle" /> What we use from your Google account
          </div>
          <ul className="ta-info-list">
            <li><i className="fas fa-user" /> Your <strong>name</strong> for your account profile</li>
            <li><i className="fas fa-envelope" /> Your <strong>email address</strong> to identify your account and send updates</li>
            <li><i className="fas fa-image" /> Your <strong>profile photo</strong> displayed inside the portal</li>
          </ul>
          <p className="ta-info-note">
            We never access your Google contacts, Drive, Gmail or any other Google data.
          </p>
        </div>

        {/* Terms highlights */}
        <div className="ta-terms-highlights">
          <div className="ta-highlight">
            <span className="ta-hl-icon ta-hl-icon--lock"><i className="fas fa-lock" /></span>
            <div>
              <strong>Your data is secure</strong>
              <span>AES-256 encryption. We never sell your personal information.</span>
            </div>
          </div>
          <div className="ta-highlight">
            <span className="ta-hl-icon ta-hl-icon--doc"><i className="fas fa-file-contract" /></span>
            <div>
              <strong>CA-reviewed filing</strong>
              <span>Documents you submit are used solely for tax compliance on your behalf.</span>
            </div>
          </div>
          <div className="ta-highlight">
            <span className="ta-hl-icon ta-hl-icon--revoke"><i className="fas fa-user-slash" /></span>
            <div>
              <strong>You stay in control</strong>
              <span>Delete your account anytime. Revoke Google access from your Google settings.</span>
            </div>
          </div>
        </div>

        {/* Agreement checkbox */}
        <label className={`ta-agree-label${agreed ? ' ta-agree-label--checked' : ''}`}>
          <div className="ta-radio-wrap">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="ta-checkbox-hidden"
            />
            <span className="ta-custom-checkbox">
              {agreed && <i className="fas fa-check" />}
            </span>
          </div>
          <span className="ta-agree-text">
            I agree to MantraTaxbooks{' '}
            <Link href="/terms" target="_blank" className="ta-link">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" target="_blank" className="ta-link">Privacy Policy</Link>
          </span>
        </label>

        {error && (
          <div className="alert alert-err" style={{ marginBottom: 12 }}>
            <i className="fas fa-exclamation-circle" /> {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-block btn-lg ta-cta"
          disabled={!agreed || loading}
          onClick={handleAccept}
        >
          {loading
            ? <><i className="fas fa-spinner fa-spin" /> Setting up your account...</>
            : <><i className="fas fa-arrow-right" /> Continue to Dashboard</>
          }
        </button>

        <p className="ta-footer-note">
          By continuing, you confirm you&apos;re 18 years or older and authorize MantraTaxbooks to file returns on your behalf as instructed.
        </p>
      </div>

      <style>{`
        .ta-page { min-height:100vh;background:linear-gradient(135deg,#0d0d0d 0%,#1a0608 50%,#0d0d0d 100%);display:flex;align-items:center;justify-content:center;padding:24px; }
        .ta-card { background:#fff;border-radius:20px;padding:40px 36px;width:100%;max-width:480px;box-shadow:0 24px 64px rgba(0,0,0,.35); }
        .ta-logo { display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:16px; }
        .ta-google-badge { display:inline-flex;align-items:center;gap:8px;background:#f0faf4;border:1px solid #c3e6cb;border-radius:20px;padding:5px 14px;font-size:.78rem;font-weight:600;color:#27AE60;margin-bottom:18px;width:100%;justify-content:center; }
        .ta-title { font-size:1.5rem;font-weight:800;color:#1A1A1A;text-align:center;margin-bottom:6px; }
        .ta-sub { font-size:.88rem;color:#666;text-align:center;margin-bottom:24px;line-height:1.6; }

        .ta-info-box { background:#f8f9ff;border:1px solid #dde5ff;border-radius:12px;padding:16px 18px;margin-bottom:20px; }
        .ta-info-title { font-size:.82rem;font-weight:700;color:#4285F4;margin-bottom:10px;display:flex;align-items:center;gap:7px; }
        .ta-info-list { list-style:none;padding:0;margin:0 0 10px;display:flex;flex-direction:column;gap:7px; }
        .ta-info-list li { font-size:.83rem;color:#444;display:flex;align-items:center;gap:10px; }
        .ta-info-list li i { color:#4285F4;width:14px;text-align:center;font-size:.78rem; }
        .ta-info-note { font-size:.76rem;color:#888;margin:0;padding-top:10px;border-top:1px solid #dde5ff; }

        .ta-terms-highlights { display:flex;flex-direction:column;gap:12px;margin-bottom:24px; }
        .ta-highlight { display:flex;align-items:flex-start;gap:13px; }
        .ta-hl-icon { width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0; }
        .ta-hl-icon--lock { background:rgba(196,30,58,.1);color:#C41E3A; }
        .ta-hl-icon--doc { background:rgba(66,133,244,.1);color:#4285F4; }
        .ta-hl-icon--revoke { background:rgba(39,174,96,.1);color:#27AE60; }
        .ta-highlight > div { display:flex;flex-direction:column;gap:2px; }
        .ta-highlight strong { font-size:.85rem;font-weight:700;color:#1A1A1A; }
        .ta-highlight span { font-size:.78rem;color:#666;line-height:1.5; }

        .ta-agree-label { display:flex;align-items:flex-start;gap:12px;cursor:pointer;padding:14px 16px;border:2px solid #e0e0e0;border-radius:12px;margin-bottom:16px;transition:all .2s; }
        .ta-agree-label--checked { border-color:#C41E3A;background:rgba(196,30,58,.04); }
        .ta-radio-wrap { flex-shrink:0;padding-top:1px; }
        .ta-checkbox-hidden { position:absolute;opacity:0;width:0;height:0; }
        .ta-custom-checkbox { width:22px;height:22px;border:2px solid #ccc;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all .2s;font-size:.7rem;background:#fff; }
        .ta-agree-label--checked .ta-custom-checkbox { background:#C41E3A;border-color:#C41E3A;color:#fff; }
        .ta-agree-text { font-size:.87rem;color:#333;line-height:1.6; }
        .ta-link { color:#C41E3A;text-decoration:none;font-weight:600; }
        .ta-link:hover { text-decoration:underline; }

        .ta-cta { margin-top:4px; }
        .ta-cta:disabled { opacity:.45;cursor:not-allowed; }
        .ta-footer-note { font-size:.74rem;color:#aaa;text-align:center;margin-top:14px;line-height:1.6; }

        @media (max-width:520px) {
          .ta-card { padding:28px 20px; }
          .ta-title { font-size:1.3rem; }
        }
      `}</style>
    </div>
  )
}
