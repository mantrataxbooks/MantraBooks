'use client'
import { useEffect, useState } from 'react'
import type { FinancialData, HealthReport } from '@/lib/finance'
import FinancialReport from '@/components/FinancialReport'

const emptyForm: FinancialData = {
  monthlyIncome: 0, monthlyExpenses: 0, monthlySavings: 0,
  emergencyFund: 0, lifeInsuranceCover: 0, healthInsuranceCover: 0,
  retirementSavings: 0, totalDebt: 0, monthlyEmi: 0,
  equityPercentage: 0, totalAssets: 0,
}

const SECTIONS = [
  {
    title: 'Income & Expenses', icon: 'fa-rupee-sign', color: '#27AE60',
    fields: [
      { key: 'monthlyIncome', label: 'Monthly Take-Home Income (₹)', placeholder: '50000', hint: 'After-tax salary or business income per month' },
      { key: 'monthlyExpenses', label: 'Monthly Expenses (₹)', placeholder: '30000', hint: 'Rent, utilities, groceries, etc.' },
      { key: 'monthlySavings', label: 'Monthly Savings / SIP (₹)', placeholder: '10000', hint: 'Amount you invest or save each month' },
    ],
  },
  {
    title: 'Emergency & Assets', icon: 'fa-piggy-bank', color: '#3498DB',
    fields: [
      { key: 'emergencyFund', label: 'Emergency Fund (₹)', placeholder: '0', hint: 'Cash in savings / liquid fund for emergencies' },
      { key: 'totalAssets', label: 'Total Assets (₹)', placeholder: '0', hint: 'Total value: FD, MF, stocks, gold, property, etc.' },
    ],
  },
  {
    title: 'Insurance', icon: 'fa-shield-alt', color: '#C41E3A',
    fields: [
      { key: 'lifeInsuranceCover', label: 'Life Insurance Cover (₹)', placeholder: '0', hint: 'Sum assured of all term/life policies combined' },
      { key: 'healthInsuranceCover', label: 'Health Insurance Cover (₹)', placeholder: '0', hint: 'Floater/individual health plan sum insured' },
    ],
  },
  {
    title: 'Retirement & Investments', icon: 'fa-chart-line', color: '#9B59B6',
    fields: [
      { key: 'retirementSavings', label: 'Retirement Savings (₹)', placeholder: '0', hint: 'EPF, PPF, NPS corpus total' },
      { key: 'equityPercentage', label: 'Equity Allocation (%)', placeholder: '0', hint: 'What % of total investments is in equity/stocks/MF?' },
    ],
  },
  {
    title: 'Debt', icon: 'fa-credit-card', color: '#E67E22',
    fields: [
      { key: 'totalDebt', label: 'Total Outstanding Debt (₹)', placeholder: '0', hint: 'Home loan, car loan, credit card, personal loan balance' },
      { key: 'monthlyEmi', label: 'Total Monthly EMI (₹)', placeholder: '0', hint: 'Sum of all loan EMIs per month' },
    ],
  },
]

export default function SummaryPage() {
  const [mode, setMode] = useState<'loading' | 'form' | 'report'>('loading')
  const [form, setForm] = useState<FinancialData>(emptyForm)
  const [report, setReport] = useState<HealthReport | null>(null)
  const [savedData, setSavedData] = useState<FinancialData | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/summary')
      .then(r => r.json())
      .then(d => {
        if (d.noData) { setMode('form'); return }
        setForm(d.data)
        setSavedData(d.data)
        setReport(d.report)
        setUpdatedAt(d.updatedAt)
        setMode('report')
      })
      .catch(() => setMode('form'))
  }, [])

  const set = (key: keyof FinancialData, raw: string) => {
    const v = parseFloat(raw) || 0
    setForm(f => ({ ...f, [key]: v }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErr('')
    const res = await fetch('/api/summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(d.error || 'Save failed.'); return }
    setSavedData(form)
    setReport(d.report)
    setUpdatedAt(d.updatedAt)
    setMode('report')
  }

  if (mode === 'loading') return <div style={{ textAlign: 'center', padding: 80 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--red)' }} /></div>

  return (
    <>
      <div className="pg-title">Financial Health Summary</div>
      <div className="pg-sub">Track your financial health across 5 pillars and get personalised action plan.</div>

      {mode === 'form' && (
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
            {SECTIONS.map(section => (
              <div key={section.title} className="card">
                <div className="card-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${section.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fas ${section.icon}`} style={{ color: section.color, fontSize: '.85rem' }} />
                    </div>
                    {section.title}
                  </h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
                    {section.fields.map(f => (
                      <div key={f.key} className="form-group" style={{ margin: 0 }}>
                        <label>{f.label}</label>
                        <input
                          className="form-control"
                          type="number"
                          min="0"
                          step="1"
                          placeholder={f.placeholder}
                          value={form[f.key as keyof FinancialData] || ''}
                          onChange={e => set(f.key as keyof FinancialData, e.target.value)}
                        />
                        {f.hint && <p style={{ fontSize: '.72rem', color: '#999', margin: '4px 0 0' }}>{f.hint}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {err && <div className="alert alert-err">{err}</div>}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 24 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin" /> Calculating...</> : <><i className="fas fa-chart-pie" /> Calculate My Health Score</>}
              </button>
              {savedData && (
                <button type="button" className="btn btn-secondary" onClick={() => { setForm(savedData); setMode('report') }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {mode === 'report' && report && savedData && (
        <FinancialReport
          report={report}
          data={savedData}
          updatedAt={updatedAt}
          pdfUrl="/api/summary/pdf"
          onEdit={() => { setForm(savedData); setMode('form') }}
        />
      )}
    </>
  )
}
