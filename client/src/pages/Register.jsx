import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('guest')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Паролі не співпадають')
      return
    }

    if (password.length < 6) {
      setError('Пароль повинен містити мінімум 6 символів')
      return
    }

    // Name and phone are optional for backward compatibility, but we'll require them for new registrations
    if (!name.trim()) {
      setError('Ім\'я обов\'язкове')
      return
    }

    if (!phone.trim()) {
      setError('Номер телефону обов\'язковий')
      return
    }

    setLoading(true)

    try {
      await register(email, password, role, name, phone)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Помилка реєстрації. Спробуйте ще раз.'
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
            <UserPlus className="h-12 w-12 animate-bounce-gentle" style={{ color: 'var(--accent-color)' }} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Створити акаунт
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
              <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Ім'я
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-primary"
                placeholder="Ваше ім'я"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Номер телефону
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-primary"
                placeholder="+380XXXXXXXXX"
              />
            </div>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-primary"
                placeholder="Мінімум 6 символів"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Підтвердити пароль
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-primary"
                placeholder="Повторіть пароль"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Роль
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-primary"
              >
                <option value="guest">Гість</option>
                <option value="host">Власник</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-5 h-5" />
              {loading ? 'Реєстрація...' : 'Зареєструватися'}
            </button>
          </div>

          <div className="text-center pt-4">
            <span style={{ color: 'var(--text-secondary)' }}>Вже є акаунт? </span>
            <Link
              to="/login"
              className="font-medium transition-colors duration-200"
              style={{ color: 'var(--accent-color)' }}
            >
              Увійти
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

