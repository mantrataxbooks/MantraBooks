'use client'
import { Suspense, useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function ImpersonateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { setError('Invalid impersonation link.'); return }

    signIn('credentials', { impersonateToken: token, redirect: false }).then(res => {
      if (res?.error) {
        setError('Impersonation token is invalid or has expired. Please try again from the admin panel.')
      } else {
        router.push('/dashboard')
      }
    })
  }, [searchParams, router])

  return (
    <div style={{ textAlign: 'center' }}>
      {error ? (
        <>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', color: 'var(--err)', marginBottom: 12, display: 'block' }} />
          <p style={{ color: 'var(--err)', fontWeight: 600 }}>{error}</p>
          <a href="/admin/clients" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>← Back to Admin</a>
        </>
      ) : (
        <>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--red)', marginBottom: 12, display: 'block' }} />
          <p style={{ color: '#666' }}>Switching to client view...</p>
        </>
      )}
    </div>
  )
}

export default function ImpersonatePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <Suspense fallback={<div style={{ textAlign: 'center' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--red)' }} /></div>}>
        <ImpersonateContent />
      </Suspense>
    </div>
  )
}
