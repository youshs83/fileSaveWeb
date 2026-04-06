import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
