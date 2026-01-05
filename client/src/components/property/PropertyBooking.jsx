import { Calendar, DollarSign, Clock, AlertCircle, Users, Star, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'

const PropertyBooking = ({ property, reviewsData, userBooking }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const response = await api.post('/bookings', bookingData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBooking', property.id, user?.id])
      queryClient.invalidateQueries(['myBookings'])
      setShowBookingSuccess(true)
      setTimeout(() => {
        setShowBookingSuccess(false)
        setStartDate('')
        setEndDate('')
        setAdults(1)
        setChildren(0)
      }, 3000)
      alert('Бронювання успішно створено!')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при створенні бронювання')
    },
  })

  const cancelBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }) => {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBooking', property.id, user?.id])
      queryClient.invalidateQueries(['myBookings'])
      alert('Бронювання успішно скасовано!')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при скасуванні бронювання')
    },
  })

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

    const bookingData = {
      propertyId: property.id,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    }

    bookingMutation.mutate(bookingData)
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
                if (confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
                  const reason = prompt('Вкажіть причину скасування (необов\'язково):')
                  cancelBookingMutation.mutate({ 
                    bookingId: userBooking.id, 
                    reason: reason || undefined 
                  })
                }
              }}
              disabled={cancelBookingMutation.isPending}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {cancelBookingMutation.isPending ? 'Скасування...' : 'Скасувати бронювання'}
            </button>
          </div>
        )}

        <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-start gap-2 mb-4">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-color)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Потрібна допомога?</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Зв'яжіться з власником для будь-яких питань
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/dashboard?tab=messages&propertyId=${property.id}`)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Написати господарю
          </button>
        </div>
      </div>
    )
  }

  // Show booking form
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-lg shadow-md p-6 sticky top-24 border border-[var(--border-color)] animate-slide-in">
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl text-gray-900" style={{ color: 'var(--text-primary)' }}>{property.pricePerNight} ₴</span>
          <span className="text-gray-600" style={{ color: 'var(--text-secondary)' }}>за ніч</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span style={{ color: 'var(--text-secondary)' }}>{rating} ({reviewCount} відгуків)</span>
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
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--error-color)', opacity: 0.1, border: `1px solid var(--error-color)` }}>
              <p className="text-sm" style={{ color: 'var(--error-color)' }}>
                Перевищено максимальну кількість гостей ({property.maxGuests || 4})
              </p>
            </div>
          )}

          {calculateTotalPrice() > 0 && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex justify-between mb-2" style={{ color: 'var(--text-secondary)' }}>
                <span>{property.pricePerNight} ₴ × {calculateNights()} {calculateNights() === 1 ? 'ніч' : calculateNights() < 5 ? 'ночі' : 'ночей'}</span>
                <span>{calculateTotalPrice()} ₴</span>
              </div>
              <div className="pt-2 flex justify-between text-lg" style={{ borderTop: `1px solid var(--border-color)`, color: 'var(--text-primary)' }}>
                <span>Всього</span>
                <span>{calculateTotalPrice()} ₴</span>
              </div>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={(adults + children) > (property.maxGuests || 4) || bookingMutation.isPending}
            className="w-full px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: (adults + children) > (property.maxGuests || 4) || bookingMutation.isPending ? 'var(--text-muted)' : 'var(--accent-color)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              if (!(adults + children > (property.maxGuests || 4) || bookingMutation.isPending)) {
                e.target.style.backgroundColor = 'var(--accent-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!(adults + children > (property.maxGuests || 4) || bookingMutation.isPending)) {
                e.target.style.backgroundColor = 'var(--accent-color)';
              }
            }}
          >
            {bookingMutation.isPending ? 'Створення бронювання...' : 'Забронювати'}
          </button>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            Увійдіть, щоб забронювати
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 rounded-lg font-semibold"
            style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}
          >
            Увійти
          </button>
        </div>
      )}

      <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>
        Ви поки не будете списані
      </p>

      <div className="mt-6 pt-6" style={{ borderTop: `1px solid var(--border-color)` }}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-color)' }} />
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Безкоштовне скасування</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Повернення коштів за 48 годин до заїзду
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: `1px solid var(--border-color)` }}>
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Господар</p>
        <p className="mb-3" style={{ color: 'var(--text-primary)' }}>{property.host?.name || (property.host?.email ? property.host.email.split('@')[0] : null) || property.ownerName || 'Невідомий господар'}</p>
        {user && (
          <button
            onClick={() => navigate(`/dashboard?tab=messages&propertyId=${property.id}`)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}
          >
            <MessageSquare className="w-4 h-4" />
            Написати господарю
          </button>
        )}
      </div>
    </div>
  )
}

export default PropertyBooking
