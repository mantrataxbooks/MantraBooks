'use client'
import { useSession, signOut } from 'next-auth/react'
import { LogoMark } from '@/components/LogoMark'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role

  const navItems = [
    ...(role === 'SUPPORT' || role === 'ADMIN' ? [{ href: '/employee/tickets', icon: 'fa-headset', label: 'Support Tickets' }] : []),
    ...(role === 'PAYMENTS' || role === 'ADMIN' ? [{ href: '/employee/payments', icon: 'fa-credit-card', label: 'Payments' }] : []),
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'var(--dark)', borderBottom: '1px solid rgba(196,30,58,.3)', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="logo">
            <LogoMark href="/" size="md" />
          </div>
          <span style={{ background: 'rgba(52,152,219,.2)', color: '#3498db', padding: '3px 10px', borderRadius: 10, fontSize: '.72rem', fontWeight: 700 }}>
            {role}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#A0A0A0', fontSize: '.83rem' }}>{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-secondary btn-sm">
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </nav>

      <aside className="sidebar" style={{ top: 64 }}>
        <div className="sb-section">Employee Portal</div>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={`sb-link${pathname === item.href ? ' active' : ''}`}>
            <i className={`fas ${item.icon}`} />
            {item.label}
          </Link>
        ))}
      </aside>

      <main className="dash-content" style={{ marginTop: 64 }}>
        {children}
      </main>
    </div>
  )
}
