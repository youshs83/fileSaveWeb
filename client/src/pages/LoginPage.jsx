import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.login(form)
      setAuth(res.data.user, res.data.access_token)
      navigate('/main')
    } catch (err) {
      setError(err.response?.data?.detail || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fdf2f8 100%)',
    }}>
      {/* 왼쪽 배경 패널 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
      }}
        className="hidden-mobile"
      >
        <div style={{ textAlign: 'center', color: '#fff', maxWidth: 380 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            backdropFilter: 'blur(10px)',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Phone Archive
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
            폰의 소중한 사진을 PC에 안전하게 보관하고,<br/>
            언제 어디서나 쉽게 찾아보세요.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48 }}>
            {['보관', '검색', '다운로드'].map((t) => (
              <div key={t} style={{
                padding: '10px 20px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.12)',
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
              }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        background: '#fff',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* 모바일 로고 */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Phone Archive</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 24, marginBottom: 6 }}>
              로그인
            </h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>계정 정보를 입력해 주세요.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label className="label">아이디</label>
              <input
                className="input"
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="아이디를 입력하세요"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label">비밀번호</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: 14,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: 48, fontSize: 15, borderRadius: 10 }}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            기본 계정: admin / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
