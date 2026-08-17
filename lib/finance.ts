export interface FinancialData {
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  emergencyFund: number
  lifeInsuranceCover: number
  healthInsuranceCover: number
  retirementSavings: number
  totalDebt: number
  monthlyEmi: number
  equityPercentage: number
  totalAssets: number
}

export type PillarStatus = 'CRITICAL' | 'WARNING' | 'RISK' | 'ON_TRACK'

export interface Pillar {
  key: string
  name: string
  icon: string
  score: number
  maxScore: number
  status: PillarStatus
  tags: string[]
}

export interface RedFlag {
  severity: 'CRITICAL' | 'WARNING'
  title: string
  desc: string
  action: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface PriorityAction {
  rank: number
  title: string
  desc: string
  step: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface BenchmarkRow {
  metric: string
  yours: string
  target: string
  status: 'good' | 'warn' | 'critical'
}

export interface HealthReport {
  netWorth: number
  monthlySurplus: number
  savingsRate: number
  healthScore: number
  pillars: Pillar[]
  redFlags: RedFlag[]
  actions: PriorityAction[]
  benchmarks: BenchmarkRow[]
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function pctStatus(pct: number): PillarStatus {
  if (pct < 0.25) return 'CRITICAL'
  if (pct < 0.5) return 'WARNING'
  if (pct < 0.75) return 'RISK'
  return 'ON_TRACK'
}

function inr(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export function computeHealth(d: FinancialData): HealthReport {
  const annualIncome = d.monthlyIncome * 12
  const savingsRate = d.monthlyIncome > 0 ? (d.monthlySavings / d.monthlyIncome) * 100 : 0
  const netWorth = d.totalAssets - d.totalDebt
  const monthlySurplus = d.monthlyIncome - d.monthlyExpenses

  // Protection (20 pts): life cover >= 10x annual income
  const reqLife = annualIncome * 10
  const protPct = reqLife > 0 ? clamp(d.lifeInsuranceCover / reqLife, 0, 1) : (d.monthlyIncome === 0 ? 1 : 0)
  const protScore = Math.round(protPct * 20)
  const protTags: string[] = []
  if (d.lifeInsuranceCover === 0 && d.monthlyIncome > 0) protTags.push('CRITICAL')
  else if (protPct < 0.5 && d.monthlyIncome > 0) protTags.push('RISK')

  // Survival (30 pts): emergency fund >= 6 months expenses
  const reqEmergency = d.monthlyExpenses * 6
  const survPct = reqEmergency > 0 ? clamp(d.emergencyFund / reqEmergency, 0, 1) : 1
  const survScore = Math.round(survPct * 30)

  // Wealth (20 pts): savings rate >= 20%
  const wealthPct = clamp(savingsRate / 20, 0, 1)
  const wealthScore = Math.round(wealthPct * 20)

  // Retirement (10 pts): retirement savings >= 3x annual income
  const reqRetirement = annualIncome * 3
  const retPct = reqRetirement > 0 ? clamp(d.retirementSavings / reqRetirement, 0, 1) : (d.monthlyIncome === 0 ? 1 : 0)
  const retScore = Math.round(retPct * 10)

  // Debt (20 pts): EMI-to-income < 30%; zero EMI = full score
  let debtScore = 20
  if (d.monthlyEmi > 0 && d.monthlyIncome > 0) {
    const ratio = d.monthlyEmi / d.monthlyIncome
    debtScore = Math.round(clamp((1 - ratio / 0.3) * 20, 0, 20))
  }
  const debtPct = debtScore / 20

  const healthScore = protScore + survScore + wealthScore + retScore + debtScore

  const pillars: Pillar[] = [
    { key: 'protection', name: 'Protection', icon: 'fa-shield-alt', score: protScore, maxScore: 20, status: protTags.includes('CRITICAL') ? 'CRITICAL' : pctStatus(protPct), tags: protTags },
    { key: 'survival', name: 'Survival', icon: 'fa-life-ring', score: survScore, maxScore: 30, status: pctStatus(survPct), tags: [] },
    { key: 'wealth', name: 'Wealth', icon: 'fa-chart-line', score: wealthScore, maxScore: 20, status: pctStatus(wealthPct), tags: [] },
    { key: 'retirement', name: 'Retirement', icon: 'fa-umbrella-beach', score: retScore, maxScore: 10, status: pctStatus(retPct), tags: [] },
    { key: 'debt', name: 'Debt', icon: 'fa-credit-card', score: debtScore, maxScore: 20, status: pctStatus(debtPct), tags: [] },
  ]

  const redFlags: RedFlag[] = []
  if (d.monthlyExpenses > 0 && d.emergencyFund < d.monthlyExpenses) {
    redFlags.push({ severity: 'CRITICAL', title: 'No Emergency Fund', desc: 'You have zero liquid savings. One unexpected expense could force debt.', action: `Start with ${inr(Math.round(d.monthlyExpenses * 0.5))}/month in a liquid fund or savings account.`, impact: 'HIGH' })
  } else if (d.monthlyExpenses > 0 && d.emergencyFund < reqEmergency) {
    redFlags.push({ severity: 'WARNING', title: 'Insufficient Emergency Fund', desc: `You have ${(d.emergencyFund / d.monthlyExpenses).toFixed(1)} months saved. Target: 6 months.`, action: `Increase monthly savings by ${inr(Math.round((reqEmergency - d.emergencyFund) / 12))} to reach the target in 1 year.`, impact: 'HIGH' })
  }
  if (d.healthInsuranceCover === 0) {
    redFlags.push({ severity: 'CRITICAL', title: 'No Health Insurance', desc: 'Medical emergency without insurance can wipe out all savings.', action: 'Get a family floater health plan of at least ₹5,00,000 cover immediately.', impact: 'HIGH' })
  } else if (d.healthInsuranceCover < 300000) {
    redFlags.push({ severity: 'WARNING', title: 'Under-Insured for Health', desc: `Cover of ${inr(d.healthInsuranceCover)} is below the recommended ₹5,00,000.`, action: 'Consider a top-up health plan to bridge the gap at low premium.', impact: 'MEDIUM' })
  }
  if (d.monthlyIncome > 0 && d.lifeInsuranceCover < annualIncome * 5) {
    const gap = reqLife - d.lifeInsuranceCover
    const coverX = annualIncome > 0 ? (d.lifeInsuranceCover / annualIncome).toFixed(0) : '0'
    redFlags.push({ severity: 'CRITICAL', title: 'Severely Under-Insured', desc: `Your life cover is ${coverX}x of required. Gap: ${inr(Math.max(0, gap))}.`, action: `Get a term plan online for the gap amount. Compare premiums on PolicyBazaar.`, impact: 'HIGH' })
  }
  if (d.monthlyIncome > 0 && savingsRate < 10) {
    redFlags.push({ severity: 'WARNING', title: 'Very Low Savings Rate', desc: `Savings rate is ${savingsRate.toFixed(1)}%. Target: at least 20%.`, action: 'Automate SIP on salary day. Cut 2–3 discretionary expenses.', impact: 'MEDIUM' })
  }
  if (d.monthlyIncome > 0 && d.monthlyEmi / d.monthlyIncome > 0.4) {
    redFlags.push({ severity: 'WARNING', title: 'High Debt-to-Income Ratio', desc: `EMI is ${((d.monthlyEmi / d.monthlyIncome) * 100).toFixed(0)}% of income. Recommended: below 30%.`, action: 'Focus on prepaying highest-interest debt first. Avoid new loans.', impact: 'MEDIUM' })
  }

  const actions: PriorityAction[] = []
  let rank = 1
  if (d.emergencyFund < reqEmergency && d.monthlyExpenses > 0) {
    const months = reqEmergency > 0 ? (d.emergencyFund / d.monthlyExpenses).toFixed(1) : '0'
    actions.push({ rank: rank++, title: 'Build Emergency Fund', desc: `You have ${months} months of expenses saved. Target: 6 months (${inr(reqEmergency)}).`, step: 'Set up auto-sweep RD/FD for surplus each month until you reach 6 months of expenses.', impact: 'HIGH' })
  }
  if (d.monthlyIncome > 0 && d.lifeInsuranceCover < reqLife) {
    const coverX = annualIncome > 0 ? Math.round(d.lifeInsuranceCover / annualIncome) : 0
    const gap = Math.max(0, reqLife - d.lifeInsuranceCover)
    actions.push({ rank: rank++, title: 'Close Life Insurance Gap', desc: `Your life cover is ${coverX}x of required. Gap: ${inr(gap)}.`, step: 'Get a term plan online for the gap amount. Compare premiums on PolicyBazaar.', impact: 'HIGH' })
  }
  if (d.monthlyIncome > 0 && savingsRate < 20) {
    actions.push({ rank: rank++, title: 'Boost Savings Rate', desc: `Savings rate is ${savingsRate.toFixed(1)}%. Target: at least 20% (${inr(Math.round(d.monthlyIncome * 0.2))}/month).`, step: 'Automate SIP on salary day. Cut 2–3 discretionary expenses.', impact: 'HIGH' })
  }
  if (d.healthInsuranceCover < 500000) {
    actions.push({ rank: rank++, title: 'Increase Health Cover', desc: `Current cover: ${inr(d.healthInsuranceCover)}. Recommended: ₹5,00,000+.`, step: 'Get a super top-up health plan to bridge the gap at low annual premium.', impact: 'MEDIUM' })
  }
  if (d.monthlyIncome > 0 && d.retirementSavings < annualIncome) {
    actions.push({ rank: rank++, title: 'Accelerate Retirement Savings', desc: `Retirement corpus is low. Target: 3× annual income (${inr(reqRetirement)}).`, step: 'Start or increase NPS contribution. Maximise EPF voluntary contribution.', impact: 'MEDIUM' })
  }
  if (d.equityPercentage < 60) {
    actions.push({ rank: rank++, title: 'Increase Equity Exposure', desc: `Only ${d.equityPercentage}% of investments in equity. Recommended: 60%+ for long-term wealth.`, step: 'Review asset allocation. Shift surplus SIPs to equity mutual funds (index/flexi-cap).', impact: 'LOW' })
  }

  const debtRatioPct = d.monthlyIncome > 0 ? (d.monthlyEmi / d.monthlyIncome) * 100 : 0
  const benchmarks: BenchmarkRow[] = [
    { metric: 'Emergency Fund', yours: d.monthlyExpenses > 0 ? `${(d.emergencyFund / d.monthlyExpenses).toFixed(1)} months` : '0 months', target: '6 months', status: survPct >= 1 ? 'good' : survPct >= 0.5 ? 'warn' : 'critical' },
    { metric: 'Savings Rate', yours: `${savingsRate.toFixed(1)}%`, target: '≥ 20%', status: savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'warn' : 'critical' },
    { metric: 'Life Insurance', yours: inr(d.lifeInsuranceCover), target: `10× Annual Income (${inr(reqLife)})`, status: protPct >= 1 ? 'good' : protPct >= 0.5 ? 'warn' : 'critical' },
    { metric: 'Health Insurance', yours: inr(d.healthInsuranceCover), target: '≥ ₹5,00,000', status: d.healthInsuranceCover >= 500000 ? 'good' : d.healthInsuranceCover > 0 ? 'warn' : 'critical' },
    { metric: 'Debt-to-Income Ratio', yours: `${debtRatioPct.toFixed(0)}%`, target: '< 30%', status: debtRatioPct < 30 ? 'good' : debtRatioPct < 40 ? 'warn' : 'critical' },
    { metric: 'Net Worth', yours: inr(netWorth), target: 'Positive & growing', status: netWorth >= 0 ? 'good' : 'critical' },
  ]

  return { netWorth, monthlySurplus, savingsRate, healthScore, pillars, redFlags, actions, benchmarks }
}
