'use client'
import './landing.css'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { LogoMark } from '@/components/LogoMark'

const services = [
  { icon: 'fa-file-invoice-dollar', title: 'Income Tax Return (ITR)', desc: 'CA-reviewed ITR filing for salaried individuals, business owners, NRIs and professionals with all income types.' },
  { icon: 'fa-receipt', title: 'GST Compliance', desc: 'GSTR-1, GSTR-3B preparation, ITC reconciliation, annual returns GSTR-9 and GSTR-9C.' },
  { icon: 'fa-building', title: 'ROC / MCA Filings', desc: 'Annual return MGT-7, AOC-4, Director KYC, DPT-3, MSME-1 and all event-based company filings.' },
  { icon: 'fa-percentage', title: 'TDS Compliance', desc: 'TDS working, deduction register, 26Q/24Q quarterly returns, TDS challan preparation.' },
  { icon: 'fa-users', title: 'PF & ESI Compliance', desc: 'Monthly PF and ESI workings, ECR challan data, employer and employee contribution calculations.' },
  { icon: 'fa-landmark', title: 'Professional Tax', desc: 'State-wise PT computation from salary register, PT challan preparation and returns.' },
  { icon: 'fa-chart-line', title: 'Business Accounting', desc: 'Monthly bookkeeping, Tally management, MIS reports and financial statement preparation.' },
  { icon: 'fa-search-dollar', title: 'Tax Planning & Advisory', desc: 'Strategic tax planning, deduction optimization under 80C/80D, advance tax computation.' },
]

