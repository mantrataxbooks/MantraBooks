import PDFDocument from 'pdfkit'
import type { FinancialData, HealthReport } from './finance'

const RED = '#C41E3A'
const DARK = '#1A1A1A'
const GRAY = '#666666'

function scoreColor(s: number) {
  return s >= 75 ? '#27AE60' : s >= 50 ? '#F39C12' : s >= 30 ? '#E67E22' : '#E74C3C'
}
function statusColor(s: string) {
  return s === 'ON_TRACK' ? '#27AE60' : s === 'RISK' ? '#F39C12' : s === 'WARNING' ? '#E67E22' : '#E74C3C'
}
function benchColor(s: string) {
  return s === 'good' ? '#27AE60' : s === 'warn' ? '#F39C12' : '#E74C3C'
}
function inr(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}
function fmt(d: Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function generateSummaryPDF(
  clientName: string,
  email: string,
  data: FinancialData,
  report: HealthReport,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = doc.page.width - 100

    const checkPageBreak = (neededHeight: number) => {
      if (doc.y + neededHeight > doc.page.height - 70) {
        doc.addPage()
        // re-draw simple top bar on new page
        doc.rect(0, 0, doc.page.width, 36).fill(DARK)
        doc.fillColor('#C0C0C0').font('Helvetica-Bold').fontSize(10).text('MANTRA TAXBOOKS', 50, 12, { continued: true })
        doc.fillColor('#A0A0A0').font('Helvetica').fontSize(8).text('  |  Financial Health Summary — continued')
        doc.moveDown(1)
      }
    }

    // ── HEADER ──────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(DARK)
    doc.fillColor('#C0C0C0').font('Helvetica-Bold').fontSize(18).text('MANTRA', 50, 20, { continued: true })
    doc.fillColor('#E8E8E8').text(' TAXBOOKS')
    doc.fillColor('#A0A0A0').font('Helvetica').fontSize(8.5).text('Expert CA Services  |  Tax  |  Compliance  |  Accounting', 50, 46)
    doc.fillColor(RED).font('Helvetica-Bold').fontSize(14).text('FINANCIAL HEALTH SUMMARY', 50, 26, { align: 'right', width: W })

    // ── CLIENT + DATE ────────────────────────────────────
    let y = 96
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12).text(clientName, 50, y)
    doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(email, 50, y + 16)
    doc.fillColor(GRAY).font('Helvetica').fontSize(8.5).text(`Generated: ${fmt(new Date())}`, 50, y + 16, { align: 'right', width: W })

    y = 140

    // ── HEALTH SCORE + TOP METRICS ───────────────────────
    const sc = scoreColor(report.healthScore)
    const scoreLabel = report.healthScore >= 75 ? 'Excellent' : report.healthScore >= 50 ? 'Good' : report.healthScore >= 30 ? 'Needs Attention' : 'At Risk'

    // Score box
    doc.rect(50, y, 150, 96).fill('#F8F8F8')
    doc.rect(50, y, 150, 96).stroke('#E0E0E0')
    doc.fillColor(sc).font('Helvetica-Bold').fontSize(38).text(String(report.healthScore), 50, y + 14, { width: 150, align: 'center' })
    doc.fillColor('#999').font('Helvetica').fontSize(8).text('out of 100', 50, y + 58, { width: 150, align: 'center' })
    doc.fillColor(sc).font('Helvetica-Bold').fontSize(10).text(scoreLabel, 50, y + 74, { width: 150, align: 'center' })

    // Top 4 metrics
    const mw = (W - 165) / 4
    const mItems = [
      { label: 'Net Worth', value: inr(report.netWorth), color: report.netWorth >= 0 ? '#27AE60' : '#E74C3C' },
      { label: 'Monthly Surplus', value: inr(report.monthlySurplus), color: report.monthlySurplus >= 0 ? '#27AE60' : '#E74C3C' },
      { label: 'Savings Rate', value: `${report.savingsRate.toFixed(1)}%`, color: report.savingsRate >= 20 ? '#27AE60' : '#F39C12' },
      { label: 'Red Flags', value: String(report.redFlags.length), color: report.redFlags.length === 0 ? '#27AE60' : '#E74C3C' },
    ]
    mItems.forEach((m, i) => {
      const mx = 215 + i * (mw + 6)
      doc.rect(mx, y, mw, 44).fill('#F8F8F8')
      doc.rect(mx, y, mw, 44).stroke('#E0E0E0')
      doc.fillColor(m.color).font('Helvetica-Bold').fontSize(12).text(m.value, mx + 4, y + 8, { width: mw - 8, align: 'center' })
      doc.fillColor('#999').font('Helvetica').fontSize(7).text(m.label, mx + 4, y + 28, { width: mw - 8, align: 'center' })
    })

    y += 110

    // ── HEALTH PILLARS ───────────────────────────────────
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text('HEALTH PILLARS', 50, y)
    doc.rect(50, y + 15, W, 1).fill('#DDDDDD')
    y += 24

    report.pillars.forEach((p) => {
      const pct = p.score / p.maxScore
      const pc = statusColor(p.status)
      const statusText = p.status.replace('_', ' ')
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(p.name, 50, y, { width: 80 })
      doc.fillColor(pc).font('Helvetica-Bold').fontSize(7.5).text(statusText, 138, y + 1, { width: 75 })
      doc.rect(220, y + 2, 270, 8).fill('#EEEEEE')
      if (pct > 0) doc.rect(220, y + 2, Math.round(270 * pct), 8).fill(pc)
      doc.fillColor('#444').font('Helvetica').fontSize(8).text(`${p.score}/${p.maxScore}`, doc.page.width - 65, y, { width: 40, align: 'right' })
      y += 20
    })

    y += 8

    // ── RED FLAGS ────────────────────────────────────────
    if (report.redFlags.length > 0) {
      checkPageBreak(40)
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text(`RED FLAGS (${report.redFlags.length})`, 50, doc.y)
      doc.rect(50, doc.y + 15, W, 1).fill('#DDDDDD')
      doc.moveDown(0.8)

      report.redFlags.forEach((f) => {
        checkPageBreak(58)
        const fc = f.severity === 'CRITICAL' ? '#E74C3C' : '#F39C12'
        const fbg = f.severity === 'CRITICAL' ? '#FDECEA' : '#FEF3E2'
        const cy = doc.y
        doc.rect(50, cy, 56, 13).fill(fbg)
        doc.fillColor(fc).font('Helvetica-Bold').fontSize(7).text(f.severity, 52, cy + 3, { width: 52, align: 'center' })
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(f.title, 116, cy)
        doc.moveDown(0.3)
        doc.fillColor(GRAY).font('Helvetica').fontSize(8).text(f.desc, 50, doc.y, { width: W })
        doc.moveDown(0.2)
        doc.fillColor('#555').font('Helvetica-Oblique').fontSize(7.5).text(`▶  ${f.action}`, 50, doc.y, { width: W })
        doc.moveDown(0.8)
      })
    }

    // ── PRIORITY ACTIONS ─────────────────────────────────
    if (report.actions.length > 0) {
      checkPageBreak(50)
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text(`PRIORITY ACTIONS (${report.actions.length})`, 50, doc.y)
      doc.rect(50, doc.y + 15, W, 1).fill('#DDDDDD')
      doc.moveDown(0.8)

      report.actions.forEach((a) => {
        checkPageBreak(55)
        const ic = a.impact === 'HIGH' ? '#E74C3C' : a.impact === 'MEDIUM' ? '#F39C12' : '#27AE60'
        const ay = doc.y
        doc.circle(62, ay + 7, 10).fill(RED)
        doc.fillColor('#fff').font('Helvetica-Bold').fontSize(7).text(`A${a.rank}`, 54, ay + 4, { width: 16, align: 'center' })
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(a.title, 82, ay)
        doc.fillColor(ic).font('Helvetica-Bold').fontSize(7).text(a.impact, doc.page.width - 65, ay, { width: 40, align: 'right' })
        doc.moveDown(0.3)
        doc.fillColor(GRAY).font('Helvetica').fontSize(8).text(a.desc, 82, doc.y, { width: W - 32 })
        doc.moveDown(0.2)
        doc.fillColor('#555').font('Helvetica-Oblique').fontSize(7.5).text(`▶  ${a.step}`, 82, doc.y, { width: W - 32 })
        doc.moveDown(0.8)
      })
    }

    // ── BENCHMARKS ──────────────────────────────────────
    checkPageBreak(40 + report.benchmarks.length * 18 + 30)
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text('NUMBERS VS. BENCHMARKS', 50, doc.y)
    doc.rect(50, doc.y + 15, W, 1).fill('#DDDDDD')
    doc.moveDown(0.8)

    const by0 = doc.y
    doc.rect(50, by0, W, 18).fill(DARK)
    doc.fillColor('#E8E8E8').font('Helvetica-Bold').fontSize(8)
    doc.text('Metric', 58, by0 + 5, { width: 130 })
    doc.text('Status', 195, by0 + 5, { width: 80 })
    doc.text('Yours', 285, by0 + 5, { width: 105 })
    doc.text('Target', 400, by0 + 5, { width: W - 355 })
    doc.moveDown(0.25)

    report.benchmarks.forEach((b, i) => {
      const bc = benchColor(b.status)
      const bl = b.status === 'good' ? 'ON TRACK' : b.status === 'warn' ? 'WARNING' : 'CRITICAL'
      const ry = doc.y
      doc.rect(50, ry, W, 18).fill(i % 2 === 0 ? '#FFFFFF' : '#F9F9F9')
      doc.fillColor(DARK).font('Helvetica').fontSize(8).text(b.metric, 58, ry + 5, { width: 130 })
      doc.fillColor(bc).font('Helvetica-Bold').fontSize(7.5).text(bl, 195, ry + 5, { width: 80 })
      doc.fillColor(bc).font('Helvetica-Bold').fontSize(8).text(b.yours, 285, ry + 5, { width: 105 })
      doc.fillColor(GRAY).font('Helvetica').fontSize(8).text(b.target, 400, ry + 5, { width: W - 355 })
      doc.moveDown(0.25)
    })

    doc.moveDown(1)

    // ── INPUT DETAILS ────────────────────────────────────
    checkPageBreak(40 + 6 * 24 + 20)
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text('INPUT DETAILS', 50, doc.y)
    doc.rect(50, doc.y + 15, W, 1).fill('#DDDDDD')
    doc.moveDown(0.8)

    const inputs: [string, string][] = [
      ['Monthly Income', inr(data.monthlyIncome)],
      ['Monthly Expenses', inr(data.monthlyExpenses)],
      ['Monthly Savings / SIP', inr(data.monthlySavings)],
      ['Emergency Fund', inr(data.emergencyFund)],
      ['Total Assets', inr(data.totalAssets)],
      ['Life Insurance Cover', inr(data.lifeInsuranceCover)],
      ['Health Insurance Cover', inr(data.healthInsuranceCover)],
      ['Retirement Savings', inr(data.retirementSavings)],
      ['Total Debt', inr(data.totalDebt)],
      ['Monthly EMI', inr(data.monthlyEmi)],
      ['Equity Allocation', `${data.equityPercentage}%`],
    ]
    const half = Math.ceil(inputs.length / 2)
    const colW = W / 2 - 8
    for (let row = 0; row < half; row++) {
      const iy = doc.y
      const left = inputs[row]
      const right = inputs[row + half]
      doc.fillColor('#888').font('Helvetica').fontSize(7.5).text(left[0], 50, iy, { width: colW })
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(left[1], 50, iy + 11, { width: colW })
      if (right) {
        doc.fillColor('#888').font('Helvetica').fontSize(7.5).text(right[0], 50 + colW + 16, iy, { width: colW })
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(right[1], 50 + colW + 16, iy + 11, { width: colW })
      }
      doc.moveDown(1.2)
    }

    // ── FOOTER on last page ──────────────────────────────
    const footerY = doc.page.height - 50
    doc.rect(0, footerY, doc.page.width, 50).fill(DARK)
    doc.fillColor('#666').font('Helvetica').fontSize(7.5)
      .text('Mantra Taxbooks  |  D E M & Associates LLP  |  Expert CA Services  |  Tax  |  Compliance  |  Accounting', 50, footerY + 12, { align: 'center', width: W })
      .text('This report is computer-generated for informational purposes. Consult your CA for personalised financial advice.', 50, footerY + 26, { align: 'center', width: W })

    doc.end()
  })
}
