import PDFDocument from 'pdfkit'

interface InvoiceItem {
  description: string
  qty: number
  rate: number
  amount: number
}

interface InvoiceData {
  invoiceNo: string
  type: 'PROFORMA' | 'TAX'
  date: Date
  dueDate?: Date | null
  paidAt?: Date | null
  client: { name: string; email: string; phone?: string | null; company?: string | null; gstNumber?: string | null; cinNumber?: string | null; address?: string | null; city?: string | null; state?: string | null; pincode?: string | null }
  items: InvoiceItem[]
  subtotal: number
  gstRate: number
  gstAmount: number
  total: number
  notes?: string | null
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const RED = '#C41E3A'
    const DARK = '#1A1A1A'
    const GRAY = '#666666'
    const LIGHT = '#f5f5f5'

    // Header bar
    doc.rect(0, 0, doc.page.width, 80).fill(DARK)

    doc.fillColor('#C0C0C0').font('Helvetica-Bold').fontSize(16).text('MANTRA', 50, 28, { continued: true })
    doc.fillColor('#E8E8E8').text(' TAXBOOKS', { continued: false })
    doc.fillColor('#A0A0A0').font('Helvetica').fontSize(9).text('Expert CA Services | Tax | Compliance | Accounting', 50, 52)

    // Invoice label
    const label = data.type === 'PROFORMA' ? 'PROFORMA INVOICE' : 'TAX INVOICE'
    doc.fillColor(RED).font('Helvetica-Bold').fontSize(18).text(label, 350, 25, { align: 'right', width: 195 })
    doc.fillColor('#A0A0A0').font('Helvetica').fontSize(9).text(`#${data.invoiceNo}`, 350, 50, { align: 'right', width: 195 })

    // Info block
    doc.moveDown(3)
    const infoY = 110

    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text('BILLED TO', 50, infoY)
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11).text(data.client.name, 50, infoY + 16)
    let clientY = infoY + 30
    if (data.client.company) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(data.client.company, 50, clientY); clientY += 13
    }
    if (data.client.gstNumber) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(`GSTIN: ${data.client.gstNumber}`, 50, clientY); clientY += 13
    }
    if (data.client.cinNumber) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(`CIN: ${data.client.cinNumber}`, 50, clientY); clientY += 13
    }
    if (data.client.address) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(data.client.address, 50, clientY, { width: 230 }); clientY += 13
    }
    const cityLine = [data.client.city, data.client.state, data.client.pincode].filter(Boolean).join(', ')
    if (cityLine) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(cityLine, 50, clientY); clientY += 13
    }
    doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(data.client.email, 50, clientY); clientY += 13
    if (data.client.phone) { doc.text(data.client.phone, 50, clientY) }

    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text('INVOICE DETAILS', 350, infoY, { width: 195 })
    doc.fillColor(GRAY).font('Helvetica').fontSize(9)
    const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    doc.text(`Date: ${fmt(data.date)}`, 350, infoY + 16, { width: 195 })
    if (data.dueDate) doc.text(`Due Date: ${fmt(data.dueDate)}`, 350, infoY + 30, { width: 195 })
    if (data.paidAt) {
      doc.fillColor('#27AE60').text(`Paid: ${fmt(data.paidAt)}`, 350, infoY + 44, { width: 195 })
    }

    // Status badge
    if (data.type === 'TAX') {
      doc.rect(350, infoY + 58, 70, 18).fill('#d4edda')
      doc.fillColor('#155724').font('Helvetica-Bold').fontSize(8).text('PAID', 350, infoY + 63, { width: 70, align: 'center' })
    }

    // Table
    const tableY = 220
    const colWidths = [220, 60, 80, 80]
    const colX = [50, 270, 330, 410]
    const headers = ['Description', 'Qty', 'Rate (₹)', 'Amount (₹)']

    // Table header
    doc.rect(50, tableY, 495, 24).fill(DARK)
    headers.forEach((h, i) => {
      doc.fillColor('#E8E8E8').font('Helvetica-Bold').fontSize(9).text(h, colX[i], tableY + 8, { width: colWidths[i] })
    })

    // Table rows
    let rowY = tableY + 24
    data.items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f9f9f9'
      doc.rect(50, rowY, 495, 22).fill(bg)
      doc.fillColor(DARK).font('Helvetica').fontSize(9)
      doc.text(item.description, colX[0], rowY + 7, { width: colWidths[0] })
      doc.text(String(item.qty), colX[1], rowY + 7, { width: colWidths[1] })
      doc.text(item.rate.toLocaleString('en-IN'), colX[2], rowY + 7, { width: colWidths[2] })
      doc.text(item.amount.toLocaleString('en-IN'), colX[3], rowY + 7, { width: colWidths[3] })
      rowY += 22
    })

    // Totals
    rowY += 10
    const totalX = 330
    const totalW = 215
    const addRow = (label: string, value: string, bold = false, color = DARK) => {
      doc.fillColor(color).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9)
      doc.text(label, totalX, rowY, { width: 100 })
      doc.text(value, totalX + 100, rowY, { width: 115, align: 'right' })
      rowY += 16
    }

    addRow('Subtotal', `₹${data.subtotal.toLocaleString('en-IN')}`)
    addRow(`GST (${data.gstRate}%)`, `₹${data.gstAmount.toLocaleString('en-IN')}`)
    doc.rect(totalX, rowY - 2, totalW, 1).fill('#ddd')
    rowY += 4
    doc.rect(totalX, rowY, totalW, 26).fill(DARK)
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(11)
    doc.text('TOTAL', totalX + 8, rowY + 7, { width: 100 })
    doc.text(`₹${data.total.toLocaleString('en-IN')}`, totalX + 100, rowY + 7, { width: 107, align: 'right' })
    rowY += 26

    // Notes
    if (data.notes) {
      rowY += 20
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text('Notes:', 50, rowY)
      doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(data.notes, 50, rowY + 14, { width: 495 })
    }

    // Footer
    const footerY = doc.page.height - 60
    doc.rect(0, footerY, doc.page.width, 60).fill(DARK)
    doc.fillColor('#666').font('Helvetica').fontSize(8)
      .text('Mantra Taxbooks | Expert CA Services | Tax | Compliance | Accounting', 50, footerY + 15, { align: 'center', width: 495 })
      .text('This is a computer-generated document. No signature required.', 50, footerY + 30, { align: 'center', width: 495 })

    doc.end()
  })
}