const packages = [
  {
    name: 'Salary (Nil Return)',
    price: '999',
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'Single salary income with total income ≤ ₹12,75,000',
    featured: false,
    badge: null,
    features: ['Single Employer', 'Income from other sources', 'Total income ≤ ₹12,75,000', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report'],
  },
  {
    name: 'Salary & Property',
    price: '2,000',
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'Salary + House Property income',
    featured: false,
    badge: null,
    features: ['Single or multiple employers', 'Single or multiple house properties', 'Income from other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report'],
  },
  {
    name: 'Capital Gains',
    price: '2,500',
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'Salary + Rent + Capital Gains (shares, MFs, properties)',
    featured: true,
    badge: 'Most Popular',
    features: ['Single or multiple employers', 'Single or multiple house properties', 'Multiple capital gain incomes (shares, MFs, properties)', 'Other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report', 'Losses carried forward report'],
  },
  {
    name: 'Business / Professional Income',
    price: '3,000',
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'Salary + Rent + Capital Gains + Business/Professional Income',
    featured: false,
    badge: null,
    features: ['Single or multiple employers', 'Single or multiple house properties', 'Multiple capital gain incomes', 'Business/Professional Income (Non-Audit) — without B/S & P&L', 'Other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report', 'Losses carried forward report'],
  },
  {
    name: 'Futures & Options / Cryptocurrency',
    price: '3,500',
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'All income types including F&O and Crypto',
    featured: false,
    badge: null,
    features: ['Single or multiple employers', 'Single or multiple house properties', 'Multiple capital gain incomes', 'Business/Professional Income (Non-Audit) — without B/S & P&L', 'Revenue from F&O / Crypto', 'Other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report', 'Losses carried forward report'],
  },
  {
    name: 'NRI / Foreign Income',
    price: '5,000',
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'NRI with Indian income or Resident with foreign income',
    featured: false,
    badge: null,
    features: ['Single or multiple employers', 'Multiple house properties', 'Multiple capital gain incomes', 'Business & Professional Income (Non-Audit)', 'Revenue from F&O / Crypto', 'DTAA Tax Relief', 'Foreign salary (including foreign tax relief)', 'Other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report', 'Losses carried forward report'],
  },
]

const whyUs = [
  { icon: 'fa-user-tie', title: 'CA Reviewed', desc: 'Every return is reviewed by a qualified Chartered Accountant before filing.' },
  { icon: 'fa-lock', title: '100% Secure', desc: 'Bank-grade AES-256 encryption protects all your documents and personal data.' },
  { icon: 'fa-clock', title: 'Fast Turnaround', desc: 'Most returns filed within 24–48 hours of complete document submission.' },
  { icon: 'fa-headset', title: 'Dedicated Support', desc: 'Reach us via WhatsApp, call or email. We respond within business hours.' },
]

const contactItems = [
  { icon: 'fa-envelope', label: 'Email', value: 'info@demandassociatesllp.com' },
  { icon: 'fa-phone', label: 'Phone', value: '+91 98765 43210' },
  { icon: 'fab fa-whatsapp', label: 'WhatsApp', value: 'Chat with us instantly' },
  { icon: 'fa-map-marker-alt', label: 'Office', value: 'India' },
]

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Senior Manager, TCS',
    city: 'Bengaluru',
    text: 'MantraTaxbooks filed my ITR within 24 hours of document submission. The CA review was thorough and I got my refund 3 weeks earlier than last year.',
    rating: 5,
    image: '/testimonial-1.jpg',
    initials: 'RK',
  },
  {
    name: 'Priya Sharma',
    role: 'Freelance UX Designer',
    city: 'Mumbai',
    text: 'Multiple income sources used to give me anxiety every tax season. MantraTaxbooks handled F&O, freelance income, and rental property flawlessly.',
    rating: 5,
    image: '/testimonial-2.jpg',
    initials: 'PS',
  },
  {
    name: 'Arun Mehta',
    role: 'Co-founder, HealthAI',
    city: 'Hyderabad',
    text: 'From company registration to monthly GST — they are our outsourced finance team. Professional, fast, and incredibly affordable for a startup.',
    rating: 5,
    image: '/testimonial-3.jpg',
    initials: 'AM',
  },
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })
  const [contactStatus, setContactStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [modalStep, setModalStep] = useState<null | 'choose' | 'google-disclosure'>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [faqTab, setFaqTab] = useState<'itr' | 'company' | 'llp'>('itr')
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) { clearTimeout(servicesTimeoutRef.current); servicesTimeoutRef.current = null }
    setServicesOpen(true)
  }

  const handleServicesMouseLeave = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current)
    servicesTimeoutRef.current = setTimeout(() => setServicesOpen(false), 200)
  }

  const handleServiceItemClick = () => {
    if (servicesTimeoutRef.current) { clearTimeout(servicesTimeoutRef.current); servicesTimeoutRef.current = null }
    setServicesOpen(false)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactStatus('ok')
  }

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className={`lp-nav${scrolled ? ' lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <LogoMark href="/" size="md" />

          <ul className="lp-nav-links hide-mobile">
            <li><button className="lp-nav-btn" onClick={() => scrollTo('hero')}>Home</button></li>
            <li className="lp-dropdown-wrap" onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
              <Link href="/services" className="lp-nav-btn lp-dropdown-trigger">
                Services <i className={`fas fa-chevron-down lp-caret${servicesOpen ? ' open' : ''}`} />
              </Link>
              {servicesOpen && (
                <div className="lp-dropdown" onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
                  <Link href="/services/file-itr" className="lp-dropdown-item" onClick={handleServiceItemClick}>
                    <i className="fas fa-file-invoice-dollar" />
                    <div>
                      <div className="lp-dropdown-label">File ITR</div>
                      <div className="lp-dropdown-sub">Why It&apos;s Needed &amp; CA Plans</div>
                    </div>
                  </Link>
                  <Link href="/services/company-registration" className="lp-dropdown-item" onClick={handleServiceItemClick}>
                    <i className="fas fa-building" />
                    <div>
                      <div className="lp-dropdown-label">Company Registration</div>
                      <div className="lp-dropdown-sub">Pvt Ltd, LLP, OPC &amp; Contact</div>
                    </div>
                  </Link>
                </div>
              )}
            </li>
            <li><button className="lp-nav-btn" onClick={() => scrollTo('about')}>About</button></li>
            <li><button className="lp-nav-btn" onClick={() => scrollTo('contact')}>Contact</button></li>
          </ul>

          <div className="lp-nav-cta">
            <Link href="/login" className="lp-nav-login hide-mobile">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm hide-mobile">
              Get Started <i className="fas fa-arrow-right" style={{ fontSize: '.7rem' }} />
            </Link>
            <button className="lp-hamburger show-mobile" onClick={() => setMenuOpen(!menuOpen)}>
              <i className={`fas fa-${menuOpen ? 'times' : 'bars'}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lp-mobile-menu">
            <button className="lp-mobile-link" onClick={() => scrollTo('hero')}>Home</button>
            <Link href="/services" className="lp-mobile-link lp-mobile-link-row" onClick={() => setMenuOpen(false)}>
              Services <i className="fas fa-chevron-right" style={{ fontSize: '.7rem', color: '#9CA3AF' }} />
            </Link>
            <Link href="/services/file-itr" className="lp-mobile-sub-link" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-file-invoice-dollar" /> File ITR
            </Link>
            <Link href="/services/company-registration" className="lp-mobile-sub-link" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-building" /> Company Registration
            </Link>
            <button className="lp-mobile-link" onClick={() => scrollTo('about')}>About</button>
            <button className="lp-mobile-link" onClick={() => scrollTo('contact')}>Contact</button>
            <div className="lp-mobile-auth">
              <Link href="/login" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="lp-hero">
        <div className="lp-hero-glow-1" />
        <div className="lp-hero-glow-2" />
        <div className="lp-hero-inner">
          <div className="lp-hero-left">
            <div className="lp-hero-badge">
              <span className="lp-badge-dot" />
              Trusted by 5,000+ individuals &amp; businesses
            </div>
            <h1 className="lp-hero-h1">
              File Your Taxes with<br />
              <span className="lp-hero-accent">Expert CA Review</span>
            </h1>
            <p className="lp-hero-p">
              India&apos;s most trusted CA-backed platform for ITR filing, GST compliance, ROC filings and complete financial services. Fast, accurate, and 100% secure.
            </p>
            <div className="lp-hero-actions">
              <Link href="/register" className="lp-hero-cta-btn">
                <i className="fas fa-file-alt" /> File ITR Now
              </Link>
              <button className="lp-hero-ghost-btn" onClick={() => scrollTo('contact')}>
                <i className="fas fa-calendar-check" /> Book Free Consultation
              </button>
            </div>
            <div className="lp-hero-trust-row">
              <div className="lp-trust-chip"><i className="fas fa-shield-alt" /><span>100% Secure</span></div>
              <div className="lp-trust-chip"><i className="fas fa-star" /><span>4.9 / 5 Rating</span></div>
              <div className="lp-trust-chip"><i className="fas fa-bolt" /><span>24hr Filing</span></div>
            </div>
          </div>

          <div className="lp-hero-right hide-mobile">
            <div className="lp-hero-img-frame">
              <img src="/hero-professional.jpg" alt="CA Professional at MantraTaxbooks" className="lp-hero-img" />
              <div className="lp-float-card lp-float-card-a">
                <div className="lp-fc-icon lp-fc-green"><i className="fas fa-check-circle" /></div>
                <div>
                  <div className="lp-fc-label">ITR Filed Successfully</div>
                  <div className="lp-fc-val">Refund in 7 days ✓</div>
                </div>
              </div>
              <div className="lp-float-card lp-float-card-b">
                <div className="lp-fc-icon lp-fc-amber"><i className="fas fa-rupee-sign" /></div>
                <div>
                  <div className="lp-fc-label">Tax Saved</div>
                  <div className="lp-fc-val">₹24,500</div>
                </div>
              </div>
              <div className="lp-float-card lp-float-card-c">
                <div className="lp-fc-icon lp-fc-blue"><i className="fas fa-user-check" /></div>
                <div>
                  <div className="lp-fc-label">CA Assigned</div>
                  <div className="lp-fc-val">Just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="lp-stats-bar">
        {[['5,000+', 'Happy Clients'], ['15+', 'Years Experience'], ['99%', 'On-time Filing'], ['₹2 Cr+', 'Tax Saved']].map(([n, l]) => (
          <div key={l} className="lp-stat-item">
            <span className="lp-stat-n">{n}</span>
            <span className="lp-stat-l">{l}</span>
          </div>
        ))}
      </div>

      {/* ── EASY & ACCURATE SHOWCASE ── */}
      <section className="lp-showcase-section">
        <div className="lp-showcase-head">
          <h2 className="lp-showcase-h2">
            Tax filing, as easy as it gets.<br />
            <span className="lp-showcase-blue">And as accurate as it needs to be.</span>
          </h2>
        </div>
        <div className="lp-showcase-cards">
          {/* CARD 1: Regime Comparison */}
          <div className="lp-sc-card lp-sc-card-left">
            <div className="lp-sc-card-inner">
              <div className="lp-sc-label">Auto-selects the regime that saves you most</div>
              <div className="lp-regime-row lp-regime-new">
                <div className="lp-regime-left">
                  <div className="lp-regime-name">New regime</div>
                  <div className="lp-regime-val">Tax payable ₹3,68,807</div>
                  <div className="lp-regime-bar lp-regime-bar-blue" />
                </div>
                <div className="lp-regime-check"><i className="fas fa-check-circle" /></div>
              </div>
              <div className="lp-regime-row lp-regime-old">
                <div className="lp-regime-left">
                  <div className="lp-regime-name">Old regime</div>
                  <div className="lp-regime-val lp-regime-val-red">Tax payable ₹5,76,567</div>
                  <div className="lp-regime-bar lp-regime-bar-red" />
                </div>
              </div>
              <div className="lp-regime-savings">
                <i className="fas fa-arrow-down" /> New Regime saves <strong>₹2,07,760 more</strong>
              </div>
            </div>
          </div>

          {/* CARD 2: Loss Adjustment */}
          <div className="lp-sc-card lp-sc-card-center">
            <div className="lp-sc-card-inner">
              <div className="lp-sc-title">Your Loss Adjustment</div>
              {[['Capital Gains', '₹4,57,892'], ['Brought Forward Loss', '₹3,24,673'], ['Net Gains', '₹1,33,219']].map(([label, val]) => (
                <div key={label} className="lp-loss-row">
                  <span className="lp-loss-label">{label}</span>
                  <span className="lp-loss-val">{val}</span>
                  <span className="lp-loss-dot"><i className="fas fa-circle" /></span>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 3: Tax Summary */}
          <div className="lp-sc-card lp-sc-card-right">
            <div className="lp-sc-card-inner">
              <div className="lp-sc-label">Interactive tax summary, every deduction tracked</div>
              {[['Tax savings (deductions)', '₹3,99,673'], ['Taxable Income', '₹2,626,479'], ['Tax payable', '₹3,68,807'], ['Taxes Paid', '₹4,56,892']].map(([label, val]) => (
                <div key={label} className="lp-sum-row">
                  <span className="lp-sum-label">{label}</span>
                  <span className="lp-sum-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="lp-section">
        <div className="lp-sec-head">
          <div className="lp-sec-tag">Our Services</div>
          <h2>Everything You Need, Under One Roof</h2>
          <p>From ITR filing to company registration — our CA team handles your entire financial compliance lifecycle.</p>
        </div>
        <div className="lp-services-grid">
          {services.map((s) => (
            <div key={s.title} className="lp-svc-card">
              <div className="lp-svc-icon"><i className={`fas ${s.icon}`} /></div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="lp-svc-arrow"><i className="fas fa-arrow-right" /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section lp-section-tinted">
        <div className="lp-sec-head">
          <div className="lp-sec-tag">Client Stories</div>
          <h2>Loved by Thousands Across India</h2>
          <p>Real clients, real results. See what they say about their experience.</p>
        </div>
        <div className="lp-testi-grid">
          {testimonials.map((t, idx) => (
            <div key={t.name} className="lp-testi-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="lp-testi-stars">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <i key={i} className="fas fa-star" style={{ color: '#F59E0B', fontSize: '.82rem' }} />
                ))}
              </div>
              <p className="lp-testi-text">&ldquo;{t.text}&rdquo;</p>
              <div className="lp-testi-author">
                <div className="lp-testi-avatar">
                  <img
                    src={t.image}
                    alt={t.name}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="lp-avatar-ini">{t.initials}</span>
                </div>
                <div>
                  <div className="lp-testi-name">{t.name}</div>
                  <div className="lp-testi-role">{t.role} · {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="lp-section">
        <div className="lp-sec-head">
          <div className="lp-sec-tag">ITR Filing Plans</div>
          <h2>Transparent Pricing for AY 2026-27</h2>
          <p>CA-reviewed filing at honest prices. Choose the plan that matches your income type.</p>
        </div>
        <div className="lp-pricing-grid">
          {packages.map((pkg) => (
            <div key={pkg.name} className={`lp-pkg-card${pkg.featured ? ' featured' : ''}`}>
              {pkg.badge && <div className="lp-pkg-badge">{pkg.badge}</div>}
              <h3>{pkg.name}</h3>
              <div className="lp-pkg-price">
                <span className="lp-pkg-cur">₹</span>
                <span className="lp-pkg-amt">{pkg.price}</span>
              </div>
              <div className="lp-pkg-per">{pkg.per}</div>
              <div className="lp-pkg-tax">{pkg.tax}</div>
              <p className="lp-pkg-desc">{pkg.desc}</p>
              <ul className="lp-pkg-feats">
                {pkg.features.map((f) => (
                  <li key={f}><i className="fas fa-check-circle" /> {f}</li>
                ))}
              </ul>
              {pkg.deliverables && (
                <div className="lp-pkg-deliv">
                  <div className="lp-pkg-deliv-label">Deliverables</div>
                  <ul className="lp-pkg-feats" style={{ margin: 0 }}>
                    {pkg.deliverables.map((d) => (
                      <li key={d} style={{ color: '#374151' }}>
                        <i className="fas fa-file-download" style={{ color: '#93C5FD' }} /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                className={`lp-pkg-btn${pkg.featured ? ' lp-pkg-btn-primary' : ''}`}
                onClick={() => setModalStep('choose')}
              >
                Get Started <i className="fas fa-arrow-right" style={{ fontSize: '.78rem' }} />
              </button>
            </div>
          ))}
        </div>
        <p className="lp-pricing-note">* All prices exclusive of GST &nbsp;|&nbsp; CA reviewed filing included in all plans</p>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section className="lp-wc-section">
        <div className="lp-sec-head">
          <h2 className="lp-wc-h2">Why choose <span className="lp-wc-blue">Mantra Taxbooks</span> to file your taxes</h2>
        </div>
        <div className="lp-wc-track">

          {/* Feature 1: CA Expert */}
          <div className="lp-wc-card">
            <div className="lp-wc-img-wrap lp-wc-img-blue">
              <img src="/ca-support.jpg" alt="CA Support Expert" className="lp-wc-img" />
            </div>
            <div className="lp-wc-body">
              <h3 className="lp-wc-feat-title"><span className="lp-wc-blue">CA Expert</span> Review</h3>
              <p className="lp-wc-feat-desc">Every return is reviewed by a qualified Chartered Accountant before filing — ensuring zero errors and maximum accuracy.</p>
            </div>
          </div>

          {/* Feature 2: 24/7 Support */}
          <div className="lp-wc-card">
            <div className="lp-wc-img-wrap lp-wc-img-navy">
              <div className="lp-wc-stat-card">
                <div className="lp-wc-stat-icon"><i className="fas fa-headset" /></div>
                <div className="lp-wc-stat-n">24x7</div>
                <div className="lp-wc-stat-l">Support Available</div>
                <div className="lp-wc-chip-row">
                  <span className="lp-wc-chip"><i className="fab fa-whatsapp" /> WhatsApp</span>
                  <span className="lp-wc-chip"><i className="fas fa-phone" /> Call</span>
                  <span className="lp-wc-chip"><i className="fas fa-envelope" /> Email</span>
                </div>
              </div>
            </div>
            <div className="lp-wc-body">
              <h3 className="lp-wc-feat-title"><span className="lp-wc-blue">24x7</span> Support</h3>
              <p className="lp-wc-feat-desc">Our CA team is available around the clock — via WhatsApp, phone, or email — ready to guide you through every step of your filing.</p>
            </div>
          </div>

          {/* Feature 3: Max Refund */}
          <div className="lp-wc-card">
            <div className="lp-wc-img-wrap lp-wc-img-green">
              <div className="lp-wc-stat-card">
                <div className="lp-wc-stat-icon lp-wc-stat-green"><i className="fas fa-rupee-sign" /></div>
                <div className="lp-wc-stat-n lp-wc-stat-n-green">₹2 Cr+</div>
                <div className="lp-wc-stat-l">Total Tax Saved for Clients</div>
                <div className="lp-refund-tag"><i className="fas fa-check-circle" /> Maximum Refund Guaranteed</div>
              </div>
            </div>
            <div className="lp-wc-body">
              <h3 className="lp-wc-feat-title">Maximum <span className="lp-wc-blue">Tax Savings</span></h3>
              <p className="lp-wc-feat-desc">We identify every eligible deduction under 80C, 80D, HRA and more to ensure you pay the minimum tax legally possible.</p>
            </div>
          </div>

          {/* Feature 4: 100% Accurate */}
          <div className="lp-wc-card">
            <div className="lp-wc-img-wrap lp-wc-img-blue">
              <div className="lp-wc-stat-card">
                <div className="lp-wc-acc-pct">100%</div>
                <div className="lp-wc-acc-label">Accurate &amp; Notice Protected</div>
                <div className="lp-wc-acc-rows">
                  {[['System validation', 'CA review', 'ITR-AO match']].flat().map(t => (
                    <div key={t} className="lp-wc-acc-row"><i className="fas fa-check" /> {t}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lp-wc-body">
              <h3 className="lp-wc-feat-title">100% <span className="lp-wc-blue">Accurate</span></h3>
              <p className="lp-wc-feat-desc">Multi-layer validation — automated system checks followed by CA review — ensures your filing is accurate and notice-proof.</p>
            </div>
          </div>

          {/* Feature 5: Fast Filing */}
          <div className="lp-wc-card">
            <div className="lp-wc-img-wrap lp-wc-img-navy">
              <div className="lp-wc-stat-card">
                <div className="lp-wc-stat-icon"><i className="fas fa-bolt" /></div>
                <div className="lp-wc-stat-n">24 hrs</div>
                <div className="lp-wc-stat-l">Average Filing Time</div>
                <div className="lp-wc-timeline">
                  {['Docs received', 'CA review', 'ITR filed'].map((s, i) => (
                    <div key={s} className="lp-wc-tl-item">
                      <div className="lp-wc-tl-dot" />
                      {i < 2 && <div className="lp-wc-tl-line" />}
                      <div className="lp-wc-tl-label">{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lp-wc-body">
              <h3 className="lp-wc-feat-title">Lightning-Fast <span className="lp-wc-blue">Filing</span></h3>
              <p className="lp-wc-feat-desc">Submit your documents today and receive your filed ITR acknowledgement within 24 hours — guaranteed.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="about" className="lp-section lp-section-tinted">
        <div className="lp-why-wrap">
          <div className="lp-why-left">
            <div className="lp-sec-tag" style={{ display: 'inline-block', marginBottom: 14 }}>Why Mantra Taxbooks</div>
            <h2 className="lp-why-h2">Your Trusted Financial Partner Since 2010</h2>
            <p className="lp-why-lead">We combine technology with CA expertise to deliver fast, accurate compliance at honest prices.</p>
            <div className="lp-why-list">
              {whyUs.map((w) => (
                <div key={w.title} className="lp-why-item">
                  <div className="lp-why-icon"><i className={`fas ${w.icon}`} /></div>
                  <div>
                    <div className="lp-why-title">{w.title}</div>
                    <div className="lp-why-desc">{w.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-why-right hide-mobile">
            <div className="lp-why-img-wrap">
              <img src="/team-ca.jpg" alt="MantraTaxbooks CA Team" className="lp-why-img" />
              <div className="lp-why-badge">
                <div className="lp-why-badge-n">15+</div>
                <div className="lp-why-badge-l">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="lp-faq-section">
        <div className="lp-faq-inner">

          {/* LEFT: Sticky heading */}
          <div className="lp-faq-left">
            <div className="lp-sec-tag" style={{ marginBottom: 16 }}>FAQ</div>
            <h2 className="lp-faq-h2">Frequently<br />Asked<br />Questions</h2>
            <p className="lp-faq-sub">Can&apos;t find your question?</p>
            <button className="lp-faq-email-btn" onClick={() => scrollTo('contact')}>
              <i className="fas fa-envelope" /> Email us
            </button>
            <div className="lp-faq-tabs">
              {([['itr', 'ITR Filing'], ['company', 'Company Inc.'], ['llp', 'LLP Inc.']] as const).map(([key, label]) => (
                <button
                  key={key}
                  className={`lp-faq-tab${faqTab === key ? ' active' : ''}`}
                  onClick={() => { setFaqTab(key); setFaqOpen(0) }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Accordion */}
          <div className="lp-faq-right">
            {faqTab === 'itr' && [
              {
                q: 'Who should file an ITR?',
                a: 'An individual whose annual income is more than the basic exemption limit of ₹2.5 lakh should file an ITR. The basic exemption limit for senior citizens (60 years onwards and less than 80 years) is ₹3 lakh, and for super senior citizens (80 years and above) is ₹5 lakh. Additionally, individuals who have deposited more than ₹1 crore in a current bank account, spent more than ₹2 lakh on foreign travel, or paid electricity bills exceeding ₹1 lakh during the year must also file an ITR regardless of income.'
              },
              {
                q: 'What is the last date for filing an ITR?',
                a: 'For AY 2026-27, the last date to file an ITR without penalty is 31st July 2026 for individuals and non-audit cases. For taxpayers requiring audit under the Income Tax Act, the deadline is 31st October 2026. A belated or revised return can be filed up to 31st December of the assessment year. Missing the deadline attracts a late filing fee of up to ₹5,000 under Section 234F.'
              },
              {
                q: 'How can I claim deductions for tax saving?',
                a: 'You can claim deductions under various sections of the Income Tax Act: Section 80C (up to ₹1.5 lakh) for investments in PPF, ELSS, EPF, LIC premium, NSC, 5-year FDs, home loan principal, and tuition fees. Section 80D for medical insurance premiums (₹25,000 for self/family, additional ₹25,000 for parents). Section 80CCD(1B) for an additional ₹50,000 for NPS contributions. Section 24(b) for home loan interest up to ₹2 lakh. Section 80TTA for savings account interest up to ₹10,000. HRA exemption for salaried employees paying house rent.'
              },
              {
                q: 'What documents are required for ITR filing?',
                a: 'The key documents required include: PAN card and Aadhaar card, Form 16 from your employer (for salaried individuals), Form 26AS and AIS (Annual Information Statement) from the income tax portal, bank account statements for all accounts, details of investments made for deductions (80C, 80D, NPS, etc.), rental agreement and rent receipts if claiming HRA, capital gains statement from broker for share/MF transactions, property registration documents if applicable, and previous year ITR acknowledgement.'
              },
              {
                q: 'I receive my salary after TDS deduction. Am I still required to file an ITR?',
                a: 'Yes, even if your employer has deducted TDS, you are required to file an ITR if your total income exceeds the basic exemption limit. Filing ensures that all your income is accounted for, you can claim a refund of excess TDS deducted, carry forward losses, and have an official income proof. Non-filing despite having taxable income can attract notice under Section 142(1) and penalties under Section 270A.'
              },
              {
                q: 'What is Form 26AS and why is it important?',
                a: 'Form 26AS is a comprehensive tax statement issued by the Income Tax Department that shows all tax credits against your PAN. It includes TDS deducted by employers and banks, advance tax and self-assessment tax paid, tax refunds issued, and high-value transactions reported. Before filing your ITR, you must reconcile your income and TDS with Form 26AS to avoid discrepancies that can lead to notices. It is available on the income tax e-filing portal (incometax.gov.in) under the ‘Annual Tax Statement (26AS)’ section.'
              },
              {
                q: 'How do I check TDS details from Form 26AS?',
                a: 'You can check your Form 26AS by logging into the Income Tax e-filing portal at incometax.gov.in, navigating to e-File → Income Tax Returns → View Form 26AS, or through TRACES (tdscpc.gov.in). The form shows TDS deducted by all deductors, advance tax, self-assessment tax paid, and TCS. Match the TDS shown in Part A and Part B of Form 26AS with your Form 16 and bank TDS certificates before filing.'
              },
              {
                q: 'How can I claim an income tax refund?',
                a: 'A tax refund is claimed when the taxes paid (TDS + advance tax + self-assessment tax) exceed your actual tax liability. To claim a refund: file your ITR on time with the correct bank account (pre-validated and linked to PAN), verify the return within 30 days via Aadhaar OTP, net banking, or sending a signed ITR-V to CPC Bengaluru. After successful processing, the refund is typically credited to your bank account within 20–45 days. You can track the refund status on the e-filing portal or through the NSDL website.'
              },
              {
                q: 'What is the new tax regime and should I choose it?',
                a: 'The new tax regime (applicable from AY 2024-25 onwards as default) offers lower tax rates but does not allow most deductions and exemptions like 80C, 80D, HRA, LTA, and home loan interest. The old regime has higher slab rates but allows all deductions. The new regime is beneficial if you have minimal investments or if your deductions are less than approximately ₹5.75 lakh. Our CAs analyze both regimes and recommend the one that results in lower tax for your specific income profile.'
              },
              {
                q: 'What are the penalties for late filing or non-filing of ITR?',
                a: 'Late filing fees under Section 234F: ₹5,000 if filed after 31st July but before 31st December; ₹10,000 if filed after 31st December (reduced to ₹1,000 if total income is below ₹5 lakh). Non-filing with taxable income can attract scrutiny under Section 143(2), demand under Section 144 (best judgment assessment), penalty under Section 270A (50% of tax for under-reporting, 200% for misreporting), and prosecution under Section 276CC for willful defaults with income above ₹25 lakh.'
              },
              {
                q: 'Can I revise my ITR after filing?',
                a: 'Yes, under Section 139(5), you can file a revised ITR if you discover any omission or wrong statement in the original return. A revised return can be filed any time before the end of the relevant assessment year or before the completion of assessment, whichever is earlier. For AY 2026-27, the deadline for a revised return is 31st December 2026. There is no limit on the number of times you can revise, but each revision supersedes the previous one.'
              },
            ].map((faq, i) => (
              <div key={i} className={`lp-faq-item${faqOpen === i ? ' open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="lp-faq-icon">
                    {faqOpen === i ? <i className="fas fa-minus" /> : <i className="fas fa-plus" />}
                  </span>
                </button>
                {faqOpen === i && <div className="lp-faq-a">{faq.a}</div>}
              </div>
            ))}

            {faqTab === 'company' && [
              {
                q: 'What is a Private Limited Company?',
                a: 'A Private Limited Company (Pvt Ltd) is the most popular business structure in India, governed by the Companies Act 2013. It offers limited liability protection to its shareholders (liability limited to their share capital), separate legal entity status, perpetual succession, and ease of raising funds through equity. A minimum of 2 directors and 2 shareholders are required, and the maximum number of shareholders is 200. It is ideal for startups, SMEs, and businesses that plan to raise institutional funding or venture capital.'
              },
              {
                q: 'What documents are required to register a Private Limited Company?',
                a: 'For incorporation of a Pvt Ltd company, you need: PAN card and Aadhaar card of all directors/shareholders, passport-sized photographs, address proof of directors (latest bank statement/utility bill), proof of registered office address (electricity bill + rent agreement or ownership document), DSC (Digital Signature Certificate) of all directors, and DIN (Director Identification Number). The company name must be approved through the RUN (Reserve Unique Name) facility on the MCA portal.'
              },
              {
                q: 'How long does it take to register a Private Limited Company?',
                a: 'With all documents in order, a Private Limited Company can typically be registered within 10–15 working days. The process involves: name reservation through SPICe+ Part A (2–3 days), preparation and filing of incorporation documents via SPICe+ Part B (3–5 days), government processing and approval (5–7 days). Our team expedites the process by ensuring accurate preparation of MOA, AOA, and all required forms. You receive the Certificate of Incorporation along with PAN and TAN of the company.'
              },
              {
                q: 'What is the minimum capital required to start a Private Limited Company?',
                a: 'There is no minimum paid-up capital requirement for a Private Limited Company under the Companies Act 2013. Earlier, a minimum paid-up capital of ₹1 lakh was required, which was removed by the Companies Amendment Act 2015. You can start a company with even ₹1 of paid-up capital. However, the authorized share capital (stated in MOA) typically starts at ₹1 lakh, on which a government stamp duty fee is applicable.'
              },
              {
                q: 'What are the annual compliance requirements for a Private Limited Company?',
                a: 'Annual compliances include: filing of Annual Return (MGT-7/7A) within 60 days of AGM, filing of Financial Statements (AOC-4) within 30 days of AGM, holding Annual General Meeting (AGM) within 6 months of financial year end, filing of Income Tax Return (ITR-6), conducting Board Meetings (minimum 4 per year), filing DIR-3 KYC for all directors annually, MSME-1 (if applicable), DPT-3 for deposits, and INC-20A (declaration of commencement of business). Non-compliance attracts heavy penalties under the Companies Act.'
              },
              {
                q: 'What is the difference between a Pvt Ltd Company and an OPC?',
                a: 'A One Person Company (OPC) is a company with only one member and one director, suitable for solo entrepreneurs. Key differences: OPC requires only 1 member (Pvt Ltd needs minimum 2), OPC’s turnover must not exceed ₹2 crore (otherwise must convert to Pvt Ltd), OPC cannot carry out Non-Banking Financial investment activities, OPC cannot issue debentures or invite public deposits, and OPC has relaxed compliance requirements. Both provide limited liability and separate legal entity status.'
              },
              {
                q: 'What is SPICe+ and how is company registration done?',
                a: 'SPICe+ (Simplified Proforma for Incorporating Company Electronically Plus) is the integrated web form on the MCA portal for company incorporation. Part A allows name reservation, and Part B covers PAN/TAN allotment, DIN allotment, EPFO registration, ESIC registration, Professional Tax registration (for Maharashtra), GST registration (optional), and bank account opening with select banks. Our team handles the complete SPICe+ filing and ensures all linked registrations are completed simultaneously.'
              },
              {
                q: 'Can a foreign national or NRI be a director or shareholder of an Indian company?',
                a: 'Yes, foreign nationals and NRIs can be directors and shareholders of a Private Limited Company in India. At least one director must be a resident Indian (stayed in India for at least 182 days during the previous calendar year). Foreign nationals need apostilled/notarized identity and address proof documents. FDI (Foreign Direct Investment) in Indian companies is subject to the FDI Policy of India, which allows 100% FDI under the automatic route in most sectors.'
              },
            ].map((faq, i) => (
              <div key={i} className={`lp-faq-item${faqOpen === i ? ' open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="lp-faq-icon">
                    {faqOpen === i ? <i className="fas fa-minus" /> : <i className="fas fa-plus" />}
                  </span>
                </button>
                {faqOpen === i && <div className="lp-faq-a">{faq.a}</div>}
              </div>
            ))}

            {faqTab === 'llp' && [
              {
                q: 'What is a Limited Liability Partnership (LLP)?',
                a: 'A Limited Liability Partnership (LLP) is a hybrid business structure that combines the flexibility of a partnership with the limited liability protection of a company. Governed by the LLP Act 2008, it provides partners with limited liability (partners’ personal assets are protected from business liabilities), a separate legal entity status, and fewer compliance requirements compared to a Private Limited Company. A minimum of 2 designated partners are required, at least one of whom must be a resident of India.'
              },
              {
                q: 'What is the difference between an LLP and a Private Limited Company?',
                a: 'Key differences: LLP has no minimum capital requirement and lower compliance costs, while Pvt Ltd has structured share capital. LLP profits are taxed only once (in hands of partners), while Pvt Ltd pays corporate tax (22%/25%) plus dividend distribution tax. LLP cannot issue equity shares or raise VC funding easily, while Pvt Ltd can. LLP requires annual filing of Form 8 and Form 11 with MCA and ITR-5, while Pvt Ltd has more extensive annual compliances. LLP is better for professional services firms; Pvt Ltd is preferred for growth-oriented startups.'
              },
              {
                q: 'What documents are required to register an LLP?',
                a: 'Documents required: PAN card and Aadhaar of all designated partners, address proof (bank statement/utility bill), passport-sized photographs, DPIN (Designated Partner Identification Number) or DIN of all designated partners, DSC (Digital Signature Certificate) for all designated partners, LLP Agreement (executed on stamp paper as per state stamp duty), and registered office address proof (electricity bill + rent agreement/ownership document). Foreign nationals need apostilled documents.'
              },
              {
                q: 'How long does LLP registration take?',
                a: 'LLP registration typically takes 15–20 working days from the date of submission of complete documents. The process involves: name reservation through RUN-LLP or FiLLiP (3–5 days), DPIN allotment for new partners (2–3 days), preparation and execution of LLP Agreement, filing of FiLLiP on MCA portal (5–7 days), government processing (5–7 days). A Certificate of Incorporation is issued by the Registrar of Companies, after which Form 3 (LLP Agreement) must be filed within 30 days.'
              },
              {
                q: 'What are the annual compliance requirements for an LLP?',
                a: 'Annual compliances for an LLP include: Form 11 – Annual Return (due 30th May each year), Form 8 – Statement of Account & Solvency (due 30th October each year), Income Tax Return (ITR-5) filing, GST returns if registered, Tax Audit if turnover exceeds ₹1 crore for business or ₹50 lakh for professional services. Non-filing attracts a penalty of ₹100 per day per form, which can accumulate significantly. DPIN/DIN KYC (DIR-3 KYC) for designated partners must also be filed annually.'
              },
              {
                q: 'What is the tax treatment of an LLP?',
                a: 'An LLP is taxed as a firm under the Income Tax Act. The LLP itself pays income tax at a flat rate of 30% plus applicable surcharge and cess on its total income. Partners do not pay tax on their share of LLP profits (as it is exempt in their hands under Section 10(2A)). However, remuneration and interest paid to designated partners are deductible in the hands of the LLP (subject to limits under Section 40(b)), and such amounts are taxable as income in the hands of the partners.'
              },
              {
                q: 'Can an LLP convert to a Private Limited Company?',
                a: 'Yes, an LLP can be converted to a Private Limited Company under Section 366 of the Companies Act 2013 read with Companies (Authorised to Register) Rules 2014. The process involves filing Form URC-1 with the Registrar of Companies along with the LLP Agreement, list of partners, statement of assets and liabilities, affidavits, and consent of majority partners. After conversion, the company assumes all assets and liabilities of the LLP. The conversion has no capital gains tax implications and is stamp duty exempt in most states.'
              },
              {
                q: 'Is GST registration mandatory for an LLP?',
                a: 'GST registration for an LLP is mandatory if: aggregate annual turnover exceeds ₹20 lakh (₹10 lakh for special category states), the LLP makes inter-state supplies regardless of turnover, the LLP is an e-commerce operator or supplies through e-commerce platforms, the LLP makes reverse charge mechanism (RCM) supplies, or it was registered under the pre-GST regime (VAT/Service Tax). Voluntary GST registration can also be obtained for input tax credit benefits even if turnover is below the threshold.'
              },
            ].map((faq, i) => (
              <div key={i} className={`lp-faq-item${faqOpen === i ? ' open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="lp-faq-icon">
                    {faqOpen === i ? <i className="fas fa-minus" /> : <i className="fas fa-plus" />}
                  </span>
                </button>
                {faqOpen === i && <div className="lp-faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="lp-section">
        <div className="lp-sec-head">
          <div className="lp-sec-tag">Get In Touch</div>
          <h2>We&apos;d Love to Hear From You</h2>
          <p>Reach out for a free consultation. We typically respond within 2 business hours.</p>
        </div>
        <div className="lp-contact-grid">
          <div className="lp-contact-info">
            <h3>D E M &amp; Associates LLP</h3>
            <p>CA firm offering expert tax, compliance and financial advisory services. Get in touch to discuss how we can help you stay compliant and save tax.</p>
            {contactItems.map((c) => (
              <div key={c.label} className="lp-c-item">
                <div className="lp-c-icon"><i className={c.icon.startsWith('fab') ? c.icon : `fas ${c.icon}`} /></div>
                <div>
                  <strong>{c.label}</strong>
                  <span>{c.value}</span>
                </div>
              </div>
            ))}
            <div className="lp-contact-btns">
              <button className="btn btn-primary" onClick={() => scrollTo('contact')}>
                <i className="fas fa-phone" /> Request Callback
              </button>
              <button className="lp-btn-ghost-green" onClick={() => scrollTo('contact')}>
                <i className="fas fa-video" /> Book Meeting
              </button>
            </div>
          </div>

          <div className="lp-contact-card">
            <div className="lp-contact-card-head">Send Us a Message</div>
            <div className="lp-contact-card-body">
              {contactStatus === 'ok' && (
                <div className="alert alert-ok"><i className="fas fa-check-circle" /> Message sent! We&apos;ll contact you soon.</div>
              )}
              <form onSubmit={handleContact}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input className="form-control" placeholder="Your name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input className="form-control" placeholder="+91 ..." value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input className="form-control" type="email" placeholder="email@example.com" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input className="form-control" placeholder="How can we help?" value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea className="form-control" placeholder="Describe your query..." value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-paper-plane" /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
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
                <li><button onClick={() => scrollTo('services')}>GST Compliance</button></li>
                <li><button onClick={() => scrollTo('services')}>TDS Compliance</button></li>
                <li><button onClick={() => scrollTo('services')}>PF &amp; ESI</button></li>
              </ul>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul>
                <li><button onClick={() => scrollTo('hero')}>Home</button></li>
                <li><Link href="/file-itr">Pricing</Link></li>
                <li><button onClick={() => scrollTo('about')}>About Us</button></li>
                <li><button onClick={() => scrollTo('contact')}>Contact</button></li>
                <li><Link href="/login">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:info@demandassociatesllp.com">info@demandassociatesllp.com</a></li>
                <li><a href="tel:+919876543210">+91 98765 43210</a></li>
                <li><button onClick={() => scrollTo('contact')}>Request Callback</button></li>
                <li><button onClick={() => scrollTo('contact')}>Book Free Meeting</button></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 Mantra Taxbooks — D E M &amp; Associates LLP. All rights reserved.</span>
            <span>CA Services | Tax Filing | GST | ROC</span>
          </div>
        </div>
      </footer>

      {/* ── GET STARTED MODAL ── */}
      {modalStep && (
        <div className="gs-overlay" onClick={() => { setModalStep(null); setGoogleLoading(false) }}>
          <div className="gs-modal" onClick={e => e.stopPropagation()}>
            <button className="gs-close" onClick={() => { setModalStep(null); setGoogleLoading(false) }}>
              <i className="fas fa-times" />
            </button>

            {modalStep === 'choose' && (
              <>
                <div className="gs-logo">
                  <LogoMark href="/" size="lg" />
                </div>
                <h2 className="gs-title">Create your account</h2>
                <p className="gs-sub">Start your CA-reviewed ITR filing today</p>

                <button className="gs-google-btn" onClick={() => setModalStep('google-disclosure')}>
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                  <i className="fas fa-chevron-right gs-arrow" />
                </button>

                <div className="gs-divider"><span>or</span></div>

                <Link href="/register" className="gs-email-btn" onClick={() => setModalStep(null)}>
                  <i className="fas fa-envelope" /> Sign up with email
                </Link>

                <p className="gs-footer-note">
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: '#1A56DB', textDecoration: 'none', fontWeight: 600 }} onClick={() => setModalStep(null)}>Sign in</Link>
                </p>
              </>
            )}

            {modalStep === 'google-disclosure' && (
              <>
                <button className="gs-back" onClick={() => setModalStep('choose')}>
                  <i className="fas fa-arrow-left" /> Back
                </button>
                <div className="gs-google-header">
                  <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <h2 className="gs-title" style={{ marginTop: 10 }}>Continue with Google</h2>
                </div>
                <p className="gs-disclosure-lead">
                  One tap to sign in. We&apos;ll show you exactly what we use on the next screen before anything is saved.
                </p>
                <ul className="gs-disclosure-list">
                  <li>
                    <span className="gs-disc-icon"><i className="fas fa-user-circle" /></span>
                    <span>Google shares your <strong>name, email</strong> and <strong>profile photo</strong> with MantraTaxbooks.</span>
                  </li>
                  <li>
                    <span className="gs-disc-icon gs-disc-icon--green"><i className="fas fa-shield-alt" /></span>
                    <span>We <strong>never</strong> see your Google password. You can revoke access anytime from your Google account.</span>
                  </li>
                  <li>
                    <span className="gs-disc-icon gs-disc-icon--blue"><i className="fas fa-file-contract" /></span>
                    <span>On the next step you&apos;ll review and accept our <strong>Terms</strong> and <strong>Privacy Policy</strong>.</span>
                  </li>
                </ul>
                <button
                  className="gs-google-btn gs-google-btn--proceed"
                  disabled={googleLoading}
                  onClick={() => { setGoogleLoading(true); signIn('google', { callbackUrl: '/terms-accept' }) }}
                >
                  {googleLoading ? <i className="fas fa-spinner fa-spin" /> : (
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {googleLoading ? 'Redirecting...' : 'Continue with Google'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── FLOAT BUTTONS ── */}
      <div className="float-btns">
        <a href="https://wa.me/919876543210" className="fb fb-wa" target="_blank" rel="noopener noreferrer" title="WhatsApp">
          <i className="fab fa-whatsapp" />
        </a>
        <button className="fb fb-cb" onClick={() => scrollTo('contact')} title="Request Callback">
          <i className="fas fa-phone-alt" />
        </button>
      </div>


    </>
  )
}
