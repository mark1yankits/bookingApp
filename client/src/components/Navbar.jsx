import { Link, useNavigate } from 'react-router-dom'
import { Home, User, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-[var(--bg-tertiary)] shadow-theme-md border-b border-[var(--border-color)] theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 hover-lift px-3 py-2 rounded-lg transition-all duration-200">
              <Home className="h-6 w-6" style={{ color: 'var(--accent-color)' }} />
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Платформа оренди житла
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 hover-lift"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <User className="h-5 w-5" />
                  <span>Панель управління</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 hover-lift"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Вийти</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 hover-lift"
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogIn className="h-5 w-5" />
                <span>Увійти</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

