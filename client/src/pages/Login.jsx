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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 theme-transition" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <LogIn className="h-12 w-12 animate-bounce-gentle" style={{ color: 'var(--accent-color)' }} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Увійти в акаунт
          </h2>
        </div>
        <form className="mt-8 space-y-6 card p-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email адреса
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-primary"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
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
                className="input-primary"
                placeholder="Введіть пароль"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </div>

          <div className="text-center pt-4">
            <span style={{ color: 'var(--text-secondary)' }}>Немає акаунта? </span>
            <Link
              to="/register"
              className="font-medium transition-colors duration-200"
              style={{ color: 'var(--accent-color)' }}
            >
              Зареєструватися
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

