'use client'
import { useSession, signOut } from 'next-auth/react'
import { LogoMark } from '@/components/LogoMark'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from '@/lib/useTheme'

const navItems = [
  { section: 'Overview', items: [{ href: '/admin/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' }] },
  { section: 'Management', items: [
    { href: '/admin/clients', icon: 'fa-users', label: 'Clients' },
    { href: '/admin/invoices', icon: 'fa-file-invoice-dollar', label: 'Invoices' },
    { href: '/admin/documents', icon: 'fa-folder-open', label: 'Documents' },
    { href: '/admin/tickets', icon: 'fa-headset', label: 'Support Tickets' },
  ]},
  { section: 'Access Control', items: [
    { href: '/admin/roles', icon: 'fa-user-shield', label: 'Roles' },
    { href: '/admin/employees', icon: 'fa-id-badge', label: 'Employees' },
  ]},
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Admin Top Bar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'var(--dark)', borderBottom: '1px solid rgba(196,30,58,.3)', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '1.1rem', cursor: 'pointer', display: 'none' }} className="mobile-menu-btn">
            <i className="fas fa-bars" />
          </button>
          <div className="logo">
            <LogoMark href="/" size="md" />
          </div>
          <span style={{ background: 'rgba(196,30,58,.2)', color: '#E8334A', padding: '3px 10px', borderRadius: 10, fontSize: '.72rem', fontWeight: 700 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#A0A0A0', fontSize: '.83rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#C41E3A,#8B0000)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.8rem', fontWeight: 700 }}>
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hide-mobile">{session?.user?.name}</span>
          </span>
          <button onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', color: '#ccc', width: 34, height: 34, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', flexShrink: 0 }}>
            <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`} />
          </button>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="btn btn-secondary btn-sm">
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 149 }} />}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} style={{ top: 64 }}>
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sb-section">{section.section}</div>
            {section.items.map((item) => (
              <Link key={item.href} href={item.href} className={`sb-link${pathname === item.href ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <i className={`fas ${item.icon}`} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </aside>

      <main className="dash-content" style={{ marginTop: 64 }}>
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
