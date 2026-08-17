'use client'

import { LogoMark } from '@/components/LogoMark'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const itrPlans = [
  {
    id: 'salary-nil',
    name: 'Salary (Nil Return)',
    price: '999',
    per: 'per year',
    tax: 'Exclusive of GST',
    badge: null,
    desc: 'Single salary income with total income ≤ ₹12,75,000',
    features: [
      'Single Employer',
      'Income from other sources',
      'Total income ≤ ₹12,75,000',
      'CA reviewed filing'
    ],
    deliverables: [
      'Income tax return acknowledgement',
      'Statement of Income',
      'Financial health report',
      'Tax planning report'
    ],
  },
  {
    id: 'salary-property',
    name: 'Salary & Property',
    price: '2,000',
    per: 'per year',
    tax: 'Exclusive of GST',
    badge: null,
    desc: 'Salary + House Property income',
    features: [
      'Single or multiple employers',
      'Single or multiple house properties',
      'Income from other sources',
      'CA reviewed filing'
    ],
    deliverables: [
      'Income tax return acknowledgement',
      'Statement of Income',
      'Financial health report',
      'Tax planning report'
    ],
  },
  {
    id: 'capital-gains',
    name: 'Capital Gains',
    price: '2,500',
    per: 'per year',
    tax: 'Exclusive of GST',
    badge: 'Most Popular',
    desc: 'Salary + Rent + Capital Gains (shares, MFs, properties)',
    features: [
      'Single or multiple employers',
      'Single or multiple house properties',
      'Multiple capital gain incomes (shares, MFs, properties)',
      'Other sources',
      'CA reviewed filing'
    ],
    deliverables: [
      'Income tax return acknowledgement',
      'Statement of Income',
      'Financial health report',
      'Tax planning report',
      'Losses carried forward report'
    ],
  },
  {
    id: 'business',
    name: 'Business / Professional Income',
    price: '3,000',
    per: 'per year',
    tax: 'Exclusive of GST',
    badge: null,
    desc: 'Salary + Rent + Capital Gains + Business/Professional Income',
    features: [
      'Single or multiple employers',
      'Single or multiple house properties',
      'Multiple capital gain incomes',
      'Business/Professional Income (Non-Audit) — without B/S & P&L',
      'Other sources',
      'CA reviewed filing'
    ],
    deliverables: [
      'Income tax return acknowledgement',
      'Statement of Income',
      'Financial health report',
      'Tax planning report',
      'Losses carried forward report'
    ],
  },
  {
    id: 'fno-crypto',
    name: 'Futures & Options / Cryptocurrency',
    price: '3,500',
    per: 'per year',
    tax: 'Exclusive of GST',
    badge: null,
    desc: 'All income types including F&O and Crypto',
    features: [
      'Single or multiple employers',
      'Single or multiple house properties',
      'Multiple capital gain incomes',
      'Business/Professional Income (Non-Audit) — without B/S & P&L',
      'Revenue from F&O / Crypto',
      'Other sources',
      'CA reviewed filing'
    ],
    deliverables: [
      'Income tax return acknowledgement',
      'Statement of Income',
      'Financial health report',
      'Tax planning report',
      'Losses carried forward report'
    ],
  },
  {
    id: 'nri-foreign',
    name: 'NRI / Foreign Income',
    price: '5,000',
    per: 'per year',
    tax: 'Exclusive of GST',
    badge: null,
    desc: 'NRI with Indian income or Resident with foreign income',
    features: [
      'Single or multiple employers',
      'Multiple house properties',
      'Multiple capital gain incomes',
      'Business & Professional Income (Non-Audit)',
      'Revenue from F&O / Crypto',
      'DTAA Tax Relief',
      'Foreign salary (including foreign tax relief)',
      'Other sources',
      'CA reviewed filing'
    ],
    deliverables: [
      'Income tax return acknowledgement',
      'Statement of Income',
      'Financial health report',
      'Tax planning report',
      'Losses carried forward report'
    ],
  },
]

