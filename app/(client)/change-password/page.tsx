'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChangePasswordRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/profile') }, [router])
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'var(--red)' }} />
    </div>
  )
}
