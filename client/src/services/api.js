import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 요청 인터셉터: JWT 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터: 401 시 로그인 페이지 이동
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// Files
export const fileAPI = {
  list: (params) => api.get('/files', { params }),
  recent: () => api.get('/files/recent'),
  search: (params) => api.get('/files/search', { params }),
  folders: () => api.get('/files/folders'),
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  preview: (id) => `/api/files/${id}/preview`,
  download: (id) => `/api/files/${id}/download`,
  move: (id, newFolder) => api.put(`/files/${id}/move`, { new_folder: newFolder }),
  delete: (id) => api.delete(`/files/${id}`),
}

// Users
export const userAPI = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

// Settings
export const settingAPI = {
  list: () => api.get('/settings'),
  update: (key, value) => api.put(`/settings/${key}`, { setting_value: value }),
}
