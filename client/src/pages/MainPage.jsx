import { useState, useEffect, useRef, useCallback } from 'react'
import { fileAPI } from '../services/api'
import useAuthStore from '../store/authStore'

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function PhotoCard({ file, token, onClick }) {
  return (
    <div
      onClick={() => onClick(file)}
      style={{
        cursor: 'pointer',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#f1f5f9',
        aspectRatio: '1 / 1',
        position: 'relative',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgb(0 0 0 / 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <img
        src={`/api/files/${file.id}/preview?token=${token}`}
        alt={file.original_name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.parentElement.style.display = 'flex'
          e.target.parentElement.style.alignItems = 'center'
          e.target.parentElement.style.justifyContent = 'center'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px 10px 8px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
        color: '#fff',
        fontSize: 11,
        fontWeight: 500,
      }}>
        {formatDate(file.upload_date)}
      </div>
    </div>
  )
}

function PreviewModal({ file, token, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!file) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{file.original_name}</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              {formatSize(file.file_size)}
              {file.width && ` · ${file.width}×${file.height}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#f8fafc',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 이미지 */}
        <div style={{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, maxHeight: 520 }}>
          <img
            src={`/api/files/${file.id}/preview?token=${token}`}
            alt={file.original_name}
            style={{ maxWidth: '100%', maxHeight: 520, objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* 메타 + 다운로드 */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <MetaItem label="업로드일" value={formatDate(file.upload_date)} />
            {file.capture_date && <MetaItem label="촬영일" value={formatDate(file.capture_date)} />}
            <MetaItem label="폴더" value={file.folder_path || '/'} />
          </div>
          <a
            href={`/api/files/${file.id}/download?token=${token}`}
            download
            className="btn btn-primary"
            style={{ flexShrink: 0, padding: '10px 20px', fontSize: 14, borderRadius: 9 }}
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
  )
}

function MetaItem({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{value}</p>
    </div>
  )
}

function UploadSection({ fileInputRef, uploading, uploadProgress, dragOver, setDragOver, handleUpload, handleDrop }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>파일 업로드</h3>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleUpload(e.target.files)}
      />
      <div
        onClick={() => !uploading && fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#2563eb' : '#cbd5e1'}`,
          borderRadius: 12,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: dragOver ? '#eff6ff' : '#f8fafc',
          transition: 'all 0.15s',
        }}
      >
        {uploading ? (
          <div>
            <div style={{
              width: 40, height: 40,
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              margin: '0 auto 12px',
            }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#2563eb', marginBottom: 6 }}>
              업로드 중... {uploadProgress}%
            </p>
            <div style={{
              height: 4, background: '#e2e8f0', borderRadius: 4,
              overflow: 'hidden', marginTop: 8,
            }}>
              <div style={{
                height: '100%',
                width: `${uploadProgress}%`,
                background: '#2563eb',
                borderRadius: 4,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        ) : (
          <>
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
              클릭하거나 파일을 드래그하세요
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              JPG, PNG, HEIC 등 이미지 파일 지원
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function MainPage() {
  const { token } = useAuthStore()
  const [recentFiles, setRecentFiles] = useState([])
  const [fileList, setFileList] = useState({ items: [], total: 0 })
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const loadRecent = useCallback(async () => {
    try {
      const res = await fileAPI.recent()
      setRecentFiles(res.data)
    } catch (e) { console.error(e) }
  }, [])

  const loadFiles = useCallback(async (p = 1) => {
    try {
      const res = await fileAPI.list({ page: p, per_page: 15 })
      setFileList(res.data)
      setPage(p)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    loadRecent()
    loadFiles()
  }, [loadRecent, loadFiles])

  const handleUpload = async (files) => {
    if (!files || !files.length) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const arr = Array.from(files)
      for (let i = 0; i < arr.length; i++) {
        const fd = new FormData()
        fd.append('file', arr[i])
        fd.append('folder_path', '/')
        await fileAPI.upload(fd)
        setUploadProgress(Math.round(((i + 1) / arr.length) * 100))
      }
      await loadRecent()
      await loadFiles(1)
    } catch (err) {
      alert('업로드 실패: ' + (err.response?.data?.detail || err.message))
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const totalPages = Math.ceil(fileList.total / 15)

  return (
    <>
      <div className="page-grid">

        {/* ── 왼쪽: 최근 사진 갤러리 ── */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>최근 사진</h2>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>최근 업로드된 사진 미리보기</p>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600,
              background: '#eff6ff', color: '#2563eb',
              padding: '4px 12px', borderRadius: 20,
            }}>
              {recentFiles.length}장
            </span>
          </div>

          {recentFiles.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              color: '#94a3b8',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 500 }}>사진이 없습니다</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>업로드 버튼으로 사진을 추가하세요</p>
            </div>
          ) : (
            <div className="photo-grid">
              {recentFiles.map((f) => (
                <PhotoCard key={f.id} file={f} token={token} onClick={setPreview} />
              ))}
            </div>
          )}
        </div>

        {/* ── 오른쪽: 업로드 + 파일 목록 ── */}
        {/* 모바일에서는 CSS order로 갤러리 위에 배치 */}
        <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <UploadSection
            fileInputRef={fileInputRef}
            uploading={uploading}
            uploadProgress={uploadProgress}
            dragOver={dragOver}
            setDragOver={setDragOver}
            handleUpload={handleUpload}
            handleDrop={handleDrop}
          />

          {/* 파일 목록 */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>전체 파일</h3>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                총 {fileList.total.toLocaleString()}개
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {fileList.items.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: '24px 0' }}>
                  파일이 없습니다.
                </p>
              ) : (
                fileList.items.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setPreview(f)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      flexShrink: 0,
                    }}>
                      <img
                        src={`/api/files/${f.id}/preview?token=${token}`}
                        alt={f.original_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 500,
                        color: '#1e293b',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {f.original_name}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {formatSize(f.file_size)} · {formatDate(f.upload_date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid #f1f5f9',
              }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => loadFiles(page - 1)}
                  disabled={page === 1}
                  style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}
                >
                  이전
                </button>
                <span style={{ fontSize: 13, color: '#64748b', minWidth: 60, textAlign: 'center' }}>
                  {page} / {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => loadFiles(page + 1)}
                  disabled={page === totalPages}
                  style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PreviewModal file={preview} token={token} onClose={() => setPreview(null)} />
    </>
  )
}
