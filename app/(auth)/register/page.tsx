'use client'
import { useState } from 'react'
import { LogoMark } from '@/components/LogoMark'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || null, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Registration failed. Please try again.'); setLoading(false); return }

    const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    setLoading(false)
    if (signInRes?.error) { router.push('/login?registered=1') } else { router.push('/dashboard') }
  }

  return (
    <>
      <div className="auth-split-page">
        {/* ── LEFT PANEL ── */}
        <div className="auth-left-panel">
          <div className="auth-left-inner">
            <Link href="/" className="auth-logo-link">
              <LogoMark href="/" size="md" />
            </Link>

            <div className="auth-left-content">
              <h1 className="auth-left-h1">India&apos;s trusted CA-backed tax platform</h1>
              <p className="auth-left-p">Join 5,000+ individuals and businesses who file taxes with confidence, speed and accuracy.</p>

              <div className="auth-trust-list">
                {[
                  { icon: 'fa-user-tie', text: 'Every return reviewed by a qualified CA' },
                  { icon: 'fa-bolt', text: 'Most ITRs filed within 24 hours' },
                  { icon: 'fa-lock', text: 'Bank-grade AES-256 encryption' },
                  { icon: 'fa-headset', text: 'WhatsApp & call support included' },
                ].map(item => (
                  <div key={item.text} className="auth-trust-item">
                    <div className="auth-trust-icon"><i className={`fas ${item.icon}`} /></div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="auth-left-testimonial">
                <p>&ldquo;MantraTaxbooks saved me ₹28,000 in taxes and filed my return in under 24 hours. Absolutely professional.&rdquo;</p>
                <div className="auth-testi-author">
                  <div className="auth-testi-avatar">R</div>
                  <div>
                    <strong>Rajesh Kumar</strong>
                    <span>Senior Manager, TCS · Bengaluru</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-left-stats">
              {[['5,000+', 'Clients'], ['₹2Cr+', 'Tax Saved'], ['99%', 'On-time']].map(([n, l]) => (
                <div key={l} className="auth-left-stat">
                  <span className="auth-stat-n">{n}</span>
                  <span className="auth-stat-l">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right-panel">
          <div className="auth-right-inner">
            <div className="auth-form-head">
              <h2>Create your account</h2>
              <p>Start your CA-assisted tax filing journey today</p>
            </div>

            {error && <div className="alert alert-err"><i className="fas fa-exclamation-circle" /> {error}</div>}

            {/* Google */}
            <button
              type="button"
              className="auth-google-btn"
              disabled={googleLoading || loading}
              onClick={() => { setGoogleLoading(true); signIn('google', { callbackUrl: '/dashboard' }) }}
            >
              {googleLoading ? <i className="fas fa-spinner fa-spin" /> : (
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Sign up with Google
            </button>

            <div className="auth-divider"><span>or create account with email</span></div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <div className="input-group">
                  <i className="fas fa-user input-icon" />
                  <input className="form-control" type="text" placeholder="Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} required autoFocus />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <div className="input-group">
                  <i className="fas fa-envelope input-icon" />
                  <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>Mobile Number <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                <div className="input-group">
                  <i className="fas fa-phone input-icon" />
                  <input className="form-control" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>

              <div className="form-grid-2" style={{ gap: 14 }}>
                <div className="form-group">
                  <label>Password *</label>
                  <div className="input-group" style={{ position: 'relative' }}>
                    <i className="fas fa-lock input-icon" />
                    <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                    <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>
                      <i className={`fas fa-${showPw ? 'eye-slash' : 'eye'}`} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <div className="input-group" style={{ position: 'relative' }}>
                    <i className="fas fa-lock input-icon" />
                    <input className="form-control" type={showCpw ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
                    <button type="button" className="toggle-pw" onClick={() => setShowCpw(!showCpw)}>
                      <i className={`fas fa-${showCpw ? 'eye-slash' : 'eye'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="auth-security-note">
                <i className="fas fa-shield-alt" />
                <span>Your data is encrypted and stored securely. We never share your information.</span>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading
                  ? <><i className="fas fa-spinner fa-spin" /> Creating Account...</>
                  : <><i className="fas fa-user-plus" /> Create Account</>}
              </button>
            </form>

            <p className="auth-footer-note">
              Already have an account?{' '}
              <Link href="/login">Sign In</Link>
            </p>
            <p className="auth-footer-note" style={{ marginTop: 8 }}>
              Admin?{' '}
              <Link href="/admin/login">Admin Portal →</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-split-page {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .auth-left-panel {
          background: linear-gradient(160deg, #0F172A 0%, #1E3A8A 60%, #1643B7 100%);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .auth-left-panel::before {
          content: '';
          position: absolute; top: -200px; right: -150px;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-left-panel::after {
          content: '';
          position: absolute; bottom: -180px; left: -120px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-left-inner {
          position: relative; z-index: 1;
          padding: 48px 52px;
          display: flex; flex-direction: column;
          height: 100%; min-height: 100vh;
        }
        .auth-logo-link {
          display: inline-flex; align-items: center; text-decoration: none;
          margin-bottom: 56px;
        }
        .auth-logo-link .logo-m {
          background: linear-gradient(135deg,#1A56DB,#1643B7);
          color: #fff; font-weight: 900; font-size: 0.95rem;
          letter-spacing: 3px; padding: 6px 12px; border: 2px solid #1A56DB;
        }
        .auth-logo-link .logo-t {
          background: rgba(255,255,255,0.08); color: #E2E8F0;
          font-weight: 900; font-size: 0.95rem; letter-spacing: 3px;
          padding: 6px 12px; border: 2px solid rgba(255,255,255,0.15);
          border-left: none;
        }
        .auth-left-content { flex: 1; }
        .auth-left-h1 {
          font-size: 2rem; font-weight: 800; color: #fff;
          line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.025em;
        }
        .auth-left-p {
          font-size: 0.95rem; color: #94A3B8; line-height: 1.72;
          margin-bottom: 40px; max-width: 380px;
        }

        .auth-trust-list {
          display: flex; flex-direction: column; gap: 18px; margin-bottom: 44px;
        }
        .auth-trust-item {
          display: flex; align-items: center; gap: 14px;
          font-size: 0.875rem; color: #CBD5E1; font-weight: 500;
        }
        .auth-trust-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: rgba(26,86,219,0.18); border: 1px solid rgba(26,86,219,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #93C5FD; font-size: 0.9rem;
        }

        .auth-left-testimonial {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 22px 24px; margin-bottom: 40px;
          border-left: 3px solid #1A56DB;
        }
        .auth-left-testimonial p {
          font-size: 0.875rem; color: #E2E8F0; line-height: 1.7;
          font-style: italic; margin-bottom: 16px;
        }
        .auth-testi-author {
          display: flex; align-items: center; gap: 12px;
        }
        .auth-testi-avatar {
          width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg,#1A56DB,#1643B7);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.95rem;
        }
        .auth-testi-author strong {
          display: block; font-size: 0.85rem; color: #fff; font-weight: 700;
        }
        .auth-testi-author span {
          font-size: 0.74rem; color: #64748B;
        }

        .auth-left-stats {
          display: flex; gap: 0;
          border-top: 1px solid rgba(255,255,255,0.08); padding-top: 28px;
        }
        .auth-left-stat {
          flex: 1; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .auth-left-stat:last-child { border-right: none; }
        .auth-stat-n {
          display: block; font-size: 1.5rem; font-weight: 800;
          color: #93C5FD; letter-spacing: -0.03em;
        }
        .auth-stat-l {
          display: block; font-size: 0.7rem; color: #64748B;
          text-transform: uppercase; letter-spacing: 1px;
          margin-top: 4px; font-weight: 500;
        }

        /* ── RIGHT PANEL ── */
        .auth-right-panel {
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 3%; overflow-y: auto;
        }
        .auth-right-inner {
          width: 100%; max-width: 480px;
        }
        .auth-form-head { margin-bottom: 28px; }
        .auth-form-head h2 {
          font-size: 1.65rem; font-weight: 800; color: #0F172A;
          margin-bottom: 6px; letter-spacing: -0.022em;
        }
        .auth-form-head p { font-size: 0.88rem; color: #6B7280; }

        .auth-google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 12px; padding: 13px 20px;
          background: #fff; border: 1.5px solid #E5E7EB; border-radius: 12px;
          font-size: 0.925rem; font-weight: 600; color: #374151;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
          margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .auth-google-btn:hover {
          border-color: #1A56DB; box-shadow: 0 4px 16px rgba(26,86,219,0.12);
          transform: translateY(-1px);
        }
        .auth-google-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .auth-divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 24px; color: #CBD5E1; font-size: 0.8rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: #F1F5F9;
        }
        .auth-divider span { color: #9CA3AF; white-space: nowrap; }

        /* Override form-control focus to green */
        .auth-right-panel .form-control:focus {
          border-color: #1A56DB !important;
          box-shadow: 0 0 0 3px rgba(26,86,219,0.12) !important;
        }
        .auth-right-panel .form-group { margin-bottom: 18px; }
        .auth-right-panel label {
          font-size: 0.82rem; font-weight: 600; color: #374151; display: block; margin-bottom: 7px;
        }

        .auth-security-note {
          display: flex; align-items: center; gap: 10px;
          background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px;
          padding: 11px 14px; font-size: 0.8rem; color: #1E3A8A;
          margin-bottom: 22px; line-height: 1.5;
        }
        .auth-security-note i { color: #1A56DB; flex-shrink: 0; }

        .auth-submit-btn {
          width: 100%; padding: 14px 24px;
          background: linear-gradient(135deg, #1A56DB, #1643B7);
          color: #fff; font-weight: 700; font-size: 1rem;
          border: none; border-radius: 12px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          font-family: inherit; transition: all 0.25s;
          box-shadow: 0 6px 20px rgba(26,86,219,0.3);
          margin-bottom: 24px;
        }
        .auth-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563EB, #1A56DB);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(26,86,219,0.4);
        }
        .auth-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .auth-footer-note {
          text-align: center; font-size: 0.84rem; color: #6B7280;
        }
        .auth-footer-note a {
          color: #1A56DB; text-decoration: none; font-weight: 700;
        }
        .auth-footer-note a:hover { text-decoration: underline; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .auth-split-page { grid-template-columns: 1fr; }
          .auth-left-panel { display: none; }
          .auth-right-panel { padding: 48px 24px; min-height: 100vh; }
          .auth-right-inner::before {
            content: '';
            display: block;
            background: linear-gradient(160deg, #0F172A 0%, #1E3A8A 100%);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
          }
        }
        @media (max-width: 900px) {
          .auth-right-panel {
            align-items: flex-start;
          }
          .auth-right-inner {
            padding-top: 40px;
          }
          /* Show small logo on mobile */
          .auth-right-inner::before {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
