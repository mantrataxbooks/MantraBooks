'use client'
import { useSession, signOut } from 'next-auth/react'
import { LogoMark } from '@/components/LogoMark'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/lib/useTheme'

const sidebarItems = [
  { href: '/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { href: '/summary', icon: 'fa-heartbeat', label: 'Financial Summary' },
  { href: '/file-itr', icon: 'fa-file-invoice-dollar', label: 'File ITR' },
  { href: '/company-registration', icon: 'fa-building', label: 'Company Registration' },
]

const profileMenuItems = [
  { href: '/profile', icon: 'fa-user-edit', label: 'My Profile' },
  { href: '/invoices', icon: 'fa-file-invoice-dollar', label: 'My Invoices' },
  { href: '/documents', icon: 'fa-folder-open', label: 'My Documents' },
  { href: '/tickets', icon: 'fa-headset', label: 'Support Tickets' },
  { href: '/delegates', icon: 'fa-user-friends', label: 'Delegate Access' },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isImpersonating = !!session?.user?.impersonatedBy
  const isDelegate = !!session?.user?.delegateFor
  const { theme, toggle } = useTheme()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'var(--dark)', borderBottom: '1px solid rgba(26,86,219,.3)', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '1.1rem', cursor: 'pointer', display: 'none' }} className="mobile-menu-btn">
            <i className="fas fa-bars" />
          </button>
          <Link href="/dashboard" className="logo" style={{ textDecoration: 'none' }}>
            <LogoMark href="/" size="md" />
          </Link>
          {isDelegate && (
            <span style={{ background: 'rgba(52,152,219,.2)', color: '#3498DB', border: '1px solid rgba(52,152,219,.3)', padding: '3px 10px', borderRadius: 10, fontSize: '.7rem', fontWeight: 700 }}>
              <i className="fas fa-user-friends" style={{ marginRight: 4 }} />DELEGATE
            </span>
          )}
        </div>

        {/* Right Actions & Profile Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', color: '#ccc', width: 34, height: 34, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', flexShrink: 0 }}>
            <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`} />
          </button>

          {/* Profile Dropdown Component */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                background: profileDropdownOpen ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 24,
                padding: '4px 12px 4px 5px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                color: '#fff',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1A56DB,#0A2A73)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.85rem', fontWeight: 700, flexShrink: 0 }}>
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '.88rem', fontWeight: 600, color: '#E0E0E0' }} className="hide-mobile">
                {session?.user?.name || 'Client Account'}
              </span>
              <i className={`fas fa-chevron-${profileDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '.75rem', color: '#999' }} />
            </button>

            {profileDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 240,
                  background: 'var(--surface, #1C1C1C)',
                  border: '1px solid var(--border, #333)',
                  borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  padding: '8px 0',
                  zIndex: 300,
                }}
              >
                {/* User Information */}
                <div style={{ padding: '10px 16px 12px', borderBottom: '1px solid var(--border, #333)' }}>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text, #fff)' }}>
                    {session?.user?.name}
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--textl, #999)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session?.user?.email}
                  </div>
                </div>

                {/* Profile Items Moved From Sidebar */}
                <div style={{ padding: '6px 0' }}>
                  {profileMenuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 16px',
                          fontSize: '.85rem',
                          color: isActive ? '#1A56DB' : 'var(--text, #E0E0E0)',
                          fontWeight: isActive ? 700 : 500,
                          textDecoration: 'none',
                          background: isActive ? 'rgba(26,86,219,0.1)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        <i className={`fas ${item.icon}`} style={{ width: 18, color: isActive ? '#1A56DB' : '#64748B', fontSize: '.9rem' }} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--border, #333)', margin: '4px 0' }} />

                {/* Change Password */}
                <Link
                  href="/change-password"
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    fontSize: '.85rem',
                    color: pathname === '/change-password' ? '#1A56DB' : 'var(--text, #E0E0E0)',
                    fontWeight: pathname === '/change-password' ? 700 : 500,
                    textDecoration: 'none',
                  }}
                >
                  <i className="fas fa-key" style={{ width: 18, color: '#64748B', fontSize: '.9rem' }} />
                  Change Password
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    signOut({ callbackUrl: isImpersonating ? '/admin/clients' : '/login' })
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    fontSize: '.85rem',
                    color: '#E74C3C',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <i className="fas fa-sign-out-alt" style={{ width: 18, fontSize: '.9rem' }} />
                  {isImpersonating ? 'Exit Impersonation' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Impersonation Banner */}
      {isImpersonating && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 199,
          background: 'linear-gradient(135deg,#E65100,#BF360C)',
          color: '#fff', padding: '8px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '.83rem', fontWeight: 600, gap: 10,
        }}>
          <span><i className="fas fa-user-secret" style={{ marginRight: 8 }} />Admin view: impersonating <strong>{session?.user?.name}</strong></span>
          <button onClick={() => signOut({ callbackUrl: '/admin/clients' })} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '3px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '.8rem' }}>
            <i className="fas fa-times" style={{ marginRight: 4 }} />Exit Impersonation
          </button>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 149 }} />}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} style={{ top: isImpersonating ? 104 : 64 }}>
        <div className="sb-section">Client Portal</div>
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href} className={`sb-link${pathname === item.href ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <i className={`fas ${item.icon}`} />
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <main className="dash-content" style={{ paddingTop: 28, marginTop: isImpersonating ? 104 : 64 }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
