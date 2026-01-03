import { Link, useNavigate } from 'react-router-dom'
import { Home, User, LogOut, LogIn, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-[var(--bg-tertiary)] shadow-md border-b border-[var(--border-color)] animate-slide-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 hover-lift rounded-lg px-3 py-2 transition-colors duration-200"
            >
              <Home className="h-6 w-6" style={{ color: 'var(--accent-color)' }} />
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Платформа оренди житла
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover-lift focus-ring transition-all duration-300"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              aria-label={`Перемкнути на ${theme === 'light' ? 'темну' : 'світлу'} тему`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 animate-scale-in" />
              ) : (
                <Sun className="h-5 w-5 animate-scale-in" />
              )}
            </button>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover-lift focus-ring transition-colors duration-200"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  <User className="h-5 w-5" />
                  <span>Панель управління</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover-lift focus-ring transition-colors duration-200"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--error-color)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Вийти</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover-lift focus-ring transition-colors duration-200"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
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

