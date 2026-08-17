'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function CompanyRegistrationPage() {
  const [email, setEmail] = useState('')
  const [notified, setNotified] = useState(false)

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setNotified(true)
      setTimeout(() => {
        setNotified(false)
        setEmail('')
      }, 4000)
    }
  }

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'inherit' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 760,
          background: 'var(--surface, #1E293B)',
          border: '1px solid var(--border, #334155)',
          borderRadius: 20,
          padding: '48px 3%',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* ICON BADGE */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(10,42,115,0.4) 100%)',
            border: '1.5px solid #3B82F6',
            color: '#60A5FA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: 24,
            boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
          }}
        >
          🏢
        </div>

        {/* PILL TAG */}
        <span
          style={{
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid #3B82F6',
            color: '#60A5FA',
            padding: '5px 16px',
            borderRadius: 20,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          MCA Incorporation Portal · Under Development
        </span>

        {/* TITLE */}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text, #FFFFFF)', margin: '0 0 14px 0', lineHeight: 1.2 }}>
          Company Registration <br />
          <span style={{ color: '#60A5FA' }}>Coming Soon</span>
        </h1>

        {/* SUBTITLE */}
        <p style={{ fontSize: '0.96rem', color: 'var(--textl, #94A3B8)', maxWidth: 540, margin: '0 0 32px 0', lineHeight: 1.6 }}>
          We are crafting an end-to-end automated registration platform for Private Limited, LLP, OPC, and Section 8 incorporations directly integrated with the Ministry of Corporate Affairs.
        </p>

        {/* NOTIFICATION FORM */}
        <div style={{ width: '100%', maxWidth: 480, marginBottom: 32 }}>
          {notified ? (
            <div
              style={{
                background: 'rgba(22, 163, 74, 0.15)',
                border: '1px solid #16A34A',
                color: '#4ADE80',
                padding: '14px 20px',
                borderRadius: 10,
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              ✓ Thank you! We will notify you as soon as Company Registration goes live.
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="email"
                required
                placeholder="Enter your email to get notified"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 240,
                  background: 'var(--surface2, #0F172A)',
                  border: '1px solid var(--border, #334155)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  color: 'var(--text, #FFFFFF)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(37,99,235,0.4)',
                }}
              >
                Notify Me
              </button>
            </form>
          )}
        </div>

        {/* TEASER FEATURES */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            width: '100%',
            paddingTop: 28,
            borderTop: '1px solid var(--border, #334155)',
            textAlign: 'left',
          }}
        >
          <div style={{ background: 'var(--surface2, #0F172A)', padding: 16, borderRadius: 10, border: '1px solid var(--border, #334155)' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>⚡</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text, #FFFFFF)', marginBottom: 4 }}>10-Day Incorporation</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--textl, #94A3B8)' }}>Fast-track SPICe+ MCA filing with COI, PAN &amp; TAN.</div>
          </div>

          <div style={{ background: 'var(--surface2, #0F172A)', padding: 16, borderRadius: 10, border: '1px solid var(--border, #334155)' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>🛡</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text, #FFFFFF)', marginBottom: 4 }}>CA &amp; CS Legal Vetting</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--textl, #94A3B8)' }}>Expert trademark &amp; MCA name availability verification.</div>
          </div>

          <div style={{ background: 'var(--surface2, #0F172A)', padding: 16, borderRadius: 10, border: '1px solid var(--border, #334155)' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>📄</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text, #FFFFFF)', marginBottom: 4 }}>Digital Vault</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--textl, #94A3B8)' }}>Secure MOA, AOA, and share certificate generation.</div>
          </div>
        </div>

        {/* BACK TO DASHBOARD LINK */}
        <div style={{ marginTop: 32 }}>
          <Link
            href="/dashboard"
            style={{
              color: '#60A5FA',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Return to Client Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
