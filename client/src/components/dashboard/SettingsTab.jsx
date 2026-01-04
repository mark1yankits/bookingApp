import { Settings, Mail, Lock, User, Save, Sun, Moon, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

const SettingsTab = ({ user, onUpdateProfile }) => {
  const { theme, toggleTheme, resetToSystemTheme, isUserPreference } = useTheme()
  const [settingsForm, setSettingsForm] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      setSettingsForm(prev => ({ ...prev, email: user.email }))
    }
  }, [user?.email])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate email
    if (settingsForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsForm.email)) {
      alert('Будь ласка, введіть коректну email адресу')
      return
    }

    // Validate password change
    if (settingsForm.newPassword) {
      if (settingsForm.newPassword.length < 6) {
        alert('Новий пароль повинен містити мінімум 6 символів')
        return
      }
      if (settingsForm.newPassword !== settingsForm.confirmPassword) {
        alert('Новий пароль та підтвердження не співпадають')
        return
      }
      if (!settingsForm.currentPassword) {
        alert('Будь ласка, введіть поточний пароль')
        return
      }
    }

    // Prepare update data
    const updateData = {}

    if (settingsForm.email !== user?.email) {
      updateData.email = settingsForm.email
    }

    if (settingsForm.newPassword) {
      updateData.currentPassword = settingsForm.currentPassword
      updateData.newPassword = settingsForm.newPassword
    }

    if (Object.keys(updateData).length === 0) {
      alert('Немає змін для збереження')
      return
    }

    onUpdateProfile(updateData)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Settings className="w-6 h-6" />
        Налаштування профілю
      </h2>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Settings */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 border border-[var(--border-color)]">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Mail className="w-5 h-5" />
              Email адреса
            </h3>

            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                💡 <strong>Порада:</strong> Зміна email адреси потребує підтвердження.
                Залиште поле порожнім, якщо не хочете змінювати email.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm" style={{ color: 'var(--text-secondary)' }}>
                Поточний email: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.email}</span>
              </label>
              <input
                type="email"
                value={settingsForm.email}
                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                placeholder="Новий email"
              />
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 border border-[var(--border-color)]">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Lock className="w-5 h-5" />
              Зміна пароля
            </h3>

            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                💡 <strong>Порада:</strong> Пароль повинен містити мінімум 6 символів.
                Залиште поля порожніми, якщо не хочете змінювати пароль.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Поточний пароль <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={settingsForm.currentPassword}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                  placeholder="Введіть поточний пароль"
                  required={!!settingsForm.newPassword}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Новий пароль <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={settingsForm.newPassword}
                  onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                  placeholder="Введіть новий пароль (мін. 6 символів)"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Підтвердіть новий пароль <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={settingsForm.confirmPassword}
                  onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                  placeholder="Повторіть новий пароль"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 border border-[var(--border-color)]">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              Зовнішній вигляд
            </h3>

            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                💡 <strong>Порада:</strong> Виберіть тему, яка вам подобається більше.
                Зміни застосовуються негайно.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="light-theme"
                      name="theme"
                      checked={theme === 'light' && isUserPreference}
                      onChange={() => theme !== 'light' && toggleTheme()}
                      className="w-4 h-4"
                    />
                    <label htmlFor="light-theme" className="flex items-center gap-2 cursor-pointer">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span style={{ color: 'var(--text-primary)' }}>Світла</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="dark-theme"
                      name="theme"
                      checked={theme === 'dark' && isUserPreference}
                      onChange={() => theme !== 'dark' && toggleTheme()}
                      className="w-4 h-4"
                    />
                    <label htmlFor="dark-theme" className="flex items-center gap-2 cursor-pointer">
                      <Moon className="w-4 h-4 text-blue-400" />
                      <span style={{ color: 'var(--text-primary)' }}>Темна</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="system-theme"
                      name="theme"
                      checked={!isUserPreference}
                      onChange={() => !isUserPreference && resetToSystemTheme()}
                      className="w-4 h-4"
                    />
                    <label htmlFor="system-theme" className="flex items-center gap-2 cursor-pointer">
                      <Monitor className="w-4 h-4 text-gray-500" />
                      <span style={{ color: 'var(--text-primary)' }}>Системна</span>
                    </label>
                  </div>
                </div>

                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Поточна: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {isUserPreference
                      ? (theme === 'light' ? 'Світла' : 'Темна')
                      : 'Системна'
                    }
                  </span>
                </div>
              </div>

              {isUserPreference && (
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    onClick={resetToSystemTheme}
                    className="text-sm px-3 py-1 rounded-md transition-colors"
                    style={{
                      color: 'var(--accent-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    Скинути до системної теми
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 border border-[var(--border-color)]">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <User className="w-5 h-5" />
              Інформація про акаунт
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Роль:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user?.role === 'admin' ? 'Адміністратор' : user?.role === 'host' ? 'Власник' : 'Гість'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Дата реєстрації:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('uk-UA') : 'Невідомо'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setSettingsForm({
                email: user?.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              })}
              className="px-6 py-3 border rounded-lg transition-colors duration-200"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Скасувати зміни
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg transition-all duration-300 hover-lift flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
            >
              <Save className="w-5 h-5" />
              Зберегти зміни
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SettingsTab
