'use client'

import React, { useState, useEffect, useRef } from 'react'
import { LogoMark } from '@/components/LogoMark'
import Link from 'next/link'

export default function PublicCompanyRegistrationPage() {
  const [servicesOpen, setServicesOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [inquiryModal, setInquiryModal] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({ companyName: '', phone: '', email: '' })
  const [submitted, setSubmitted] = useState(false)

  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const tabLineRef = useRef<HTMLSpanElement | null>(null)

  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) { clearTimeout(servicesTimeoutRef.current); servicesTimeoutRef.current = null }
    setServicesOpen(true)
  }
  const handleServicesMouseLeave = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current)
    servicesTimeoutRef.current = setTimeout(() => setServicesOpen(false), 300)
  }
  const handleServiceItemClick = () => {
    if (servicesTimeoutRef.current) { clearTimeout(servicesTimeoutRef.current); servicesTimeoutRef.current = null }
    setServicesOpen(false)
  }

  const sectionIds = ['overview', 'benefits', 'documents', 'requirements', 'process', 'compliance', 'comparison']

  useEffect(() => {
    const handleScroll = () => {
      const offset = 150
      let activeId = 'overview'
      sectionIds.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= offset) activeId = id
      })
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 25)
        activeId = sectionIds[sectionIds.length - 1]
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
        if (activeElement.offsetLeft < tabs.scrollLeft || activeElement.offsetLeft + activeElement.offsetWidth > tabs.scrollLeft + tabs.clientWidth)
          tabs.scrollTo({ left: activeElement.offsetLeft - 40, behavior: 'smooth' })
      }
    }
  }, [activeTab])

  const scrollToTab = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setActiveTab(id)
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' })
  }

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setInquiryModal(false); setInquiryForm({ companyName: '', phone: '', email: '' }) }, 2200)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>

      {/* -- NOTIFICATION TICKER -- */}
      <div style={{ background: '#EFF6FF', borderBottom: '1px solid #DBEAFE', padding: '6px 3%', fontSize: '0.78rem', color: '#1A56DB', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ background: '#10B981', color: '#064E3B', padding: '2px 8px', borderRadius: 12, fontWeight: 900, fontSize: '0.68rem', textTransform: 'uppercase' }}>MCA LIVE</span>
        <span>Companies Act, 2013 Official Incorporation Portal — SPICe+ &amp; AGILE-PRO-S Support</span>
      </div>

      {/* -- TOP NAV BAR -- */}
      <nav style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0', padding: '0 3%', position: 'sticky', top: 0, zIndex: 1000, height: 62, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LogoMark href="/" size="md" />
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Home</Link>
            <div style={{ position: 'relative', paddingTop: 4, paddingBottom: 4 }} onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
              <Link href="/services" style={{ color: '#1A56DB', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                Services <i className="fas fa-chevron-down" style={{ fontSize: '0.65rem', transition: 'transform 0.2s', transform: servicesOpen ? 'rotate(180deg)' : 'none' }} />
              </Link>
              {servicesOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: 10, minWidth: 280, boxShadow: '0 16px 40px rgba(0,0,0,0.12)', zIndex: 2000 }} onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
                  <Link href="/services/file-itr" onClick={handleServiceItemClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, textDecoration: 'none', color: '#374151' }}>
                    <i className="fas fa-file-invoice-dollar" style={{ color: '#1A56DB', fontSize: '1.2rem' }} />
                    <div><div style={{ fontWeight: 800, fontSize: '0.9rem' }}>File ITR</div><div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Rules, Docs &amp; Notice Triggers</div></div>
                  </Link>
                  <Link href="/services/company-registration" onClick={handleServiceItemClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, textDecoration: 'none', color: '#0F172A', background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                    <i className="fas fa-building" style={{ color: '#1A56DB', fontSize: '1.2rem' }} />
                    <div><div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Company Registration</div><div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Pvt Ltd, LLP &amp; OPC Compliance</div></div>
                  </Link>
                </div>
              )}
            </div>
            <button onClick={() => setInquiryModal(true)} style={{ background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', padding: '9px 20px', borderRadius: 10, border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,86,219,0.3)' }}>
              Inquire Now
            </button>
          </div>
        </div>
      </nav>

      {/* -- HERO SECTION -- */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #F0F4FF 100%)', padding: '72px 3% 64px', borderBottom: '1px solid #DBEAFE' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '5px 16px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Companies Act, 2013 · MCA Registered Process
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 20px 0', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
            Private Limited <span style={{ color: '#1A56DB' }}>Company Registration</span>
          </h1>
          <p style={{ color: '#4B5563', fontSize: '1.1rem', maxWidth: 760, margin: '0 auto 36px auto', lineHeight: 1.7 }}>
            Register your company in just 10 days with complete expert CA assistance — from name approval to incorporation certificate, PAN, TAN, MOA, AOA, and beyond.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            <button onClick={() => setInquiryModal(true)} style={{ background: 'linear-gradient(135deg, #1A56DB 0%, #1643B7 100%)', color: '#FFFFFF', padding: '13px 28px', borderRadius: 10, border: 'none', fontWeight: 800, fontSize: '0.975rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,86,219,0.35)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Start Registration <i className="fas fa-arrow-right" />
            </button>
            <a href="#pricing" onClick={(e) => scrollToTab(e, 'pricing')} style={{ background: '#FFFFFF', border: '1.5px solid #DBEAFE', color: '#1A56DB', padding: '13px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.975rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              View Package Details
            </a>
          </div>
          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.9rem', color: '#1A56DB', fontWeight: 700 }}>
            <div><i className="fas fa-circle-check" style={{ color: '#10B981', marginRight: 6 }} />Registration in 10 Days</div>
            <div><i className="fas fa-circle-check" style={{ color: '#10B981', marginRight: 6 }} />Expert CA Assistance</div>
            <div><i className="fas fa-circle-check" style={{ color: '#10B981', marginRight: 6 }} />End-to-End Filings</div>
          </div>
        </div>
      </section>

      {/* -- PRICING SECTION -- */}
      <section id="pricing" style={{ padding: '60px 3%', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 14px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>INCORPORATION PACKAGE</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>Pvt Ltd Starter — All-Inclusive</h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>Complete MCA company incorporation in 10 days. Transparent pricing — no hidden charges.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: '#1A56DB', lineHeight: 1 }}>₹10,000+</span>
              <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 600 }}>+ Govt Fees</span>
            </div>
          </div>

          {/* Features grid — full width, no box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px 32px', marginBottom: 44 }}>
            {[
              'Company Name Approval (RUN/SPICe+ Part A)',
              'DSC for 2 Directors',
              'MOA & AOA Drafting',
              'Incorporation Certificate',
              'PAN + TAN Allotment',
              'DIN for 2 Directors',
              'ESI Registration',
              'PF Registration',
              'ADT-1 (Auditor appointment)',
              'INC-20A (Business commencement)',
              'Dedicated CA Assistance',
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                <i className="fas fa-circle-check" style={{ color: '#10B981', fontSize: '1rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setInquiryModal(true)} style={{ background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFFFFF', padding: '13px 32px', borderRadius: 10, border: 'none', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(26,86,219,0.35)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Get Started Now <i className="fas fa-arrow-right" />
            </button>
            <a href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20register%20a%20Pvt%20Ltd%20company." target="_blank" rel="noopener noreferrer" style={{ background: '#F0FDF4', border: '1.5px solid #D1FAE5', color: '#059669', padding: '13px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className="fab fa-whatsapp" style={{ fontSize: '1.1rem' }} /> WhatsApp CA for Query
            </a>
            <span style={{ color: '#9CA3AF', fontSize: '0.82rem', marginLeft: 4 }}>Govt fees (₹7,000–15,000) charged separately as applicable</span>
          </div>

        </div>
      </section>

      {/* -- STICKY TABS -- */}
      <div style={{ position: 'sticky', top: 62, zIndex: 900, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 3%' }}>
          <div ref={tabsRef} style={{ display: 'flex', gap: 28, overflowX: 'auto', position: 'relative', scrollbarWidth: 'none' }}>
            <span ref={tabLineRef} style={{ position: 'absolute', bottom: 0, height: 3, background: '#1A56DB', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '3px 3px 0 0' }} />
            {[
              { id: 'overview', label: 'Overview', icon: 'fa-eye' },
              { id: 'benefits', label: 'Benefits', icon: 'fa-gem' },
              { id: 'documents', label: 'Documents', icon: 'fa-folder-tree' },
              { id: 'requirements', label: 'Requirements', icon: 'fa-list-check' },
              { id: 'process', label: 'Process', icon: 'fa-diagram-project' },
              { id: 'compliance', label: 'Compliances', icon: 'fa-scale-balanced' },
              { id: 'comparison', label: 'Company vs LLP', icon: 'fa-code-compare' },
            ].map((tab) => (
              <a key={tab.id} href={`#${tab.id}`} onClick={(e) => scrollToTab(e, tab.id)} style={{ padding: '18px 4px', color: activeTab === tab.id ? '#1A56DB' : '#6B7280', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, borderBottom: activeTab === tab.id ? '3px solid transparent' : 'none' }}>
                <i className={`fas ${tab.icon}`} /> {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* -- MAIN CONTENT CANVAS -- */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 3% 90px' }}>

        {/* OVERVIEW */}
        <section id="overview" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 14px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>WHAT IS A PRIVATE LIMITED COMPANY</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', letterSpacing: '-0.03em' }}>What is a Private Limited Company (Pvt Ltd)?</h2>
          <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 16, padding: '26px 32px', fontSize: '1.02rem', lineHeight: 1.75, color: '#1E3A5F' }}>
            A private limited company (Pvt Ltd) is a separate legal entity registered under the <strong style={{ color: '#1A56DB' }}>Companies Act, 2013</strong>, offering limited liability protection to its members. It restricts share transfers, keeping ownership within a trusted group while providing the credibility and structure of a registered corporate entity.
          </div>
        </section>

        {/* BENEFITS */}
        <section id="benefits" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 14px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>KEY ADVANTAGES</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>Benefits of Company Registration</h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', margin: '0 0 32px 0' }}>Why thousands of founders choose the Private Limited structure.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
            {[
              { num: '1', title: 'Limited Liability Protection', desc: 'Shareholders need not repay debts from personal assets — unlike partnership and proprietorship where personal assets are at risk.' },
              { num: '2', title: 'Perpetual Succession', desc: 'A company has continuous existence independent of its founders. Transfer of shareholding ensures seamless business continuity.' },
              { num: '3', title: 'Access to Capital & VC Funding', desc: 'Institutional investors almost always require a corporate structure. Issue new shares or share classes to raise angel/VC capital.' },
              { num: '4', title: 'Strategic Tax Planning', desc: 'Concessional tax rates (15% for new manufacturing, 22% for existing companies) offer better tax efficiency than individual brackets.' },
              { num: '5', title: 'Seamless Transfer of Ownership', desc: 'Ownership is divided into shares. Transferring control is simply executing a share transfer deed without retitling assets.' },
              { num: '6', title: 'Startup India & Govt Support', desc: 'Eligible for tax exemptions, funding support, faster patent examination, and Make in India subsidies.' },
            ].map((card) => (
              <div key={card.num} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: 26, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1A56DB', borderRadius: '4px 0 0 4px' }} />
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', marginBottom: 14, border: '1.5px solid #BFDBFE' }}>{card.num}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>{card.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, lineHeight: 1.65 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DOCUMENTS */}
        <section id="documents" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 14px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>DOCUMENT CHECKLIST</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>Documents Required for Company Registration</h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', margin: '0 0 32px 0' }}>Keep these ready for a smooth, delay-free incorporation.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1A56DB', marginBottom: 16, paddingBottom: 12, borderBottom: '1.5px solid #EFF6FF' }}>For Directors &amp; Shareholders</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Passport-sized photograph (recent, clear)', 'PAN Card (mandatory for Indian citizens)', 'Identity Proof: Aadhaar, Passport, Voter ID or DL', 'Residential Address Proof (< 60 days): utility bill, bank statement', 'Digital Signature Certificate (DSC)', 'Director Identification Number (DIN)'].map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.45 }}>
                    <i className="fas fa-circle-check" style={{ color: '#10B981', fontSize: '0.82rem', marginTop: 3, flexShrink: 0 }} /><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1A56DB', marginBottom: 16, paddingBottom: 12, borderBottom: '1.5px solid #EFF6FF' }}>For Registered Office Address</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Address Proof (< 60 days): electricity or water bill', 'No Objection Certificate (NOC) from property owner', 'Tenancy / Lease Agreement or property ownership deed'].map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.45 }}>
                    <i className="fas fa-circle-check" style={{ color: '#10B981', fontSize: '0.82rem', marginTop: 3, flexShrink: 0 }} /><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* REQUIREMENTS */}
        <section id="requirements" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 14px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>ELIGIBILITY</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>Requirements to Register a Pvt Ltd Company</h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', margin: '0 0 32px 0' }}>Minimum statutory criteria under the Companies Act, 2013.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: 'fa-users', title: 'Minimum 2 Directors', desc: 'At least 2 directors required (max 15). One must be an Indian resident.' },
              { icon: 'fa-user-group', title: 'Minimum 2 Shareholders', desc: 'Minimum 2 and maximum 200 shareholders. Directors and shareholders can be the same people.' },
              { icon: 'fa-indian-rupee-sign', title: 'Authorized Capital', desc: 'No minimum paid-up capital requirement. Common starting point is ₹1 lakh authorized capital.' },
              { icon: 'fa-location-dot', title: 'Registered Office', desc: 'A registered address in India is required. Can be residential or commercial.' },
              { icon: 'fa-id-card', title: 'DIN & DSC', desc: 'Director Identification Number (DIN) and Digital Signature Certificate (DSC) required for each director.' },
              { icon: 'fa-file-contract', title: 'MOA & AOA', desc: 'Memorandum and Articles of Association define the company\'s objectives and internal governance rules.' },
            ].map((req, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: 12 }}>
                  <i className={`fas ${req.icon}`} />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>{req.title}</h3>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0, lineHeight: 1.55 }}>{req.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 14px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>STEP BY STEP</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>Registration Process: 10-Day Timeline</h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', margin: '0 0 32px 0' }}>Our CA-led process ensures accurate, timely filings with no rejections.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { step: '01', day: 'Day 1–2', title: 'Document Collection & DSC', desc: 'Our CA team collects documents, verifies identity, and applies for Digital Signature Certificates (DSC) for each director.' },
              { step: '02', day: 'Day 2–3', title: 'Name Approval (SPICe+ Part A)', desc: 'We file for company name reservation with MCA. Name approval typically arrives in 1–2 working days.' },
              { step: '03', day: 'Day 3–6', title: 'MOA, AOA & SPICe+ Part B', desc: 'Drafting of Memorandum & Articles of Association, filling SPICe+ Part B integrated form for MCA incorporation.' },
              { step: '04', day: 'Day 6–8', title: 'MCA Processing & COI', desc: 'MCA processes the application. Certificate of Incorporation (COI) with CIN is issued, along with PAN and TAN.' },
              { step: '05', day: 'Day 8–10', title: 'Bank Account & Compliance Setup', desc: 'We assist with bank account opening, GST registration if needed, ADT-1 (auditor), and INC-20A (commencement).' },
            ].map((step, idx, arr) => (
              <div key={idx} style={{ display: 'flex', gap: 24, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1A56DB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', boxShadow: '0 4px 14px rgba(26,86,219,0.35)', zIndex: 1 }}>{step.step}</div>
                  {idx < arr.length - 1 && <div style={{ width: 2, flex: 1, background: '#DBEAFE', margin: '4px 0' }} />}
                </div>
                <div style={{ paddingBottom: idx < arr.length - 1 ? 32 : 0, paddingTop: 10, flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{step.day}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPLIANCE */}
        <section id="compliance" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 14px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>ANNUAL OBLIGATIONS</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>Ongoing Compliances After Incorporation</h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', margin: '0 0 32px 0' }}>Post-incorporation statutory filings our CA team handles for you.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { icon: 'fa-file-invoice', label: 'ROC Annual Return (MGT-7)', freq: 'Annual', desc: 'Filed within 60 days of AGM with details of shareholders, directors, and share capital.' },
              { icon: 'fa-file-lines', label: 'Financial Statements (AOC-4)', freq: 'Annual', desc: 'Balance Sheet, P&L, and Cash Flow Statement filed within 30 days of AGM.' },
              { icon: 'fa-gavel', label: 'Annual General Meeting (AGM)', freq: 'Annual', desc: 'First AGM within 9 months of financial year end. Subsequent AGMs within 6 months.' },
              { icon: 'fa-receipt', label: 'Income Tax Return (ITR-6)', freq: 'Annual', desc: 'Corporate tax return for companies other than those claiming exemption under Section 11.' },
              { icon: 'fa-percentage', label: 'TDS Returns (24Q/26Q)', freq: 'Quarterly', desc: 'Quarterly returns for TDS deducted on salary, contractor, and professional payments.' },
              { icon: 'fa-calculator', label: 'GST Returns (GSTR-1, 3B)', freq: 'Monthly/Quarterly', desc: 'Monthly or quarterly GST filing depending on turnover threshold.' },
            ].map((c, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}><i className={`fas ${c.icon}`} /></div>
                  <span style={{ background: '#F0FDF4', color: '#059669', border: '1px solid #D1FAE5', padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 800 }}>{c.freq}</span>
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>{c.label}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0, lineHeight: 1.55 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARISON */}
        <section id="comparison" style={{ scrollMarginTop: 150, marginBottom: 80 }}>
          <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1A56DB', padding: '4px 14px', borderRadius: 30, fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>ENTITY COMPARISON</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>Company vs LLP vs OPC</h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', margin: '0 0 32px 0' }}>Choose the right structure for your business goals.</p>
          <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1.5px solid #E2E8F0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#1A56DB' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 800, letterSpacing: 0.5 }}>Feature</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 800, letterSpacing: 0.5 }}>Pvt Ltd</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 800, letterSpacing: 0.5 }}>LLP</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 800, letterSpacing: 0.5 }}>OPC</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Liability Protection', '✓ Limited', '✓ Limited', '✓ Limited'],
                  ['Minimum Members', '2 Directors', '2 Partners', '1 Director'],
                  ['VC/Angel Funding', '✓ Preferred', '✗ Not ideal', '✗ Not eligible'],
                  ['Tax Rate', '22% base', '30% as LLP', '22% base'],
                  ['Compliance Level', 'Moderate', 'Low', 'Low'],
                  ['Startup India Eligible', '✓ Yes', '✗ No', '✗ No'],
                  ['Govt Fees (approx)', '₹7,000–15,000', '₹5,000–10,000', '₹4,000–8,000'],
                ].map(([feature, pvt, llp, opc], idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td style={{ padding: '12px 20px', fontSize: '0.875rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #F1F5F9' }}>{feature}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '0.875rem', color: '#1A56DB', fontWeight: 700, borderBottom: '1px solid #F1F5F9' }}>{pvt}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '0.875rem', color: '#6B7280', borderBottom: '1px solid #F1F5F9' }}>{llp}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '0.875rem', color: '#6B7280', borderBottom: '1px solid #F1F5F9' }}>{opc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA BANNER */}
        <div style={{ background: 'linear-gradient(135deg, #1A56DB 0%, #1643B7 100%)', borderRadius: 20, padding: '48px 40px', textAlign: 'center', boxShadow: '0 12px 40px rgba(26,86,219,0.30)' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px 0' }}>Ready to Register Your Company?</h2>
          <p style={{ color: '#BFDBFE', fontSize: '1rem', margin: '0 0 28px 0' }}>Expert CA team will handle everything — from name approval to bank account setup.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setInquiryModal(true)} style={{ background: '#FFFFFF', color: '#1A56DB', padding: '12px 28px', borderRadius: 10, border: 'none', fontWeight: 900, fontSize: '0.975rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              Start Registration <i className="fas fa-arrow-right" style={{ marginLeft: 6 }} />
            </button>
            <a href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20register%20a%20company." target="_blank" rel="noopener noreferrer" style={{ background: '#10B981', color: '#FFFFFF', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: '0.975rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className="fab fa-whatsapp" style={{ fontSize: '1rem' }} /> WhatsApp CA
            </a>
          </div>
        </div>
      </div>

      {/* -- FOOTER -- */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <LogoMark href="/" size="md" style={{ marginBottom: 16 }} />
              <p>Expert CA services for individuals, businesses and corporations. Trusted by 5000+ clients across India for ITR filing, GST, ROC and all compliance needs.</p>
              <div className="lp-footer-social">
                <a href="#" className="lp-social-btn" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
                <a href="#" className="lp-social-btn" aria-label="Twitter"><i className="fab fa-twitter" /></a>
                <a href="#" className="lp-social-btn" aria-label="Instagram"><i className="fab fa-instagram" /></a>
              </div>
            </div>
            <div>
              <h4>Services</h4>
              <ul>
                <li><Link href="/services/file-itr">ITR Filing</Link></li>
                <li><Link href="/services/company-registration">Company Registration</Link></li>
                <li><Link href="/services">GST Compliance</Link></li>
                <li><Link href="/services">TDS Compliance</Link></li>
              </ul>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/services/company-registration">Pricing</Link></li>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/register">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:info@demandassociatesllp.com">info@demandassociatesllp.com</a></li>
                <li><a href="tel:+919876543210">+91 98765 43210</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 Mantra Taxbooks — D E M &amp; Associates LLP. All rights reserved.</span>
            <span>CA Services | Tax Filing | GST | ROC</span>
          </div>
        </div>
      </footer>

      {/* INQUIRY MODAL */}
      {inquiryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 24, padding: 36, maxWidth: 480, width: '100%', position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setInquiryModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: '#F1F5F9', border: 'none', color: '#374151', fontSize: '1rem', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <div style={{ marginBottom: 20 }}><LogoMark href="/" size="md" /></div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>Inquire Company Registration</h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: 24 }}>Enter your details to receive expert CA incorporation guidance.</p>
            {submitted ? (
              <div style={{ background: '#F0FDF4', border: '1.5px solid #10B981', color: '#059669', padding: 20, borderRadius: 12, textAlign: 'center', fontWeight: 700 }}>
                <i className="fas fa-circle-check" style={{ fontSize: '1.5rem', display: 'block', marginBottom: 8 }} />
                Inquiry received! Our CA team will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>Proposed Company Name</label>
                  <input type="text" required style={{ width: '100%', padding: '11px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, color: '#0F172A', fontSize: '0.9rem', boxSizing: 'border-box' }} placeholder="My Brand Private Limited" value={inquiryForm.companyName} onChange={(e) => setInquiryForm({ ...inquiryForm, companyName: e.target.value })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>Email Address</label>
                  <input type="email" required style={{ width: '100%', padding: '11px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, color: '#0F172A', fontSize: '0.9rem', boxSizing: 'border-box' }} placeholder="founder@company.com" value={inquiryForm.email} onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>Phone Number</label>
                  <input type="tel" required style={{ width: '100%', padding: '11px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, color: '#0F172A', fontSize: '0.9rem', boxSizing: 'border-box' }} placeholder="+91 98765 43210" value={inquiryForm.phone} onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1A56DB, #1643B7)', color: '#FFF', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: '0.975rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,86,219,0.35)' }}>
                  Submit Inquiry <i className="fas fa-arrow-right" style={{ marginLeft: 6 }} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
