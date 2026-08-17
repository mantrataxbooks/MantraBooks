'use client'
import { useEffect, useState } from 'react'
import { formatDate, formatFileSize } from '@/lib/utils'

export default function AdminDocuments() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [reviewModal, setReviewModal] = useState<any | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')

  const fetchDocs = () => {
    fetch(`/api/documents?all=true&status=${filter}`)
      .then(r => r.json())
      .then(d => { setDocs(d.documents || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDocs() }, [filter])

  const downloadDoc = async (docId: string, filename: string) => {
    const res = await fetch(`/api/documents/${docId}/download`)
    if (res.ok) {
      const { url } = await res.json()
      window.open(url, '_blank')
    }
  }

  const updateStatus = async (docId: string, status: string, notes: string) => {
    setReviewing(docId)
    await fetch(`/api/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNotes: notes }),
    })
    setReviewing(null)
    setReviewModal(null)
    setReviewNotes('')
    fetchDocs()
  }

  const statusColors: Record<string, string> = { PENDING: 'b-pending', UNDER_REVIEW: 'b-under_review', REVIEWED: 'b-reviewed', REJECTED: 'b-rejected' }

  return (
    <>
      <div className="pg-title">Document Review</div>
      <div className="pg-sub">Review and manage all client uploaded documents.</div>

      <div className="card">
        <div className="card-header">
          <h3>All Documents ({docs.length})</h3>
          <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>File</th><th>Client</th><th>Size</th><th>Status</th><th>Review Notes</th><th>Uploaded</th><th>Actions</th></tr></thead>
              <tbody>
                {docs.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No documents found.</td></tr>
                  : docs.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fas fa-file-alt" style={{ color: 'var(--red)' }} />
                          <span style={{ fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{doc.filename}</span>
                        </div>
                      </td>
                      <td>{doc.client?.name}</td>
                      <td>{formatFileSize(doc.size)}</td>
                      <td><span className={`badge ${statusColors[doc.status]}`}>{doc.status.replace('_', ' ')}</span></td>
                      <td style={{ maxWidth: 160, fontSize: '.8rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.reviewNotes || '—'}</td>
                      <td>{formatDate(doc.createdAt)}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => downloadDoc(doc.id, doc.filename)} title="Download">
                          <i className="fas fa-download" />
                        </button>
                        {doc.status !== 'REVIEWED' && doc.status !== 'REJECTED' && (
                          <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal(doc); setReviewNotes(doc.reviewNotes || '') }}>
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewModal && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setReviewModal(null)}><i className="fas fa-times" /></button>
            <h3>Review Document</h3>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: '.85rem' }}>
              <strong>{reviewModal.filename}</strong><br />
              <span style={{ color: '#666' }}>{reviewModal.client?.name} · {formatFileSize(reviewModal.size)}</span>
            </div>
            <button className="btn btn-secondary btn-block" style={{ marginBottom: 12 }} onClick={() => downloadDoc(reviewModal.id, reviewModal.filename)}>
              <i className="fas fa-download" /> Download to Review
            </button>
            <div className="form-group">
              <label>Review Notes</label>
              <textarea className="form-control" rows={3} placeholder="Add notes for the client..." value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success" onClick={() => updateStatus(reviewModal.id, 'REVIEWED', reviewNotes)} disabled={reviewing === reviewModal.id}>
                <i className="fas fa-check" /> Approve
              </button>
              <button className="btn btn-danger" onClick={() => updateStatus(reviewModal.id, 'REJECTED', reviewNotes)} disabled={reviewing === reviewModal.id}>
                <i className="fas fa-times" /> Reject
              </button>
              <button className="btn btn-secondary" onClick={() => updateStatus(reviewModal.id, 'UNDER_REVIEW', reviewNotes)} disabled={reviewing === reviewModal.id}>
                Under Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
