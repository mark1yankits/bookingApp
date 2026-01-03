import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Помилка входу. Перевірте дані.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="animate-scale-in">
          <div className="flex justify-center">
            <LogIn className="h-12 w-12" style={{ color: 'var(--accent-color)' }} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Увійти в акаунт
          </h2>
        </div>
        <form className="mt-8 space-y-6 animate-slide-in" onSubmit={handleSubmit}>
          {error && (
            <div className="px-4 py-3 rounded border" style={{ backgroundColor: 'var(--error-color)20', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email адреса"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 hover-lift transition-all duration-300"
              style={{ backgroundColor: 'var(--accent-color)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}
            >
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </div>

          <div className="text-center">
            <span style={{ color: 'var(--text-secondary)' }}>Немає акаунта? </span>
            <Link
              to="/register"
              className="font-medium hover-lift transition-colors duration-200"
              style={{ color: 'var(--accent-color)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--accent-color)'}
            >
              Зареєструватися
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

