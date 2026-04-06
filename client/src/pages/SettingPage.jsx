import { useState, useEffect } from 'react'
import { userAPI, settingAPI } from '../services/api'

function SectionTitle({ children, description }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{children}</h3>
      {description && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{description}</p>}
    </div>
  )
}

function UserTab() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: '', password: '', display_name: '' })
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [loading, setLoading] = useState(false)

  const loadUsers = async () => {
    try { setUsers((await userAPI.list()).data) } catch (e) { console.error(e) }
  }

  useEffect(() => { loadUsers() }, [])

  const handleCreate = async () => {
    if (!form.username || !form.password) { alert('아이디와 비밀번호를 입력해주세요.'); return }
    setLoading(true)
    try {
      await userAPI.create(form)
      setForm({ username: '', password: '', display_name: '' })
      await loadUsers()
    } catch (e) { alert(e.response?.data?.detail || '등록 실패') }
    finally { setLoading(false) }
  }

  const handleUpdate = async () => {
    try { await userAPI.update(editTarget.id, editForm); setEditTarget(null); await loadUsers() }
    catch (e) { alert(e.response?.data?.detail || '수정 실패') }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try { await userAPI.delete(id); await loadUsers() }
    catch (e) { alert(e.response?.data?.detail || '삭제 실패') }
  }

  return (
    <div>
      {/* 사용자 등록 폼 */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 24,
        marginBottom: 28,
      }}>
        <SectionTitle description="새 사용자 계정을 생성합니다.">사용자 등록</SectionTitle>
        <div className="user-form-grid">
          <div>
            <label className="label">아이디 *</label>
            <input className="input" type="text" placeholder="아이디" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="label">비밀번호 *</label>
            <input className="input" type="password" placeholder="비밀번호" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">표시명</label>
            <input className="input" type="text" placeholder="표시명 (선택)" value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={loading}
            style={{ height: 44, padding: '0 20px', flexShrink: 0 }}
          >
            {loading ? <span className="spinner" /> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            )}
            등록
          </button>
        </div>
      </div>

      {/* 사용자 목록 */}
      <SectionTitle description="등록된 사용자 목록을 확인하고 관리할 수 있습니다.">사용자 목록</SectionTitle>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>

        {/* 모바일: 카드형 목록 */}
        <div className="mobile-only">
          {users.length === 0 ? (
            <p style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              등록된 사용자가 없습니다.
            </p>
          ) : users.map((u, idx) => (
            <div key={u.id} style={{ padding: '16px', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}>
              {editTarget?.id === u.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{u.username}</p>
                  <input className="input" value={editForm.display_name ?? u.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    placeholder="표시명" />
                  <select className="input" value={editForm.is_active ?? u.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: Number(e.target.value) })}>
                    <option value={1}>활성</option>
                    <option value={0}>비활성</option>
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={handleUpdate} style={{ flex: 1, padding: '10px' }}>저장</button>
                    <button className="btn btn-secondary" onClick={() => setEditTarget(null)} style={{ flex: 1, padding: '10px' }}>취소</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{u.username}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                      {u.display_name || '-'} · {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className={`badge ${u.is_active ? 'badge-green' : 'badge-gray'}`}>
                    {u.is_active ? '활성' : '비활성'}
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-secondary" onClick={() => { setEditTarget(u); setEditForm({}) }}
                      style={{ padding: '6px 12px', fontSize: 13 }}>수정</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(u.id)}
                      style={{ padding: '6px 12px', fontSize: 13 }}>삭제</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 데스크톱: 테이블 */}
        <table className="desktop-only" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['아이디', '표시명', '상태', '등록일', ''].map((h) => (
                <th key={h} style={{
                  padding: '13px 20px', textAlign: 'left',
                  fontSize: 12, fontWeight: 600, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                  등록된 사용자가 없습니다.
                </td>
              </tr>
            ) : users.map((u, idx) => (
              <tr key={u.id} style={{ borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}>
                {editTarget?.id === u.id ? (
                  <>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#64748b' }}>{u.username}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <input className="input" value={editForm.display_name ?? u.display_name}
                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                        style={{ height: 36, fontSize: 13 }} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <select className="input" value={editForm.is_active ?? u.is_active}
                        onChange={(e) => setEditForm({ ...editForm, is_active: Number(e.target.value) })}
                        style={{ height: 36, fontSize: 13 }}>
                        <option value={1}>활성</option>
                        <option value={0}>비활성</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>
                      {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={handleUpdate} style={{ padding: '6px 14px', fontSize: 13 }}>저장</button>
                        <button className="btn btn-secondary" onClick={() => setEditTarget(null)} style={{ padding: '6px 14px', fontSize: 13 }}>취소</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{u.username}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#475569' }}>{u.display_name || '-'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${u.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {u.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>
                      {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => { setEditTarget(u); setEditForm({}) }}
                          style={{ padding: '6px 14px', fontSize: 13 }}
                        >수정</button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(u.id)}
                          style={{ padding: '6px 14px', fontSize: 13 }}
                        >삭제</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UploadSettingTab() {
  const [uploadPath, setUploadPath] = useState('')
  const [previewCount, setPreviewCount] = useState('12')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    settingAPI.list().then((res) => {
      setUploadPath(res.data.upload_path?.value || '')
      setPreviewCount(res.data.preview_count?.value || '12')
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await Promise.all([
        settingAPI.update('upload_path', uploadPath),
        settingAPI.update('preview_count', previewCount),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { alert('저장 실패') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 560, width: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <SectionTitle description="업로드된 파일이 서버에 저장될 실제 경로입니다.">파일 저장 경로</SectionTitle>
        <input
          className="input"
          type="text"
          value={uploadPath}
          onChange={(e) => setUploadPath(e.target.value)}
          placeholder="예) D:/archive/photos"
        />
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
          서버가 실행 중인 환경의 절대 경로를 입력하세요. (예: D:/bigeye_workspace/fileSaveWeb/uploads)
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <SectionTitle description="메인 화면에 표시할 최근 사진 미리보기 개수입니다.">미리보기 개수</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input
            className="input"
            type="number"
            value={previewCount}
            onChange={(e) => setPreviewCount(e.target.value)}
            min={1} max={50}
            style={{ width: 120 }}
          />
          <span style={{ fontSize: 13, color: '#64748b' }}>장</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
          style={{ padding: '11px 28px' }}
        >
          {loading ? <span className="spinner" /> : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          )}
          {loading ? '저장 중...' : '설정 저장'}
        </button>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 14, fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            저장되었습니다
          </div>
        )}
      </div>
    </div>
  )
}

const TABS = [
  {
    key: 'user',
    label: '사용자 관리',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: 'upload',
    label: '업로드 설정',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
]

export default function SettingPage() {
  const [tab, setTab] = useState('user')

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* 탭 헤더 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 8px',
        background: '#fff',
      }}>
        {TABS.map((t) => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '18px 20px',
                border: 'none',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#2563eb' : '#64748b',
                transition: 'all 0.15s',
                marginBottom: -1,
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{t.icon}</span>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* 탭 내용 */}
      <div style={{ padding: 32 }}>
        {tab === 'user' && <UserTab />}
        {tab === 'upload' && <UploadSettingTab />}
      </div>
    </div>
  )
}