export default function FileITRDetailsPage() {
  const [servicesOpen, setServicesOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pricing-plans')
  const [callbackModal, setCallbackModal] = useState<null | 'call' | 'consultation'>(null)
  const [modalForm, setModalForm] = useState({ name: '', email: '', phone: '', incomeType: 'salary' })
  const [modalSuccess, setModalSuccess] = useState(false)

  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const tabLineRef = useRef<HTMLSpanElement | null>(null)

  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current)
      servicesTimeoutRef.current = null
    }
    setServicesOpen(true)
  }

  const handleServicesMouseLeave = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current)
    }
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false)
    }, 4000)
  }

  const handleServiceItemClick = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current)
      servicesTimeoutRef.current = null
    }
    setServicesOpen(false)
  }

  const sectionIds = ['pricing-plans', 'mandatory-filing', 'required-documents', 'benefits', 'why-choose-us', 'notice-triggers']

  useEffect(() => {
    const handleScroll = () => {
      const offset = 160
      let activeId = 'pricing-plans'
      sectionIds.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= offset) {
          activeId = id
        }
      })
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 30) {
        activeId = sectionIds[sectionIds.length - 1]
      }
      setActiveTab(activeId)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (tabsRef.current && tabLineRef.current) {
      const activeElement = tabsRef.current.querySelector<HTMLAnchorElement>(`a[href="#${activeTab}"]`)
      if (activeElement) {
        tabLineRef.current.style.left = `${activeElement.offsetLeft}px`
        tabLineRef.current.style.width = `${activeElement.offsetWidth}px`

        const tabs = tabsRef.current
        if (
          activeElement.offsetLeft < tabs.scrollLeft ||
          activeElement.offsetLeft + activeElement.offsetWidth > tabs.scrollLeft + tabs.clientWidth
        ) {
          tabs.scrollTo({ left: activeElement.offsetLeft - 30, behavior: 'smooth' })
        }
      }
    }
  }, [activeTab])

  const scrollToTab = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setActiveTab(id)
    const el = document.getElementById(id)
    if (el) {
      const yOffset = -140
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalSuccess(true)
    setTimeout(() => {
      setModalSuccess(false)
      setCallbackModal(null)
      setModalForm({ name: '', email: '', phone: '', incomeType: 'salary' })
    }, 2200)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1E293B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ── TOP NOTIFICATION TICKER ── */}
      <div style={{ background: '#EFF6FF', borderBottom: '1px solid #DBEAFE', padding: '6px 16px', fontSize: '0.78rem', color: '#1A56DB', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ background: '#10B981', color: '#064E3B', padding: '2px 8px', borderRadius: 12, fontWeight: 900, fontSize: '0.68rem', textTransform: 'uppercase' }}>LIVE</span>
        <span>ITR Filing &amp; Tax Planning Portal AY 2025-26 is Active — Protect Against AIS/SFT Scrutiny Notices</span>
      </div>

      {/* ── TOP NAV BAR ── */}
      <nav style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0', padding: '0 3%', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LogoMark href="/" size="md" />

          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Home</Link>
            <div style={{ position: 'relative', paddingTop: 4, paddingBottom: 4 }} onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
              <Link href="/services" style={{ color: '#1A56DB', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                Services <i className="fas fa-chevron-down" style={{ fontSize: '0.65rem', transition: 'transform 0.2s', transform: servicesOpen ? 'rotate(180deg)' : 'none' }} />
              </Link>
              {servicesOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: 10, minWidth: 280, boxShadow: '0 16px 40px rgba(0,0,0,0.12)', zIndex: 2000 }} onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
                  <Link href="/services/file-itr" onClick={handleServiceItemClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, textDecoration: 'none', color: '#0F172A', background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                    <i className="fas fa-file-invoice-dollar" style={{ color: '#1A56DB', fontSize: '1.2rem' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>File ITR Guide &amp; Mandates</div>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Rules, Docs &amp; Notice Triggers</div>
                    </div>
                  </Link>
                  <Link href="/services/company-registration" onClick={handleServiceItemClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, textDecoration: 'none', color: '#374151' }}>
                    <i className="fas fa-building" style={{ color: '#1A56DB', fontSize: '1.2rem' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Company Registration</div>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Pvt Ltd, LLP &amp; OPC Compliance</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            <button onClick={() => setCallbackModal('consultation')} style={{ background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', padding: '9px 20px', borderRadius: 10, border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,86,219,0.3)', transition: 'all 0.2s' }}>
              Consult Senior CA
            </button>
          </div>
        </div>
      </nav>

      {/* -- HERO BANNER -- */}
      <section style={{ position: 'relative', overflow: 'hidden', width: '100%', minHeight: 560, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #F0F4FF 100%)', padding: '72px 3% 64px', borderBottom: '1px solid #DBEAFE' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, zIndex: 0, pointerEvents: 'none' }}>
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,86,219,0.08) 0%, rgba(26,86,219,0.04) 100%)', zIndex: 1, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '5px 14px', borderRadius: 30, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Official Chartered Accountant Tax Compliance &amp; Planning Portal
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', lineHeight: 1.18, letterSpacing: '-0.03em' }}>
            Income Tax Return (ITR) Filing &amp; <span style={{ color: '#1A56DB' }}>Senior CA Consultation</span>
          </h1>
          <p style={{ color: '#4B5563', fontSize: '1rem', maxWidth: 680, margin: '0 0 32px 0', lineHeight: 1.7, fontWeight: 400 }}>
            Guaranteed 100% tax compliance, maximum refund reclamation, market loss carry-forward, and complete protection against automated AIS &amp; SFT tax scrutiny notices.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 28 }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #DBEAFE', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 16px rgba(26,86,219,0.08)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}><i className="fas fa-user-check" /></div>
              <div><h3 style={{ color: '#0F172A', fontSize: '0.88rem', fontWeight: 800, margin: 0 }}>CA Reviewed Income Tax Filing</h3><p style={{ color: '#6B7280', fontSize: '0.72rem', margin: '2px 0 0 0', lineHeight: 1.3 }}>100% precision &amp; legal accuracy check</p></div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #D1FAE5', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 16px rgba(5,150,105,0.08)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(135deg, #059669, #10B981)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}><i className="fas fa-chart-pie" /></div>
              <div><h3 style={{ color: '#0F172A', fontSize: '0.88rem', fontWeight: 800, margin: 0 }}>Generate Tax Planning Report</h3><p style={{ color: '#6B7280', fontSize: '0.72rem', margin: '2px 0 0 0', lineHeight: 1.3 }}>Legally structure &amp; minimize future tax</p></div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #EDE9FE', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 16px rgba(124,58,237,0.08)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}><i className="fas fa-heart-pulse" /></div>
              <div><h3 style={{ color: '#0F172A', fontSize: '0.88rem', fontWeight: 800, margin: 0 }}>Check Tax Health Report</h3><p style={{ color: '#6B7280', fontSize: '0.72rem', margin: '2px 0 0 0', lineHeight: 1.3 }}>Evaluate current investments &amp; savings</p></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setCallbackModal('consultation')} style={{ background: 'linear-gradient(135deg, #1A56DB 0%, #1643B7 100%)', color: '#FFFFFF', padding: '11px 22px', borderRadius: 8, border: 'none', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(26,86,219,0.35)', transition: 'transform 0.2s' }}>
              Request Senior CA Consultation <i className="fas fa-arrow-right" />
            </button>
            <a href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20assistance%20with%20my%20Income%20Tax%20Return%20(ITR)%20Filing." target="_blank" rel="noopener noreferrer" style={{ background: '#10B981', color: '#FFFFFF', padding: '11px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
              <i className="fab fa-whatsapp" style={{ fontSize: '1rem' }} /> WhatsApp CA Support
            </a>
          </div>
        </div>
      </section>

      {/* -- STICKY TABS NAV -- */}
      <div style={{ position: 'sticky', top: 68, zIndex: 900, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 3%' }}>
          <div ref={tabsRef} style={{ display: 'flex', gap: 28, overflowX: 'auto', position: 'relative', scrollbarWidth: 'none' }}>
            <span ref={tabLineRef} style={{ position: 'absolute', bottom: 0, height: 3, background: '#1A56DB', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '3px 3px 0 0' }} />
            <a href="#pricing-plans" onClick={(e) => scrollToTab(e, 'pricing-plans')} style={{ padding: '18px 4px', color: activeTab === 'pricing-plans' ? '#1A56DB' : '#6B7280', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-tag" /> Filing Plans &amp; Pricing</a>
            <a href="#mandatory-filing" onClick={(e) => scrollToTab(e, 'mandatory-filing')} style={{ padding: '18px 4px', color: activeTab === 'mandatory-filing' ? '#1A56DB' : '#6B7280', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-gavel" /> Statutory Mandates</a>
            <a href="#required-documents" onClick={(e) => scrollToTab(e, 'required-documents')} style={{ padding: '18px 4px', color: activeTab === 'required-documents' ? '#1A56DB' : '#6B7280', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-folder-tree" /> Document Checklist</a>
            <a href="#benefits" onClick={(e) => scrollToTab(e, 'benefits')} style={{ padding: '18px 4px', color: activeTab === 'benefits' ? '#1A56DB' : '#6B7280', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-gem" /> Key Benefits &amp; Matrix</a>
            <a href="#why-choose-us" onClick={(e) => scrollToTab(e, 'why-choose-us')} style={{ padding: '18px 4px', color: activeTab === 'why-choose-us' ? '#1A56DB' : '#6B7280', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-award" /> Why Mantra Taxbooks</a>
            <a href="#notice-triggers" onClick={(e) => scrollToTab(e, 'notice-triggers')} style={{ padding: '18px 4px', color: activeTab === 'notice-triggers' ? '#1A56DB' : '#6B7280', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-circle-info" /> AIS Notice Triggers</a>
          </div>
        </div>
      </div>

      {/* -- MAIN CONTENT CANVAS -- */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 3% 90px' }}>

        {/* SECTION 0: PRICING PLANS */}
        <section id="pricing-plans" style={{ scrollMarginTop: 150, marginBottom: 70 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 12px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 }}>TRANSPARENT PRICING TIERS</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>CA-Reviewed Filing Packages &amp; Pricing</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 28px 0', lineHeight: 1.5 }}>Select the plan that matches your income sources. All plans include 100% Chartered Accountant verification.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20, alignItems: 'stretch' }}>
            {itrPlans.map((plan) => (
              <div key={plan.id} style={{ background: '#FFFFFF', border: plan.badge ? '2px solid #1A56DB' : '1.5px solid #E2E8F0', borderRadius: 18, padding: '24px 20px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: plan.badge ? '0 12px 36px rgba(26,86,219,0.15)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
                {plan.badge && (<div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1A56DB', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 900, padding: '3px 12px', borderRadius: 20, textTransform: 'uppercase' as const, letterSpacing: 0.5, boxShadow: '0 4px 12px rgba(26,86,219,0.35)' }}>{plan.badge}</div>)}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' }}>{plan.name}</h3>
                <div style={{ paddingBottom: 12, borderBottom: '1px solid #E2E8F0', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1A56DB' }}>₹{plan.price}</span></div>
                  <div style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: 1, fontWeight: 600 }}>{plan.per}</div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 1 }}>{plan.tax}</div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#374151', margin: '0 0 14px 0', lineHeight: 1.45, minHeight: 34 }}>{plan.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map((f, i) => (<li key={i} style={{ fontSize: '0.78rem', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.35 }}><i className="fas fa-circle-check" style={{ color: '#10B981', fontSize: '0.78rem', marginTop: 2, flexShrink: 0 }} /><span>{f}</span></li>))}
                </ul>
                {plan.deliverables && (<div style={{ padding: '12px 14px', background: '#EFF6FF', borderRadius: 10, border: '1.5px solid #DBEAFE', marginBottom: 16 }}><div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#1A56DB', textTransform: 'uppercase' as const, letterSpacing: 0.6, marginBottom: 8 }}>DELIVERABLES:</div><ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>{plan.deliverables.map((d, i) => (<li key={i} style={{ fontSize: '0.73rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}><i className="fas fa-file-lines" style={{ color: '#1A56DB', fontSize: '0.7rem', flexShrink: 0 }} /><span>{d}</span></li>))}</ul></div>)}
                <Link href="/file-itr" style={{ background: plan.badge ? 'linear-gradient(135deg, #1A56DB, #1643B7)' : '#1A56DB', color: '#FFFFFF', textAlign: 'center', padding: '10px 14px', borderRadius: 8, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 800, marginTop: 'auto', display: 'block', boxShadow: '0 4px 14px rgba(26,86,219,0.25)' }}>
                  Get Started <i className="fas fa-arrow-right" style={{ marginLeft: 4 }} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 1 continues below... */}
        <section id="mandatory-filing" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '5px 16px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>
            GOVERNMENT STATUTORY MANDATE
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', letterSpacing: '-0.6px' }}>
            When Income Tax Return (ITR) Filing is Mandatory
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: '0 0 28px 0', lineHeight: 1.6 }}>
            According to the Income Tax Act, filing is compulsory under specific financial triggers regardless of tax owed.
          </p>
          
          {/* CRITICAL STATUTORY ALERT BOX (BLUE THEME) */}
          <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 16, padding: '22px 28px', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 16px rgba(26,86,219,0.08)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>
              <i className="fas fa-circle-info" />
            </div>
            <div>
              <h4 style={{ color: '#1A56DB', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Statutory Notice Rule</h4>
              <p style={{ color: '#374151', fontSize: '0.98rem', margin: '4px 0 0 0', lineHeight: 1.6, fontWeight: 500 }}>
                Income tax return filing is <strong style={{ textDecoration: 'underline', color: '#1A56DB' }}>mandatory</strong> even with <strong style={{ color: '#1A56DB' }}>Nil tax liability</strong> and <strong style={{ color: '#1A56DB' }}>zero refund</strong> if you meet any of the specified conditions below.
              </p>
            </div>
          </div>

          {/* 8 MANDATORY CONDITIONS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 22 }}>
            
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <i className="fas fa-wallet" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#1A56DB', padding: '4px 12px', borderRadius: 20 }}>&gt; ₹4 Lakhs Limit</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Total Income Exceeds Exemption Limit</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                When total income exceeds the basic exemption limit (&gt; ₹4 Lakhs under the New Tax Regime).
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <i className="fas fa-building-columns" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#1A56DB', padding: '4px 12px', borderRadius: 20 }}>Current Account</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Current Account Deposits &gt; ₹1 Crore</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Deposits over Rs. 1 crore in one or more current accounts during the financial year.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <i className="fas fa-plane-departure" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#1A56DB', padding: '4px 12px', borderRadius: 20 }}>Overseas Travel</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Foreign Travel Expenses &gt; ₹2 Lakh</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Foreign travel expenses exceeding Rs. 2 lakh for yourself or any other individual.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <i className="fas fa-bolt" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#1A56DB', padding: '4px 12px', borderRadius: 20 }}>Electricity Bill</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Electricity Bills Exceeding ₹1 Lakh</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Payment of electricity consumption bills aggregating over Rs. 1 lakh in a year.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <i className="fas fa-store" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#1A56DB', padding: '4px 12px', borderRadius: 20 }}>Business Sales</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Business Turnover Above ₹60 Lakh</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Total sales, turnover, or gross business receipts exceeding Rs. 60 lakh.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <i className="fas fa-user-doctor" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#1A56DB', padding: '4px 12px', borderRadius: 20 }}>Profession Receipts</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Professional Receipts Above ₹10 Lakh</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Gross receipts from profession (doctor, CA, consultant, engineer) exceeding Rs. 10 lakh.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <i className="fas fa-receipt" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#1A56DB', padding: '4px 12px', borderRadius: 20 }}>TDS/TCS Tax</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>TDS/TCS Aggregating ₹25,000+</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Total TDS/TCS deducted is Rs. 25,000 or more (Rs. 50,000 or more for senior citizens).
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <i className="fas fa-piggy-bank" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: '#1A56DB', padding: '4px 12px', borderRadius: 20 }}>Savings Deposit</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Savings Deposits Exceeding ₹50 Lakh</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Aggregate cash/bank deposits in one or more savings accounts exceeding Rs. 50 lakh.
              </p>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 2: DOCUMENTS REQUIRED FOR INCOME TAX RETURN FILING
           ════════════════════════════════════════════════════════════ */}
        <section id="required-documents" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.14)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#1A56DB', padding: '5px 16px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>
            DOCUMENTATION HUB
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', letterSpacing: '-0.6px' }}>
            Documents Required for Income Tax Return Filing
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: '0 0 32px 0' }}>
            Collect the relevant documents corresponding to your income sources for swift, error-free preparation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(370px, 1fr))', gap: 26 }}>
            
            {/* SALARY */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                  <i className="fas fa-briefcase" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Salary Income</h3>
                  <span style={{ fontSize: '0.75rem', color: '#1A56DB', fontWeight: 700 }}>For Employed Individuals</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#F8FAFC', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <i className="fas fa-file-invoice" style={{ color: '#1A56DB', marginTop: 4, fontSize: '1rem' }} />
                  <div>
                    <strong style={{ color: '#FFF', fontSize: '0.95rem', display: 'block' }}>Form 16</strong>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Part A (TDS details) &amp; Part B (Salary computation)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#F8FAFC', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <i className="fas fa-file-lines" style={{ color: '#1A56DB', marginTop: 4, fontSize: '1rem' }} />
                  <div>
                    <strong style={{ color: '#FFF', fontSize: '0.95rem', display: 'block' }}>Monthly Pay Slips</strong>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>For calculating allowance exemptions &amp; HRA claim</span>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <i className="fas fa-shield-halved" style={{ color: '#1A56DB', fontSize: '1rem' }} />
                    <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>Section 80 Deductions Certificates</strong>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <li style={{ fontSize: '0.83rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}><i className="fas fa-check-circle" style={{ color: '#10B981', fontSize: '0.8rem' }} /> School fee receipts (Tuition fee)</li>
                    <li style={{ fontSize: '0.83rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}><i className="fas fa-check-circle" style={{ color: '#10B981', fontSize: '0.8rem' }} /> Life insurance premium certificate</li>
                    <li style={{ fontSize: '0.83rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}><i className="fas fa-check-circle" style={{ color: '#10B981', fontSize: '0.8rem' }} /> Health Insurance premium certificate (80D)</li>
                    <li style={{ fontSize: '0.83rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}><i className="fas fa-check-circle" style={{ color: '#10B981', fontSize: '0.8rem' }} /> NPS contribution certificate (80CCD)</li>
                    <li style={{ fontSize: '0.83rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}><i className="fas fa-check-circle" style={{ color: '#10B981', fontSize: '0.8rem' }} /> ELSS Investment statement</li>
                    <li style={{ fontSize: '0.83rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}><i className="fas fa-check-circle" style={{ color: '#10B981', fontSize: '0.8rem' }} /> Certificate of Fixed Deposit for 5 years</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HOUSE PROPERTY */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #059669, #047857)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                  <i className="fas fa-house-chimney" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>House Property</h3>
                  <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>Rental &amp; Home Loan Deductions</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { title: 'House property complete address', icon: 'fa-location-dot' },
                  { title: 'Monthly Rentals received statement', icon: 'fa-money-bill-wave' },
                  { title: 'Owner of the house property details', icon: 'fa-user-gear' },
                  { title: 'Housing Loan statements', icon: 'fa-building-columns' },
                  { title: 'Home Loan Interest Certificate (Sec 24)', icon: 'fa-certificate' },
                  { title: 'Loan sanction letter from bank', icon: 'fa-file-signature' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8FAFC', padding: '13px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <i className={`fas ${item.icon}`} style={{ color: '#34D399', fontSize: '0.95rem', width: 20 }} />
                    <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CAPITAL GAINS */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>
                  <i className="fas fa-chart-line" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Capital Gains</h3>
                  <span style={{ fontSize: '0.75rem', color: '#C084FC', fontWeight: 700 }}>Stocks, Real Estate &amp; Gold</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#A78BFA', fontSize: '0.92rem', display: 'block', marginBottom: 4 }}>Shares, Mutual Funds &amp; Crypto P&amp;L</strong>
                  <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                    Capital gain and P&amp;L statement form broker like <strong style={{ color: '#FFF' }}>Groww, Upstox, Zerodha</strong>, etc.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#A78BFA', fontSize: '0.92rem', display: 'block', marginBottom: 4 }}>Immovable Property (Land / Building)</strong>
                  <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                    Property ----- Sale deed &amp; purchase deed with registry value.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#A78BFA', fontSize: '0.92rem', display: 'block', marginBottom: 4 }}>Precious Metals</strong>
                  <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                    Gold, Silver ---- Sale &amp; Purchase documents.
                  </p>
                </div>
              </div>
            </div>

            {/* F&O & CRYPTO */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #D97706, #B45309)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
                  <i className="fas fa-coins" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>F &amp; O , Crypto</h3>
                  <span style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: 700 }}>Derivatives &amp; Virtual Digital Assets</span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <i className="fas fa-arrow-trend-up" style={{ color: '#FBBF24', fontSize: '1.4rem', marginBottom: 10, display: 'block' }} />
                <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 8 }}>F&amp;O, Crypto Tax &amp; P&amp;L Statements</strong>
                <p style={{ color: '#6B7280', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                  Detailed turnover calculations &amp; profit/loss statements from stock brokers &amp; cryptocurrency exchanges.
                </p>
              </div>
            </div>

            {/* BUSINESS & PROFESSION */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                  <i className="fas fa-store" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Business &amp; Profession Income</h3>
                  <span style={{ fontSize: '0.75rem', color: '#1A56DB', fontWeight: 700 }}>Non-Audit / Presumptive Income</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <i className="fas fa-circle-check" style={{ color: '#10B981', fontSize: '1rem' }} />
                  <div>
                    <strong style={{ color: '#FFF', fontSize: '0.9rem', display: 'block' }}>If GST Registered</strong>
                    <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>Turnover from GST returns</span>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <i className="fas fa-circle-check" style={{ color: '#10B981', fontSize: '1rem' }} />
                  <div>
                    <strong style={{ color: '#FFF', fontSize: '0.9rem', display: 'block' }}>If NOT GST Registered</strong>
                    <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>Self-declared Turnover</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOREIGN ASSETS */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #0284C7, #0369A1)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}>
                  <i className="fas fa-globe" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Foreign Assets</h3>
                  <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700 }}>Global Income &amp; Accounts</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8FAFC', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <i className="fas fa-passport" style={{ color: '#38BDF8', fontSize: '0.95rem' }} />
                  <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>1042S form / W-2</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8FAFC', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <i className="fas fa-file-contract" style={{ color: '#38BDF8', fontSize: '0.95rem' }} />
                  <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Broker Account statement</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8FAFC', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <i className="fas fa-sack-dollar" style={{ color: '#38BDF8', fontSize: '0.95rem' }} />
                  <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Dividend statement</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 3: BENEFITS OF FILING INCOME TAX RETURN (ITR)
           ════════════════════════════════════════════════════════════ */}
        <section id="benefits" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.14)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34D399', padding: '5px 16px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>
            FINANCIAL ADVANTAGES
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', letterSpacing: '-0.6px' }}>
            Benefits of Filing Income Tax Return (ITR)
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: '0 0 32px 0' }}>
            Discover how filing your ITR strengthens your creditworthiness, safeguards your assets, and unlocks tax refunds.
          </p>

          {/* STUNNING TABLE / MATRIX LAYOUT */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.4)', marginBottom: 60 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 680 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #070B14, #0F172A)', borderBottom: '2px solid #1E293B' }}>
                    <th style={{ padding: '20px 3%', color: '#1A56DB', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, width: '34%' }}>Category / Benefit</th>
                    <th style={{ padding: '20px 3%', color: '#1A56DB', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2 }}>Key Advantage &amp; Practical Application</th>
                  </tr>
                </thead>
                <tbody>
                  
                  <tr style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '22px 28px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                          <i className="fas fa-file-contract" />
                        </div>
                        <strong style={{ color: '#0F172A', fontSize: '1rem', fontWeight: 800 }}>Income &amp; Credit Proof</strong>
                      </div>
                    </td>
                    <td style={{ padding: '22px 28px', color: '#374151', fontSize: '0.95rem', lineHeight: 1.65 }}>
                      Primary credential required for home, auto, and personal loan approvals as well as high-limit credit cards.
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <td style={{ padding: '22px 28px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(14, 165, 233, 0.15)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                          <i className="fas fa-plane" />
                        </div>
                        <strong style={{ color: '#0F172A', fontSize: '1rem', fontWeight: 800 }}>Visa Processing</strong>
                      </div>
                    </td>
                    <td style={{ padding: '22px 28px', color: '#374151', fontSize: '0.95rem', lineHeight: 1.65 }}>
                      Mandatory requirement by foreign embassies (US, UK, Canada, Schengen) as proof of financial standing in India.
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '22px 28px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                          <i className="fas fa-hand-holding-dollar" />
                        </div>
                        <strong style={{ color: '#0F172A', fontSize: '1rem', fontWeight: 800 }}>TDS Tax Refunds</strong>
                      </div>
                    </td>
                    <td style={{ padding: '22px 28px', color: '#374151', fontSize: '0.95rem', lineHeight: 1.65 }}>
                      The only legal mechanism to reclaim excess tax deducted at source (TDS) on salary, FD interest, or contracts.
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <td style={{ padding: '22px 28px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                          <i className="fas fa-chart-line-down" />
                        </div>
                        <strong style={{ color: '#0F172A', fontSize: '1rem', fontWeight: 800 }}>Carry Forward Losses</strong>
                      </div>
                    </td>
                    <td style={{ padding: '22px 28px', color: '#374151', fontSize: '0.95rem', lineHeight: 1.65 }}>
                      Enables carry-forward of stock market, business, and capital losses to offset future profits for up to 8 years.
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '22px 28px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                          <i className="fas fa-shield-heart" />
                        </div>
                        <strong style={{ color: '#0F172A', fontSize: '1rem', fontWeight: 800 }}>High Term Insurance</strong>
                      </div>
                    </td>
                    <td style={{ padding: '22px 28px', color: '#374151', fontSize: '0.95rem', lineHeight: 1.65 }}>
                      Required by insurance companies to verify financial capacity for high sum assured policies (₹1 Crore+).
                    </td>
                  </tr>

                  <tr style={{ background: '#F8FAFC' }}>
                    <td style={{ padding: '22px 28px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                          <i className="fas fa-scale-balanced" />
                        </div>
                        <strong style={{ color: '#0F172A', fontSize: '1rem', fontWeight: 800 }}>Legal Compliance</strong>
                      </div>
                    </td>
                    <td style={{ padding: '22px 28px', color: '#374151', fontSize: '0.95rem', lineHeight: 1.65 }}>
                      Protects against late fees (up to ₹5,000 under Sec 234F), penal interest, and income tax scrutiny notices.
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 4: WHY CHOOSE MANTRA TAX BOOKS?
           ════════════════════════════════════════════════════════════ */}
        <section id="why-choose-us" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: 'rgba(139, 92, 246, 0.14)', border: '1px solid rgba(139, 92, 246, 0.35)', color: '#A78BFA', padding: '5px 16px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>
            EXPERT CA EXCELLENCE
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', letterSpacing: '-0.6px' }}>
            Why Choose Mantra Tax Books?
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: '0 0 32px 0' }}>
            Our dedicated team of Chartered Accountants guarantees precision, maximum tax savings, and notice protection.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 26 }}>
            
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, position: 'relative' }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 22, boxShadow: '0 6px 18px rgba(37,99,235,0.35)' }}>
                <i className="fas fa-user-shield" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' }}>CA-Reviewed Accuracy</h3>
              <p style={{ fontSize: '0.92rem', color: '#6B7280', margin: 0, lineHeight: 1.65 }}>
                Every return is thoroughly vetted by a Chartered Accountant to ensure 100% precision and compliance.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, position: 'relative' }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: 'linear-gradient(135deg, #059669, #10B981)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 22, boxShadow: '0 6px 18px rgba(16,185,129,0.35)' }}>
                <i className="fas fa-headset" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' }}>Dedicated Expert Support</h3>
              <p style={{ fontSize: '0.92rem', color: '#6B7280', margin: 0, lineHeight: 1.65 }}>
                Get 1-on-1 guidance from a dedicated tax specialist throughout your entire filing journey.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, position: 'relative' }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 22, boxShadow: '0 6px 18px rgba(139,92,246,0.35)' }}>
                <i className="fas fa-notes-medical" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' }}>Tax Health Report</h3>
              <p style={{ fontSize: '0.92rem', color: '#6B7280', margin: 0, lineHeight: 1.65 }}>
                Receive a personalized evaluation of your current investments and discover untapped tax saving opportunities.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, position: 'relative' }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 22, boxShadow: '0 6px 18px rgba(245,158,11,0.35)' }}>
                <i className="fas fa-lightbulb" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' }}>Proactive Tax Planning</h3>
              <p style={{ fontSize: '0.92rem', color: '#6B7280', margin: 0, lineHeight: 1.65 }}>
                Get a customized tax structure designed to legally minimize your tax liability for the upcoming year.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, position: 'relative', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, boxShadow: '0 6px 20px rgba(59,130,246,0.35)' }}>
                  <i className="fas fa-gavel" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>Full Notice Handling</h3>
                  <p style={{ fontSize: '0.95rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>
                    Filing is just the start—if you receive a tax notice, our experts step in to handle all correspondence and resolution.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECTION 5: INCOME TAX NOTICE TRIGGERS & AIS SCRUTINY
           ════════════════════════════════════════════════════════════ */}
        <section id="notice-triggers" style={{ scrollMarginTop: 150, marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '5px 16px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>
            AUTOMATED SCRUTINY &amp; COMPLIANCE
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', letterSpacing: '-0.6px' }}>
            Income Tax Notice Triggers When You Don't File Income Tax Return
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: '0 0 30px 0' }}>
            High-value financial transactions are automatically cross-checked by IT Department software against non-filers.
          </p>

          {/* QUICK TRIGGER SUMMARY STRIP (BLUE THEME) */}
          <div style={{ background: 'linear-gradient(135deg, #0F172A, #070B14)', border: '1px solid #E2E8F0', borderRadius: 18, padding: '24px 3%', marginBottom: 44, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
            <h4 style={{ color: '#1A56DB', fontSize: '0.88rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 16px 0' }}>
              <i className="fas fa-bolt" /> Direct Trigger Events for Non-Filers:
            </h4>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                'Salary is more than 4 lakhs , which is more than basic exemption limit',
                'sale of shares , mutual funds etfs',
                'sale of land or building',
                'trading in crypto',
                'trading in Futures & options'
              ].map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(30, 58, 138, 0.35)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#1A56DB', padding: '10px 16px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fas fa-circle-info" style={{ color: '#1A56DB', fontSize: '0.85rem' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: 26 }}>
            Top Income Tax Notice Triggers for Non-Filers
          </h3>

          {/* 3 DEEP DIVE CATEGORIES FROM PDF PAGES 4 & 5 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, marginBottom: 52 }}>
            
            {/* 1. INCOME & CAPITAL GAINS */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                  <i className="fas fa-sack-dollar" />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>1. Income &amp; Capital Gains Triggers</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                <div style={{ borderLeft: '3.5px solid #3B82F6', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Salary Income Exceeding Basic Exemption Limit
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Earning over <strong style={{ color: '#FFF' }}>₹2.50 Lakh</strong> (Old Regime - under 60 yrs), <strong style={{ color: '#FFF' }}>₹3.00 Lakh</strong> (Old Regime - Senior Citizens), or <strong style={{ color: '#FFF' }}>₹3.00 Lakh / ₹4.00 Lakh</strong> (New Regime threshold / basic exemption limit) makes ITR filing mandatory.
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #3B82F6', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Sale of Shares, Mutual Funds &amp; ETFs
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Every sell trade generates a capital gains transaction report filed directly with the Income Tax Department by AMCs and Depositories (CDSL/NSDL).
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #3B82F6', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Sale of Immovable Property (Land/Building)
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Property transactions of <strong style={{ color: '#FFF' }}>₹30 Lakh or more</strong> (SFT reporting limit by Registrar) or <strong style={{ color: '#FFF' }}>₹50 Lakh or more</strong> (where 1% TDS applies under Section 194-IA) are reported directly to the tax portal.
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #3B82F6', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Crypto &amp; Virtual Digital Assets (VDAs)
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    1% TDS under Section 194S (threshold ₹10,000 / ₹50,000) tracks every buy/sell trade across crypto exchanges, automatically flagging unreported gains.
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #3B82F6', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Futures &amp; Options (F&amp;O) &amp; Intraday Trading
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Stock exchanges report total F&amp;O trading turnover and intraday volumes directly to the tax department, regardless of whether you made a profit or loss.
                  </p>
                </div>

              </div>
            </div>

            {/* 2. BANKING & CASH TRANSACTIONS */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #059669, #10B981)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                  <i className="fas fa-landmark" />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>2. Banking &amp; Cash Transaction Triggers (SFT)</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                <div style={{ borderLeft: '3.5px solid #10B981', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Current Account Cash Activity
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Aggregating cash deposits or withdrawals of <strong style={{ color: '#FFF' }}>₹50 Lakh or more</strong> in a financial year.
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #10B981', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Savings &amp; Fixed Deposits
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Cash deposits of <strong style={{ color: '#FFF' }}>₹10 Lakh or more</strong> in savings accounts, or fresh term deposits (FDs/RDs) of <strong style={{ color: '#FFF' }}>₹10 Lakh or more</strong> across banks or post offices.
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #10B981', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    High Credit Card Spends
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Bill payments exceeding <strong style={{ color: '#FFF' }}>₹10 Lakh</strong> via online/bank transfer or <strong style={{ color: '#FFF' }}>₹1 Lakh</strong> in cash in a financial year.
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #10B981', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    High-Value Bank Drafts
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Purchasing bank drafts, pay orders, or prepaid instruments using cash exceeding <strong style={{ color: '#FFF' }}>₹10 Lakh</strong> in a financial year.
                  </p>
                </div>

              </div>
            </div>

            {/* 3. INVESTMENT & EXPENSE TRIGGERS */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
                  <i className="fas fa-credit-card" />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>3. Investment &amp; Expense Triggers (SFT &amp; AIS)</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                <div style={{ borderLeft: '3.5px solid #F59E0B', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    High-Value Investments
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Investing <strong style={{ color: '#FFF' }}>₹10 Lakh or more</strong> in shares, mutual funds, debentures, or bonds in a single financial year.
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #F59E0B', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Foreign Travel Expenditure
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Spending more than <strong style={{ color: '#FFF' }}>₹2 Lakh</strong> on overseas travel for yourself or anyone else (under the 7th proviso to Sec 139(1)).
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #F59E0B', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    Electricity Bills
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Paying electricity charges exceeding <strong style={{ color: '#FFF' }}>₹1 Lakh</strong> in a financial year (under the 7th proviso to Sec 139(1)).
                  </p>
                </div>

                <div style={{ borderLeft: '3.5px solid #F59E0B', paddingLeft: 18 }}>
                  <strong style={{ color: '#FFF', fontSize: '1rem', display: 'block', marginBottom: 6 }}>
                    TDS/TCS Deducted
                  </strong>
                  <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 }}>
                    Having <strong style={{ color: '#FFF' }}>₹25,000 or more</strong> in TDS/TCS deducted (or <strong style={{ color: '#FFF' }}>₹50,000 or more</strong> for senior citizens) reflects active financial transactions that expect a corresponding ITR.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* CRITICAL TAKEAWAY WARNING BOX (BLUE THEME) */}
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.5) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '2px solid #3B82F6', borderRadius: 20, padding: '32px 3%', boxShadow: '0 16px 40px rgba(37, 99, 235, 0.25)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0, boxShadow: '0 6px 18px rgba(37,99,235,0.45)' }}>
                <i className="fas fa-circle-info" />
              </div>
              <div>
                <h4 style={{ color: '#1A56DB', fontSize: '1.25rem', fontWeight: 900, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Key Takeaway: Automated AIS Non-Compliance Warning
                </h4>
                <p style={{ color: '#E0F2FE', fontSize: '1.02rem', margin: 0, lineHeight: 1.75, fontWeight: 500 }}>
                  The Income Tax Department matches data from <strong style={{ color: '#FFF', textDecoration: 'underline' }}>AIS (Annual Information Statement)</strong>, banks, brokers, and registrars using your PAN. If your AIS shows any of the above transactions and no ITR is filed, an automated non-compliance notice under <strong style={{ color: '#FFF', background: 'rgba(0,0,0,0.35)', padding: '3px 10px', borderRadius: 6 }}>Section 142(1)</strong> or <strong style={{ color: '#FFF', background: 'rgba(0,0,0,0.35)', padding: '3px 10px', borderRadius: 6 }}>Section 148</strong> is generated.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA CARD ── */}
        <section style={{ background: 'linear-gradient(135deg, #1E293B 0%, #070B14 100%)', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: 24, padding: '50px 40px', textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 350, height: 350, background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
          
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0' }}>
            Safeguard Against Tax Notices &amp; Maximize Your Tax Refunds Today
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', maxWidth: 680, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Let our senior Chartered Accountants review your AIS, draft error-free returns, and optimize your overall tax strategy.
          </p>

          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCallbackModal('consultation')}
              style={{
                background: 'linear-gradient(135deg, #1A56DB, #1643B7)',
                color: '#0F172A',
                padding: '16px 3%',
                borderRadius: 12,
                border: 'none',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
              }}
            >
              Consult Senior CA Now →
            </button>

            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20assistance%20with%20my%20Income%20Tax%20Return%20(ITR)%20Filing."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                padding: '16px 30px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <i className="fab fa-whatsapp" style={{ color: '#10B981', fontSize: '1.25rem' }} /> Direct WhatsApp Chat
            </a>
          </div>
        </section>

      </div>

      {/* -- CONSULTATION MODAL -- */}
      {callbackModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 36, maxWidth: 500, width: '100%', position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.85)' }}>
            <button onClick={() => setCallbackModal(null)} style={{ position: 'absolute', top: 22, right: 22, background: 'none', border: 'none', color: '#6B7280', fontSize: '1.4rem', cursor: 'pointer' }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
              Request Senior CA Consultation
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', marginBottom: 26 }}>
              Provide your details below and our tax expert will connect with you directly.
            </p>

            {modalSuccess ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#34D399', padding: 24, borderRadius: 14, textAlign: 'center' }}>
                <i className="fas fa-circle-check" style={{ fontSize: '2.4rem', marginBottom: 10, display: 'block' }} />
                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: 6 }}>Request Received Successfully!</strong>
                <span style={{ fontSize: '0.88rem', color: '#A7F3D0' }}>Our Senior Chartered Accountant will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    style={{ width: '100%', padding: '13px 16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
                    placeholder="Enter your full name"
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    style={{ width: '100%', padding: '13px 16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
                    placeholder="you@domain.com"
                    value={modalForm.email}
                    onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    style={{ width: '100%', padding: '13px 16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
                    placeholder="+91 98765 43210"
                    value={modalForm.phone}
                    onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>Primary Income Type</label>
                  <select
                    style={{ width: '100%', padding: '13px 16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
                    value={modalForm.incomeType}
                    onChange={(e) => setModalForm({ ...modalForm, incomeType: e.target.value })}
                  >
                    <option value="salary">Salaried Individual</option>
                    <option value="house">House Property Owner</option>
                    <option value="capital-gains">Capital Gains (Stocks, MFs, Real Estate)</option>
                    <option value="fno-crypto">F&amp;O / Crypto Trader</option>
                    <option value="business">Business / Professional Income</option>
                    <option value="foreign">NRI / Foreign Income</option>
                  </select>
                </div>

                <button type="submit" style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: '0.98rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.45)' }}>
                  Submit &amp; Speak to Senior CA
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
