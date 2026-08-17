'use client'
import { useState } from 'react'
import { LogoMark } from '@/components/LogoMark'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', { email, password, callbackUrl: '/admin/dashboard', redirect: false })

    if (res?.error) {
      setLoading(false)
      setError('Invalid email or password.')
      return
    }

    window.location.href = res?.url || '/admin/dashboard'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#2D2D2D',
        border: '1px solid rgba(196,30,58,0.3)',
        borderRadius: 16,
        padding: '40px 3%',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div className="logo">
            <LogoMark href="/" size="md" />
          </div>
        </div>

        {/* Admin Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <span style={{
            background: 'rgba(196,30,58,0.2)',
            color: '#E8334A',
            border: '1px solid rgba(196,30,58,0.4)',
            padding: '4px 16px',
            borderRadius: 20,
            fontSize: '.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}>
            <i className="fas fa-shield-alt" style={{ marginRight: 6 }} />
            ADMINISTRATOR PORTAL
          </span>
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: 4, textAlign: 'center' }}>Admin Sign In</h2>
        <p style={{ color: '#888', fontSize: '.83rem', marginBottom: 24, textAlign: 'center' }}>Restricted access — authorized personnel only</p>

        {error && (
          <div style={{
            background: 'rgba(231,76,60,0.15)',
            border: '1px solid rgba(231,76,60,0.4)',
            color: '#E74C3C',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: '.83rem',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <i className="fas fa-exclamation-circle" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#C0C0C0', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-envelope" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '.85rem' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@mantrataxbooks.com"
                required
                autoFocus
                style={{
                  width: '100%',
                  background: '#1A1A1A',
                  border: '1px solid #444',
                  borderRadius: 8,
                  padding: '10px 12px 10px 36px',
                  color: '#fff',
                  fontSize: '.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#C0C0C0', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '.85rem' }} />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  background: '#1A1A1A',
                  border: '1px solid #444',
                  borderRadius: 8,
                  padding: '10px 40px 10px 36px',
                  color: '#fff',
                  fontSize: '.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}
              >
                <i className={`fas fa-${showPw ? 'eye-slash' : 'eye'}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#8B0000' : 'linear-gradient(135deg,#C41E3A,#8B0000)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: '.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin" /> Authenticating...</>
              : <><i className="fas fa-sign-in-alt" /> Sign In to Admin Panel</>
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.78rem', color: '#555' }}>
          Client portal?{' '}
          <a href="/login" style={{ color: '#C41E3A', textDecoration: 'none', fontWeight: 600 }}>Login here</a>
        </p>
      </div>
    </div>
  )
}
