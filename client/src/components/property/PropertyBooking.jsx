import { Calendar, DollarSign, Clock, AlertCircle, Users, Star } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const PropertyBooking = ({ property, reviewsData, userBooking }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)

  const rating = reviewsData && reviewsData.length > 0
    ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
    : (property.rating || 0).toFixed(1)

  const reviewCount = reviewsData ? reviewsData.length : property.reviewCount || 0

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    return nights > 0 ? nights * property.pricePerNight : 0
  }

  const calculateNights = () => {
    if (!startDate || !endDate) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const handleBooking = (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    if (!startDate || !endDate) {
      alert('Будь ласка, оберіть дати')
      return
    }

    if ((adults + children) > (property.maxGuests || 4)) {
      alert(`Максимальна кількість гостей: ${property.maxGuests || 4}`)
      return
    }

    if (calculateTotalPrice() <= 0) {
      alert('Невірні дати')
      return
    }

    alert('Бронювання буде доступне після запуску сервера')
    setShowBookingSuccess(true)

    setTimeout(() => {
      setShowBookingSuccess(false)
      setStartDate('')
      setEndDate('')
      setAdults(1)
      setChildren(0)
    }, 3000)
  }

  if (userBooking) {
    // Show existing booking info
    return (
      <div className="bg-[var(--bg-tertiary)] rounded-lg shadow-md p-6 sticky top-24 border border-[var(--border-color)] animate-slide-in">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Ваше бронювання
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Дата заїзду</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Date(userBooking.startDate).toLocaleDateString('uk-UA')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Дата виїзду</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Date(userBooking.endDate).toLocaleDateString('uk-UA')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Всього</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {userBooking.totalPrice} ₴
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{
                color: userBooking.status === 'confirmed' ? 'var(--success-color)' :
                       userBooking.status === 'cancelled' ? 'var(--error-color)' :
                       'var(--warning-color)'
              }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Статус</p>
                <p className="font-medium" style={{
                  color: userBooking.status === 'confirmed' ? 'var(--success-color)' :
                         userBooking.status === 'cancelled' ? 'var(--error-color)' :
                         'var(--warning-color)'
                }}>
                  {userBooking.status === 'confirmed' ? 'Підтверджено' :
                   userBooking.status === 'cancelled' ? 'Скасовано' :
                   'Очікує підтвердження'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {userBooking.status === 'pending' && (
          <div className="mb-6">
            <button
              onClick={() => {
                const reason = prompt('Вкажіть причину скасування (необов\'язково):')
                if (reason !== null) {
                  // TODO: Implement cancel booking
                  alert('Функція скасування буде реалізована після підключення сервера')
                }
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Скасувати бронювання
            </button>
          </div>
        )}

        <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-color)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Потрібна допомога?</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Зв'яжіться з власником для будь-яких питань
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show booking form
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-lg shadow-md p-6 sticky top-24 border border-[var(--border-color)] animate-slide-in">
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl text-gray-900">{property.pricePerNight} ₴</span>
          <span className="text-gray-600">за ніч</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{rating} ({reviewCount} відгуків)</span>
        </div>
      </div>

      {showBookingSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-center">
            ✓ Запит на бронювання надіслано!
          </p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Дата заїзду
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Дата виїзду
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            <Users className="inline w-4 h-4 mr-1" />
            Дорослі
          </label>
          <select
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            {[...Array((property.maxGuests || 4) - children + 1)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            <Users className="inline w-4 h-4 mr-1" />
            Діти
          </label>
          <select
            value={children}
            onChange={(e) => setChildren(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            {[...Array(Math.max(0, (property.maxGuests || 4) - adults + 1))].map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {user ? (
        <>
          {(adults + children) > (property.maxGuests || 4) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Перевищено максимальну кількість гостей ({property.maxGuests || 4})
              </p>
            </div>
          )}

          {calculateTotalPrice() > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2 text-gray-700">
                <span>{property.pricePerNight} ₴ × {calculateNights()} {calculateNights() === 1 ? 'ніч' : calculateNights() < 5 ? 'ночі' : 'ночей'}</span>
                <span>{calculateTotalPrice()} ₴</span>
              </div>
              <div className="pt-2 border-t border-gray-300 flex justify-between text-lg">
                <span className="text-gray-900">Всього</span>
                <span className="text-gray-900">{calculateTotalPrice()} ₴</span>
              </div>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={(adults + children) > (property.maxGuests || 4)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Забронювати
          </button>
        </>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Увійдіть, щоб забронювати
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Увійти
          </button>
        </div>
      )}

      <p className="text-sm text-gray-600 text-center mt-4">
        Ви поки не будете списані
      </p>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-900 mb-1">Безкоштовне скасування</p>
            <p className="text-sm text-gray-600">
              Повернення коштів за 48 годин до заїзду
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Господар</p>
        <p className="text-gray-900">{property.ownerName || 'Невідомий господар'}</p>
      </div>
    </div>
  )
}

export default PropertyBooking
