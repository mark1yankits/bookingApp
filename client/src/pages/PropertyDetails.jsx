import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { MapPin, Calendar, DollarSign, Cloud, Thermometer, Droplets, Wind, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import Chat from '../components/Chat'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get(`/properties/${id}`)
      return response.data.property
    },
  })

  // Fetch weather if country is set
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather', property?.country],
    queryFn: async () => {
      if (!property?.country) return null
      const response = await api.get(`/weather/${encodeURIComponent(property.country)}`)
      return response.data
    },
    enabled: !!property?.country,
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

  const getImageUrl = (imagePath) => {
    return imagePath.startsWith('http')
      ? imagePath
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imagePath}`
  }

  const nextImage = () => {
    if (property.images && property.images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (property.images && property.images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!property.images || property.images.length <= 1) return

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevImage()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextImage()
    }
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{property.location}</span>
              {property.country && <span className="ml-2 text-gray-500">• {property.country}</span>}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Eye className="h-4 w-4 mr-1" />
              <span>{property.views || 0} переглядів</span>
            </div>
          </div>

          {/* Image Gallery */}
          {property.images && property.images.length > 0 ? (
            <div className="mb-6">
              {/* Main Image */}
              <div className="relative mb-4">
                <img
                  src={getImageUrl(property.images[selectedImageIndex])}
                  alt={`${property.title} - зображення ${selectedImageIndex + 1}`}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />

                {/* Navigation Arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all hover:scale-110"
                      aria-label="Попереднє зображення"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all hover:scale-110"
                      aria-label="Наступне зображення"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {property.images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${property.title} - мініатюра ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Image Counter */}
              <div className="mt-2 text-sm text-gray-600 text-center">
                {selectedImageIndex + 1} з {property.images.length}
              </div>
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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

          {/* Weather Section */}
          {weather && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Cloud className="h-6 w-6 mr-2 text-blue-600" />
                Погода в {weather.location || property.country}
              </h2>
              {weatherLoading ? (
                <div className="text-center py-4">Завантаження погоди...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600">Температура</p>
                      <p className="text-lg font-semibold">{weather.temperature}°C</p>
                      {weather.feelsLike && (
                        <p className="text-xs text-gray-500">Відчувається як {weather.feelsLike}°C</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Погода</p>
                      <p className="text-lg font-semibold capitalize">{weather.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Вологість</p>
                      <p className="text-lg font-semibold">{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Вітер</p>
                      <p className="text-lg font-semibold">{weather.windSpeed} км/год</p>
                    </div>
                  </div>
                </div>
              )}
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

      {property.host && user  && (
        <Chat
          propertyId={property.id}
          hostId={property.host.id}
          hostEmail={property.host.email}
        />
      )}
    </div>
  )
}

