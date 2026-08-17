'use client'
import { useEffect, useRef, useState } from 'react'
import { formatDate, formatFileSize } from '@/lib/utils'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

const statusColors: Record<string, string> = {
  PENDING: 'b-pending', UNDER_REVIEW: 'b-under_review', REVIEWED: 'b-reviewed', REJECTED: 'b-rejected',
}

export default function ClientDocuments() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = () => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(d => { setDocs(d.documents || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDocs() }, [])

  const uploadFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('File type not allowed. Use PDF, JPG, PNG, DOCX, or XLSX.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    setUploadProgress(`Preparing upload for ${file.name}...`)

    try {
      const metaRes = await fetch('/api/documents/presigned-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
      })

      if (!metaRes.ok) {
        const err = await metaRes.json()
        throw new Error(err.error || 'Failed to get upload URL')
      }

      const { uploadUrl, s3Key, documentId } = await metaRes.json()

      setUploadProgress(`Uploading ${file.name} securely to S3...`)
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!s3Res.ok) throw new Error('Upload to S3 failed')

      setUploadProgress('Confirming upload...')
      await fetch(`/api/documents/${documentId}/confirm`, { method: 'POST' })

      setSuccess(`${file.name} uploaded successfully!`)
      setUploadProgress('')
      fetchDocs()
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
      setUploadProgress('')
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(uploadFile)
  }

  const downloadDoc = async (docId: string, filename: string) => {
    const res = await fetch(`/api/documents/${docId}/download`)
    if (res.ok) {
      const { url } = await res.json()
      window.open(url, '_blank')
    }
  }

  const deleteDoc = async (docId: string) => {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
    fetchDocs()
  }

  return (
    <>
      <div className="pg-title">My Documents</div>
      <div className="pg-sub">Upload documents for your CA to review. All files are encrypted and stored securely.</div>

      {error && <div className="alert alert-err"><i className="fas fa-exclamation-circle" /> {error}</div>}
      {success && <div className="alert alert-ok"><i className="fas fa-check-circle" /> {success}</div>}

      {/* Upload zone */}
      <div className="card">
        <div className="card-header"><h3>Upload Documents</h3></div>
        <div className="card-body">
          <div
            className={`upload-zone${dragging ? ' drag-over' : ''}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          >
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: 'var(--red)', display: 'block', marginBottom: 10 }} />
            {uploading ? (
              <p style={{ fontSize: '.85rem', color: '#666' }}><i className="fas fa-spinner fa-spin" /> {uploadProgress}</p>
            ) : (
              <p style={{ fontSize: '.85rem', color: '#666' }}>
                Click to browse or <strong style={{ color: 'var(--red)' }}>drag & drop</strong> files here<br />
                <span style={{ fontSize: '.75rem', color: '#aaa' }}>PDF, JPG, PNG, DOCX, XLSX — max 10 MB each</span>
              </p>
            )}
          </div>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx" onChange={e => handleFiles(e.target.files)} />

          <div className="alert alert-info" style={{ marginTop: 8 }}>
            <i className="fas fa-shield-alt" /> Files are encrypted at rest (AES-256) and transmitted over HTTPS. Only your CA can access them.
          </div>
        </div>
      </div>

      {/* Documents list */}
      <div className="card">
        <div className="card-header"><h3>Uploaded Documents ({docs.length})</h3></div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin" /></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>File Name</th><th>Size</th><th>Status</th><th>Review Notes</th><th>Uploaded</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {docs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No documents uploaded yet.</td></tr>
                ) : docs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fas fa-file-alt" style={{ color: 'var(--red)', fontSize: '1rem' }} />
                        <span style={{ fontWeight: 500 }}>{doc.filename}</span>
                      </div>
                    </td>
                    <td>{formatFileSize(doc.size)}</td>
                    <td><span className={`badge ${statusColors[doc.status] || 'b-pending'}`}>{doc.status.replace('_', ' ')}</span></td>
                    <td style={{ maxWidth: 200, fontSize: '.8rem', color: '#666' }}>{doc.reviewNotes || '—'}</td>
                    <td>{formatDate(doc.createdAt)}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => downloadDoc(doc.id, doc.filename)}>
                        <i className="fas fa-download" />
                      </button>
                      {doc.status === 'PENDING' && (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteDoc(doc.id)}>
                          <i className="fas fa-trash" />
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
    </>
  )
}
