import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get(`/properties/${id}`)
      return response.data.property
    },
  })

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const response = await api.post('/bookings', bookingData)
      return response.data
    },
    onSuccess: () => {
      alert('Бронювання успішно створено!')
      navigate('/dashboard')
    },
    onError: (error) => {
      alert(
        error.response?.data?.message ||
          'Помилка при створенні бронювання'
      )
    },
  })

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

    bookingMutation.mutate({
      propertyId: id,
      startDate,
      endDate,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Нерухомість не знайдена</div>
      </div>
    )
  }

  const amenities = Array.isArray(property.amenities)
    ? property.amenities
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
          <div className="flex items-center text-gray-600 mb-6">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{property.location}</span>
          </div>

          {/* Image Gallery */}
          {property.images && property.images.length > 0 ? (
            <div className="mb-6">
              <img
                src={
                  property.images[0].startsWith('http')
                    ? property.images[0]
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`
                }
                alt={property.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
              <span className="text-gray-400">Немає зображення</span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Опис</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {amenities.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Зручності</h2>
              <ul className="grid grid-cols-2 gap-2">
                {amenities.map((amenity, index) => (
                  <li key={index} className="text-gray-700">
                    • {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">
                  {property.pricePerNight} ₴
                </span>
                <span className="text-gray-600">за ніч</span>
              </div>
            </div>

            {user ? (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Дата заїзду
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Дата виїзду
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={bookingMutation.isPending}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                >
                  {bookingMutation.isPending
                    ? 'Обробка...'
                    : 'Забронювати'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Увійдіть, щоб забронювати
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Увійти
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>Безкоштовна скасування</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

