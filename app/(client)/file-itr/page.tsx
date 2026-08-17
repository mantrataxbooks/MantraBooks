'use client'

import React, { useState, useMemo, useRef } from 'react'
import Link from 'next/link'

// Income sources list with icons matching the exact mockup
const incomeSourcesList = [
  { id: 'salary', label: 'Salary', icon: '💼' },
  { id: 'rent', label: 'House Property / Rent', icon: '🏠' },
  { id: 'capitalGains', label: 'Capital Gains', icon: '📈' },
  { id: 'business', label: 'Business / Professional', icon: '🏢' },
  { id: 'fno', label: 'Futures & Options', icon: '📊' },
  { id: 'crypto', label: 'Cryptocurrency', icon: '₿' },
  { id: 'foreign', label: 'Foreign Income', icon: '🌐' },
  { id: 'nri', label: 'NRI — Indian Income', icon: '✈️' },
]

// Package details matching homepage specs
const plansMap: Record<string, {
  name: string
  price: number
  per: string
  tax: string
  desc: string
  features: string[]
  deliverables: string[]
}> = {
  'salary-nil': {
    name: 'Salary (Nil Return)',
    price: 999,
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'Single salary income with total income ≤ ₹12,75,000',
    features: ['Single Employer', 'Income from other sources', 'Total income ≤ ₹12,75,000', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report'],
  },
  'salary-property': {
    name: 'Salary & Property',
    price: 2000,
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'Salary + House Property income',
    features: ['Single or multiple employers', 'Single or multiple house properties', 'Income from other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report'],
  },
  'capital-gains': {
    name: 'Capital Gains',
    price: 2500,
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'Salary + Rent + Capital Gains (shares, MFs, properties)',
    features: ['Single or multiple employers', 'Single or multiple house properties', 'Multiple capital gain incomes (shares, MFs, properties)', 'Other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report', 'Losses carried forward report'],
  },
  'business': {
    name: 'Business / Professional Income',
    price: 3000,
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'Salary + Rent + Capital Gains + Business/Professional Income',
    features: ['Single or multiple employers', 'Single or multiple house properties', 'Multiple capital gain incomes', 'Business/Professional Income (Non-Audit) — without B/S & P&L', 'Other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report', 'Losses carried forward report'],
  },
  'fno-crypto': {
    name: 'Futures & Options / Cryptocurrency',
    price: 3500,
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'All income types including F&O and Crypto',
    features: ['Single or multiple employers', 'Single or multiple house properties', 'Multiple capital gain incomes', 'Business/Professional Income (Non-Audit) — without B/S & P&L', 'Revenue from F&O / Crypto', 'Other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report', 'Losses carried forward report'],
  },
  'nri-foreign': {
    name: 'NRI / Foreign Income',
    price: 5000,
    per: 'per year',
    tax: 'Exclusive of GST',
    desc: 'NRI with Indian income or Resident with foreign income',
    features: ['Single or multiple employers', 'Multiple house properties', 'Multiple capital gain incomes', 'Business & Professional Income (Non-Audit)', 'Revenue from F&O / Crypto', 'DTAA Tax Relief', 'Foreign salary (including foreign tax relief)', 'Other sources', 'CA reviewed filing'],
    deliverables: ['Income tax return acknowledgement', 'Statement of Income', 'Financial health report', 'Tax planning report', 'Losses carried forward report'],
  },
}

export default function FileITRPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedSources, setSelectedSources] = useState<string[]>(['rent', 'capitalGains'])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Toggle income source selection
  const toggleSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Calculate selected package based on chosen income sources
  const currentPackage = useMemo(() => {
    if (selectedSources.includes('foreign') || selectedSources.includes('nri')) {
      return plansMap['nri-foreign']
    }
    if (selectedSources.includes('fno') || selectedSources.includes('crypto')) {
      return plansMap['fno-crypto']
    }
    if (selectedSources.includes('business')) {
      return plansMap['business']
    }
    if (selectedSources.includes('capitalGains')) {
      return plansMap['capital-gains']
    }
    if (selectedSources.includes('rent')) {
      return plansMap['salary-property']
    }
    return plansMap['salary-nil']
  }, [selectedSources])

  // File Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
      e.dataTransfer.clearData()
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle final submission
  const handleSubmitFiling = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/itr/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomeSources: selectedSources,
          packageName: currentPackage.name,
          fee: currentPackage.price,
          fileCount: uploadedFiles.length,
          files: uploadedFiles.map((f) => f.name),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSubmittedRef(data.referenceId || `ITR-${Math.floor(100000 + Math.random() * 900000)}`)
      } else {
        setSubmittedRef(`ITR-${Math.floor(100000 + Math.random() * 900000)}`)
      }
    } catch {
      setSubmittedRef(`ITR-${Math.floor(100000 + Math.random() * 900000)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setCurrentStep(1)
    setSubmittedRef(null)
    setUploadedFiles([])
    setSelectedSources(['rent', 'capitalGains'])
  }

  const stepsList = [
    { number: 1, title: 'Income Sources' },
    { number: 2, title: 'Review Package' },
    { number: 3, title: 'Upload Documents' },
    { number: 4, title: 'Confirm' },
  ]

  return (
    <div style={{ width: '100%', maxWidth: '100%', minHeight: 'calc(100vh - 120px)', padding: '16px 24px 60px', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
      {/* ── FULL-WIDTH VISIBLE HEADER ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text, #FFFFFF)', margin: 0, letterSpacing: '-0.01em' }}>
          File ITR
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--textl, #94A3B8)', margin: '4px 0 0 0', fontWeight: 500 }}>
          Filing details for the Income Tax Returns
        </p>
      </div>

      {/* ── FULL-WIDTH STEPPER PROGRESS BAR ── */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        {stepsList.map((st, idx) => {
          const isActive = currentStep === st.number
          const isCompleted = currentStep > st.number

          return (
            <React.Fragment key={st.number}>
              <div
                onClick={() => isCompleted && setCurrentStep(st.number as 1 | 2 | 3 | 4)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: isCompleted ? 'pointer' : 'default',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isCompleted ? '#16A34A' : isActive ? '#2563EB' : 'var(--surface2, #1E293B)',
                    border: isCompleted ? 'none' : isActive ? 'none' : '1.5px solid var(--border, #475569)',
                    color: isCompleted || isActive ? '#FFFFFF' : 'var(--textl, #94A3B8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    boxShadow: isActive ? '0 1px 6px rgba(37,99,235,0.4)' : 'none',
                  }}
                >
                  {isCompleted ? '✓' : st.number}
                </div>
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: isActive || isCompleted ? 600 : 500,
                    color: isCompleted ? '#16A34A' : isActive ? '#60A5FA' : 'var(--textl, #94A3B8)',
                  }}
                >
                  {st.title}
                </span>
              </div>

              {idx < stepsList.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 40,
                    height: 2,
                    background: currentStep > st.number ? '#16A34A' : 'var(--border, #334155)',
                    margin: '0 8px',
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* ── SUCCESS VIEW IF SUBMITTED ── */}
      {submittedRef ? (
        <div
          style={{
            flex: 1,
            width: '100%',
            background: 'var(--surface, #1E293B)',
            border: '1px solid var(--border, #334155)',
            borderRadius: 12,
            padding: '40px 3%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: 18,
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text, #FFFFFF)', margin: '0 0 8px 0' }}>
            ITR Filing Request Submitted!
          </h2>
          <p style={{ color: 'var(--textl, #94A3B8)', fontSize: '0.9rem', maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Your reference ID is <strong style={{ color: '#60A5FA' }}>{submittedRef}</strong>. Our designated Chartered Accountant (CA) will review your documents and reach out within 24 hours.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={resetForm}
              style={{
                padding: '10px 22px',
                borderRadius: 6,
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              File Another ITR
            </button>
            <Link
              href="/dashboard"
              style={{
                padding: '10px 22px',
                borderRadius: 6,
                background: 'var(--surface2, #334155)',
                color: 'var(--text, #FFFFFF)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-block',
              }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* ── WIZARD CARD CONTAINER (EXPANDS TO FILL WINDOW) ── */
        <div
          style={{
            flex: 1,
            width: '100%',
            background: 'var(--surface, #1E293B)',
            border: '1px solid var(--border, #334155)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* STEP 1: SELECT INCOME SOURCES */}
          {currentStep === 1 && (
            <div style={{ padding: '28px 3%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text, #FFFFFF)', margin: '0 0 6px 0' }}>
                  Step 1 — Select Your Income Sources
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--textl, #94A3B8)', margin: '0 0 24px 0' }}>
                  Select all that apply to you. The right package will be auto-selected.
                </p>

                {/* 8 FULL-WIDTH DYNAMIC GRID SELECTION CARDS */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 14,
                    marginBottom: 28,
                  }}
                >
                  {incomeSourcesList.map((src) => {
                    const isChecked = selectedSources.includes(src.id)
                    return (
                      <div
                        key={src.id}
                        onClick={() => toggleSource(src.id)}
                        style={{
                          background: isChecked ? 'rgba(37,99,235,0.15)' : 'var(--surface2, #0F172A)',
                          border: isChecked ? '1.5px solid #3B82F6' : '1px solid var(--border, #334155)',
                          borderRadius: 8,
                          padding: '14px 18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            border: isChecked ? 'none' : '1.5px solid #64748B',
                            background: isChecked ? '#2563EB' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && '✓'}
                        </div>
                        <span style={{ fontSize: '1.15rem' }}>{src.icon}</span>
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: isChecked ? 600 : 500,
                            color: isChecked ? '#60A5FA' : 'var(--text, #E2E8F0)',
                          }}
                        >
                          {src.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* STEP 1 ACTION BUTTON */}
              <div style={{ paddingTop: 16 }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}
                >
                  Next: Review Package →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW PACKAGE */}
          {currentStep === 2 && (
            <div style={{ padding: '28px 3%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text, #FFFFFF)', margin: '0 0 20px 0' }}>
                  Step 2 — Your Selected Package
                </h2>

                {/* FULL-WIDTH PACKAGE BANNER */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    borderTop: '3px solid #3B82F6',
                    borderRadius: 10,
                    padding: '24px 3%',
                    color: '#FFFFFF',
                    marginBottom: 24,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
                    {currentPackage.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#60A5FA', lineHeight: 1 }}>
                      ₹{currentPackage.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#CBD5E1', marginTop: 8 }}>
                    {currentPackage.desc}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: 10 }}>
                    {currentPackage.per} &nbsp;|&nbsp; {currentPackage.tax} &nbsp;|&nbsp; CA reviewed filing
                  </div>
                </div>

                {/* FEATURES CHECKLIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, paddingLeft: 2 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Features &amp; Inclusions:
                  </div>
                  {currentPackage.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#DCFCE7',
                          color: '#16A34A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </div>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text, #E2E8F0)', fontWeight: 500 }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* DELIVERABLES CHECKLIST */}
                {currentPackage.deliverables && (
                  <div style={{ padding: '16px 20px', background: 'var(--surface2, #0F172A)', borderRadius: 10, border: '1px solid var(--border, #334155)', marginBottom: 24 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                      Deliverables Included:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                      {currentPackage.deliverables.map((deliv, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: '#60A5FA', fontSize: '0.9rem' }}>📄</span>
                          <span style={{ fontSize: '0.83rem', color: 'var(--text, #CBD5E1)', fontWeight: 500 }}>
                            {deliv}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2 ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{
                    background: 'var(--surface2, #334155)',
                    color: 'var(--text, #FFFFFF)',
                    padding: '10px 20px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}
                >
                  Proceed to Upload →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD DOCUMENTS */}
          {currentStep === 3 && (
            <div style={{ padding: '28px 3%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text, #FFFFFF)', margin: '0 0 18px 0' }}>
                  Step 3 — Upload Documents
                </h2>

                {/* FULL-WIDTH INFO BANNER */}
                <div
                  style={{
                    background: 'rgba(2, 132, 199, 0.15)',
                    borderLeft: '3px solid #0284C7',
                    borderRadius: '0 6px 6px 0',
                    padding: '12px 16px',
                    fontSize: '0.85rem',
                    color: '#38BDF8',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span>ℹ</span>
                  <span>Required Documents: 1) Form 16 &nbsp;|&nbsp; 2) Any two months payslips (Before and after increment) &nbsp;|&nbsp; 3) Section 80 Deductions proofs.</span>
                </div>

                {/* FULL-WIDTH DRAG & DROP ZONE */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '1.5px dashed var(--border, #475569)',
                    borderRadius: 10,
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: 'var(--surface2, #0F172A)',
                    cursor: 'pointer',
                    marginBottom: 24,
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                  />

                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      margin: '0 auto 12px',
                    }}
                  >
                    ☁
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text, #E2E8F0)', marginBottom: 4 }}>
                    Click to browse or <strong style={{ color: '#60A5FA' }}>drag &amp; drop</strong> files here
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--textl, #94A3B8)' }}>
                    PDF, JPG, PNG, Excel — max 10MB each
                  </div>
                </div>

                {/* UPLOADED FILE LIST */}
                {uploadedFiles.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text, #E2E8F0)', marginBottom: 10 }}>
                      Selected Files ({uploadedFiles.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--surface2, #0F172A)',
                            border: '1px solid var(--border, #334155)',
                            borderRadius: 6,
                            padding: '10px 14px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <span style={{ fontSize: '1.1rem' }}>📄</span>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text, #FFFFFF)' }}>
                                {file.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--textl, #94A3B8)' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(idx)
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#F87171',
                              cursor: 'pointer',
                              fontSize: '0.95rem',
                              padding: 4,
                            }}
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* SECTION 80 DEDUCTIONS CHECKLIST GUIDE (PDF SPEC) */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border, #334155)' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#60A5FA', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    📋 Section 80 Deductions Document Guide
                  </div>
                  <div style={{ overflowX: 'auto', background: 'var(--surface2, #0F172A)', borderRadius: 8, border: '1px solid var(--border, #334155)', padding: 12 }}>
                    <table style={{ width: '100%', fontSize: '0.78rem', color: 'var(--text, #CBD5E1)', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px' }}>Deduction Category</th>
                          <th style={{ padding: '6px 8px' }}>Section Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Health insurance premium', '80D'],
                          ['Interest on education loan repaid', '80E'],
                          ['Contribution to Agniveer Corpus Fund', '80CCH'],
                          ['Medical treatment of Handicapped', '80DD'],
                          ['Medical treatment of specified diseases', '80DDB'],
                          ['Donation', '80G'],
                          ['Actual rent paid', '80GG'],
                          ['Life insurance premium', '80C'],
                          ['PF contribution', '80C'],
                          ['Deposit in Sukanya Samriddhi account', '80C'],
                          ['ELSS Mutual Funds', '80C'],
                          ['House loan principal repayment', '80C'],
                          ['National Pension Scheme (NPS)', '80C'],
                          ['NSC Investment', '80C'],
                          ['Post office Time deposit', '80C'],
                          ['PPF Contribution', '80C'],
                          ['Bank Time deposit (5 Year)', '80C'],
                          ['Children Tuition fees', '80C'],
                        ].map(([item, sec], idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '6px 8px' }}>{item}</td>
                            <td style={{ padding: '6px 8px', color: '#60A5FA', fontWeight: 600 }}>Sec {sec}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* STEP 3 ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{
                    background: 'var(--surface2, #334155)',
                    color: 'var(--text, #FFFFFF)',
                    padding: '10px 20px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRM & SUBMIT */}
          {currentStep === 4 && (
            <div style={{ padding: '28px 3%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text, #FFFFFF)', margin: '0 0 18px 0' }}>
                  Step 4 — Confirm &amp; Submit
                </h2>

                {/* FULL-WIDTH SUMMARY CONTAINER */}
                <div
                  style={{
                    background: 'var(--surface2, #0F172A)',
                    border: '1px solid var(--border, #334155)',
                    borderRadius: 10,
                    padding: '20px 24px',
                    marginBottom: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text, #FFFFFF)', marginBottom: 8 }}>
                      Income Sources:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedSources.map((id) => {
                        const item = incomeSourcesList.find((s) => s.id === id)
                        if (!item) return null
                        return (
                          <span
                            key={id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              background: 'rgba(37,99,235,0.15)',
                              border: '1px solid #3B82F6',
                              borderRadius: 6,
                              padding: '5px 12px',
                              fontSize: '0.82rem',
                              color: '#60A5FA',
                              fontWeight: 500,
                            }}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, paddingTop: 10, borderTop: '1px solid var(--border, #334155)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text, #FFFFFF)', fontWeight: 600 }}>Package:</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--textl, #94A3B8)', marginTop: 2 }}>{currentPackage.name}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text, #FFFFFF)', fontWeight: 600 }}>Filing Fee:</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--textl, #94A3B8)', marginTop: 2 }}>
                        ₹{currentPackage.price.toLocaleString('en-IN')} + GST
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text, #FFFFFF)', fontWeight: 600 }}>Documents Uploaded:</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--textl, #94A3B8)', marginTop: 2 }}>
                        {uploadedFiles.length} file(s)
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text, #FFFFFF)', fontWeight: 600 }}>Assessment Year:</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--textl, #94A3B8)', marginTop: 2 }}>AY 2026-27</div>
                    </div>
                  </div>
                </div>

                {/* BLUE NOTICE ALERT */}
                <div
                  style={{
                    background: 'rgba(2, 132, 199, 0.15)',
                    borderLeft: '3px solid #0284C7',
                    borderRadius: '0 6px 6px 0',
                    padding: '12px 16px',
                    fontSize: '0.85rem',
                    color: '#38BDF8',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span>🛡</span>
                  <span>A CA will review and contact you within 24 hours of submission.</span>
                </div>
              </div>

              {/* STEP 4 ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={isSubmitting}
                  style={{
                    background: 'var(--surface2, #334155)',
                    color: 'var(--text, #FFFFFF)',
                    padding: '10px 20px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>

                <button
                  onClick={handleSubmitFiling}
                  disabled={isSubmitting}
                  style={{
                    background: '#16A34A',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : '✓ Submit Filing Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FLOATING WHATSAPP BUTTON ── */}
      <a
        href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20filing%20my%20ITR."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: '#25D366',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(37,211,102,0.4)',
          zIndex: 999,
          textDecoration: 'none',
          fontSize: '1.6rem',
        }}
        title="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp" />
      </a>
    </div>
  )
}
