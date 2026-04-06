import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { fileAPI, userAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import { format } from 'date-fns'

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export default function SearchPage() {
  const { token } = useAuthStore()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    upload_start: null, upload_end: null,
    capture_start: null, capture_end: null,
    user_id: '', filename: '',
  })
  const [results, setResults] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    userAPI.list().then((r) => setUsers(r.data)).catch(() => {})
  }, [])

  const toDateStr = (d) => (d ? format(d, 'yyyy-MM-dd') : undefined)

  const handleSearch = async (p = 1) => {
    setLoading(true)
    try {
      const params = {
        upload_start: toDateStr(form.upload_start),
        upload_end: toDateStr(form.upload_end),
        capture_start: toDateStr(form.capture_start),
        capture_end: toDateStr(form.capture_end),
        user_id: form.user_id || undefined,
        filename: form.filename || undefined,
        page: p, per_page: 20,
      }
      const res = await fileAPI.search(params)
      setResults(res.data)
      setPage(p)
    } catch {
      alert('검색 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ upload_start: null, upload_end: null, capture_start: null, capture_end: null, user_id: '', filename: '' })
    setResults(null)
  }

  const totalPages = results ? Math.ceil(results.total / 20) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 검색 필터 카드 */}
      <div className="card" style={{ padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>사진 검색</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>업로드 날짜, 촬영 날짜, 사용자, 파일명으로 검색할 수 있습니다.</p>
        </div>

        <div className="filter-grid">
          {/* 업로드 날짜 */}
          <FilterGroup label="업로드 날짜 (시작)">
            <DatePicker
              selected={form.upload_start}
              onChange={(d) => setForm({ ...form, upload_start: d })}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="input"
              isClearable
            />
          </FilterGroup>
          <FilterGroup label="업로드 날짜 (종료)">
            <DatePicker
              selected={form.upload_end}
              onChange={(d) => setForm({ ...form, upload_end: d })}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="input"
              isClearable
            />
          </FilterGroup>
          <FilterGroup label="사용자">
            <select
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="input"
              style={{ cursor: 'pointer' }}
            >
              <option value="">전체 사용자</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.display_name || u.username}</option>
              ))}
            </select>
          </FilterGroup>
          <FilterGroup label="촬영 날짜 (시작)">
            <DatePicker
              selected={form.capture_start}
              onChange={(d) => setForm({ ...form, capture_start: d })}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="input"
              isClearable
            />
          </FilterGroup>
          <FilterGroup label="촬영 날짜 (종료)">
            <DatePicker
              selected={form.capture_end}
              onChange={(d) => setForm({ ...form, capture_end: d })}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="input"
              isClearable
            />
          </FilterGroup>
          <FilterGroup label="파일명">
            <input
              className="input"
              type="text"
              value={form.filename}
              onChange={(e) => setForm({ ...form, filename: e.target.value })}
              placeholder="파일명 검색"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
            />
          </FilterGroup>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleReset} style={{ padding: '10px 24px' }}>
            초기화
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSearch(1)}
            disabled={loading}
            style={{ padding: '10px 32px', minWidth: 120 }}
          >
            {loading ? <span className="spinner" /> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
      </div>

      {/* 검색 결과 */}
      {results && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>검색 결과</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                총 <strong style={{ color: '#2563eb' }}>{results.total.toLocaleString()}</strong>건
              </p>
            </div>
          </div>

          {results.items.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 500 }}>검색 결과가 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 모바일: 카드 리스트 */}
              <div className="mobile-only">
                {results.items.map((f, idx) => (
                  <div
                    key={f.id}
                    onClick={() => setPreview(f)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                      <img src={`/api/files/${f.id}/preview?token=${token}`} alt={f.original_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.original_name}</p>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{formatSize(f.file_size)} · {formatDate(f.upload_date)}</p>
                      {f.capture_date && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>촬영: {formatDate(f.capture_date)}</p>}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                ))}
              </div>

              {/* 데스크톱: 테이블 */}
              <table className="desktop-only" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['미리보기', '파일명', '크기', '업로드일', '촬영일', '폴더', ''].map((h) => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.items.map((f, idx) => (
                    <tr key={f.id} style={{ borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '14px 20px', width: 60 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9' }}>
                          <img src={`/api/files/${f.id}/preview?token=${token}`} alt={f.original_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none' }} />
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', maxWidth: 240 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.original_name}</p>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>{formatSize(f.file_size)}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(f.upload_date)}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(f.capture_date)}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{f.folder_path}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button className="btn btn-secondary" onClick={() => setPreview(f)} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '16px 20px',
              borderTop: '1px solid #f1f5f9',
            }}>
              <button className="btn btn-secondary" onClick={() => handleSearch(page - 1)} disabled={page === 1} style={{ padding: '8px 18px', fontSize: 13 }}>
                이전
              </button>
              <span style={{ fontSize: 13, color: '#64748b', minWidth: 80, textAlign: 'center' }}>
                {page} / {totalPages}
              </span>
              <button className="btn btn-secondary" onClick={() => handleSearch(page + 1)} disabled={page === totalPages} style={{ padding: '8px 18px', fontSize: 13 }}>
                다음
              </button>
            </div>
          )}
        </div>
      )}

      {/* 미리보기 모달 */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
            }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{preview.original_name}</p>
              <button
                onClick={() => setPreview(null)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, maxHeight: 480 }}>
              <img
                src={`/api/files/${preview.id}/preview?token=${token}`}
                alt={preview.original_name}
                style={{ maxWidth: '100%', maxHeight: 480, objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <a
                href={`/api/files/${preview.id}/download?token=${token}`}
                download
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: 14, borderRadius: 9 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                다운로드
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
