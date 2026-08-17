'use client'
import type { HealthReport, FinancialData, PillarStatus } from '@/lib/finance'

const CIRC = 2 * Math.PI * 46 // r=46

function scoreColor(score: number) {
  if (score >= 75) return '#27AE60'
  if (score >= 50) return '#F39C12'
  if (score >= 30) return '#E67E22'
  return '#E74C3C'
}

function statusColor(s: PillarStatus) {
  if (s === 'ON_TRACK') return '#27AE60'
  if (s === 'RISK') return '#F39C12'
  if (s === 'WARNING') return '#E67E22'
  return '#E74C3C'
}

function statusBg(s: PillarStatus) {
  if (s === 'ON_TRACK') return 'rgba(39,174,96,.15)'
  if (s === 'RISK') return 'rgba(243,156,18,.15)'
  if (s === 'WARNING') return 'rgba(230,126,34,.15)'
  return 'rgba(231,76,60,.15)'
}

function impactColor(i: string) {
  if (i === 'HIGH') return '#E74C3C'
  if (i === 'MEDIUM') return '#F39C12'
  return '#27AE60'
}

function benchColor(s: string) {
  if (s === 'good') return '#27AE60'
  if (s === 'warn') return '#F39C12'
  return '#E74C3C'
}

function inr(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

interface Props {
  report: HealthReport
  data: FinancialData
  updatedAt?: string
  clientName?: string
  pdfUrl?: string
  onEdit?: () => void
}

export default function FinancialReport({ report, data, updatedAt, clientName, pdfUrl, onEdit }: Props) {
  const { healthScore, pillars, redFlags, actions, benchmarks, netWorth, monthlySurplus, savingsRate } = report
  const sc = scoreColor(healthScore)
  const dashOffset = CIRC - (healthScore / 100) * CIRC

  const scoreLabel = healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Good' : healthScore >= 30 ? 'Needs Attention' : 'At Risk'

  const topMetrics = [
    { label: 'NET WORTH', value: inr(netWorth), icon: 'fa-wallet', color: netWorth >= 0 ? '#27AE60' : '#E74C3C' },
    { label: 'MONTHLY SURPLUS', value: inr(monthlySurplus), icon: 'fa-arrow-trend-up', color: monthlySurplus >= 0 ? '#27AE60' : '#E74C3C' },
    { label: 'SAVINGS RATE', value: `${savingsRate.toFixed(1)}%`, icon: 'fa-piggy-bank', color: savingsRate >= 20 ? '#27AE60' : savingsRate >= 10 ? '#F39C12' : '#E74C3C' },
    { label: 'HEALTH SCORE', value: `${healthScore}/100`, icon: 'fa-heart-pulse', color: sc, chip: scoreLabel },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            {clientName ? `${clientName}'s Financial Snapshot` : 'Your Financial Snapshot'}
          </h2>
          {updatedAt && <p style={{ color: '#888', fontSize: '.78rem', margin: '4px 0 0' }}>Last updated: {new Date(updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {pdfUrl && (
            <a href={pdfUrl} download className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-file-pdf" style={{ color: '#E74C3C' }} /> Download PDF
            </a>
          )}
          {onEdit && (
            <button className="btn btn-secondary btn-sm" onClick={onEdit}>
              <i className="fas fa-pen" /> Update Details
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 22 }}>
        {topMetrics.map(m => (
          <div key={m.label} style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`fas ${m.icon}`} style={{ color: m.color, fontSize: '.95rem' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '.65rem', color: '#999', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: m.color }}>{m.value}</div>
              {m.chip && <div style={{ background: `${m.color}18`, color: m.color, padding: '1px 8px', borderRadius: 8, fontSize: '.65rem', fontWeight: 700, display: 'inline-block', marginTop: 3 }}>{m.chip}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Health Score + Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, marginBottom: 22 }}>
        {/* Gauge Card */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 12, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '.7rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Financial Health Score</div>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="46" fill="none" stroke="#F0F0F0" strokeWidth="10" />
              <circle cx="60" cy="60" r="46" fill="none" stroke={sc} strokeWidth="10"
                strokeDasharray={`${CIRC}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset .6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: sc, lineHeight: 1 }}>{healthScore}</span>
              <span style={{ fontSize: '.62rem', color: '#999', marginTop: 2 }}>out of 100</span>
            </div>
          </div>
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '.85rem', color: sc }}>{scoreLabel}</div>
            {redFlags.length > 0 && (
              <div style={{ fontSize: '.72rem', color: '#E74C3C', marginTop: 6 }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: 4 }} />
                Risk: {redFlags[0].title}
              </div>
            )}
          </div>
        </div>

        {/* Pillars Card */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Health Pillars</span>
            <span style={{ fontSize: '.72rem', color: '#999' }}>Tap a pillar for insights</span>
          </div>
          {pillars.map(p => {
            const pct = p.score / p.maxScore
            return (
              <div key={p.key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className={`fas ${p.icon}`} style={{ color: statusColor(p.status), width: 16, textAlign: 'center' }} />
                    <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{p.name}</span>
                    <span style={{ background: statusBg(p.status), color: statusColor(p.status), padding: '1px 8px', borderRadius: 8, fontSize: '.65rem', fontWeight: 700 }}>{p.status.replace('_', ' ')}</span>
                    {p.tags.map(t => (
                      <span key={t} style={{ background: 'rgba(243,156,18,.15)', color: '#E67E22', padding: '1px 8px', borderRadius: 8, fontSize: '.65rem', fontWeight: 700 }}>{t}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#333' }}>{p.score} <span style={{ color: '#999', fontWeight: 400 }}>/{p.maxScore}</span></span>
                </div>
                <div style={{ height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct * 100}%`, background: statusColor(p.status), borderRadius: 3, transition: 'width .5s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Red Flags ({redFlags.length})</h3>
            <span style={{ fontSize: '.72rem', color: '#999' }}>{redFlags.filter(f => f.severity === 'CRITICAL').length} critical</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {redFlags.map((f, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${f.severity === 'CRITICAL' ? 'rgba(231,76,60,.25)' : 'rgba(243,156,18,.25)'}`, borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: f.severity === 'CRITICAL' ? 'rgba(231,76,60,.12)' : 'rgba(243,156,18,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <i className="fas fa-exclamation-triangle" style={{ color: f.severity === 'CRITICAL' ? '#E74C3C' : '#F39C12', fontSize: '.85rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ background: f.severity === 'CRITICAL' ? 'rgba(231,76,60,.15)' : 'rgba(243,156,18,.15)', color: f.severity === 'CRITICAL' ? '#E74C3C' : '#F39C12', padding: '2px 8px', borderRadius: 6, fontSize: '.68rem', fontWeight: 700 }}>{f.severity}</span>
                      <strong style={{ fontSize: '.88rem' }}>{f.title}</strong>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '.83rem', color: '#555' }}>{f.desc}</p>
                    <div style={{ background: '#F8F8F8', borderRadius: 6, padding: '7px 12px', fontSize: '.78rem', color: '#444', display: 'flex', gap: 8 }}>
                      <i className="fas fa-lightbulb" style={{ color: '#F39C12', marginTop: 2, flexShrink: 0 }} />
                      <span>{f.action}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '.72rem', color: '#888' }}>
                      Financial impact: <span style={{ color: impactColor(f.impact), fontWeight: 700 }}>{f.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Actions */}
      {actions.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <h3 style={{ fontWeight: 700, fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Priority Actions ({actions.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actions.map(a => (
              <div key={a.rank} style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#C41E3A,#8B0000)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', flexShrink: 0 }}>A{a.rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 3 }}>{a.title}</div>
                  <div style={{ fontSize: '.8rem', color: '#666', marginBottom: 8 }}>{a.desc}</div>
                  <div style={{ background: '#F5F5F5', borderRadius: 6, padding: '6px 12px', fontSize: '.78rem', color: '#444', display: 'flex', gap: 8 }}>
                    <i className="fas fa-play" style={{ color: 'var(--red)', marginTop: 2, flexShrink: 0, fontSize: '.7rem' }} />
                    <span>{a.step}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: '.72rem', color: '#888' }}>
                    Impact: <span style={{ color: impactColor(a.impact), fontWeight: 700 }}>{a.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benchmarks */}
      <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 12, overflow: 'hidden', marginBottom: 22 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Your Numbers vs. Benchmarks</h3>
          <span style={{ fontSize: '.72rem', color: '#999' }}>Personalised for your profile</span>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Progress</th>
                <th style={{ textAlign: 'right' }}>Yours</th>
                <th style={{ textAlign: 'right' }}>Target</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map(b => (
                <tr key={b.metric}>
                  <td style={{ fontWeight: 600, fontSize: '.83rem' }}>{b.metric}</td>
                  <td>
                    <span style={{ background: b.status === 'good' ? 'rgba(39,174,96,.15)' : b.status === 'warn' ? 'rgba(243,156,18,.15)' : 'rgba(231,76,60,.15)', color: benchColor(b.status), padding: '2px 10px', borderRadius: 8, fontSize: '.72rem', fontWeight: 700 }}>
                      {b.status === 'good' ? 'ON TRACK' : b.status === 'warn' ? 'WARNING' : 'CRITICAL'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: benchColor(b.status), fontSize: '.83rem' }}>{b.yours}</td>
                  <td style={{ textAlign: 'right', fontSize: '.78rem', color: '#888' }}>{b.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Inputs Summary */}
      <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
          <h3 style={{ fontWeight: 700, fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Input Details</h3>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          {[
            ['Monthly Income', inr(data.monthlyIncome)],
            ['Monthly Expenses', inr(data.monthlyExpenses)],
            ['Monthly Savings/SIP', inr(data.monthlySavings)],
            ['Emergency Fund', inr(data.emergencyFund)],
            ['Total Assets', inr(data.totalAssets)],
            ['Life Insurance Cover', inr(data.lifeInsuranceCover)],
            ['Health Insurance Cover', inr(data.healthInsuranceCover)],
            ['Retirement Savings', inr(data.retirementSavings)],
            ['Total Debt', inr(data.totalDebt)],
            ['Monthly EMI', inr(data.monthlyEmi)],
            ['Equity %', `${data.equityPercentage}%`],
          ].map(([label, value]) => (
            <div key={label} style={{ fontSize: '.83rem' }}>
              <div style={{ color: '#888', fontSize: '.72rem', marginBottom: 2 }}>{label}</div>
              <div style={{ fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
