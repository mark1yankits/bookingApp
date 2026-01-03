import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { MapPin, Calendar, DollarSign, Cloud, Thermometer, Droplets, Wind, Eye, ChevronLeft, ChevronRight, Users, Bed, Bath, Clock, Star, Heart, AlertCircle } from 'lucide-react'
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
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)

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

  const nextImage = () => {
    if (property?.images && property.images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (property?.images && property.images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
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

    bookingMutation.mutate({
      propertyId: id,
      startDate,
      endDate,
    })
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return nights > 0 ? nights * property.pricePerNight : 0;
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getImageUrl = (imagePath) => {
    return imagePath.startsWith('http')
      ? imagePath
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imagePath}`
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
      {/* Кнопка назад */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Повернутися до пошуку
      </button>

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

          {/* Інформація про нерухомість */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{property.location}</span>
                  {property.country && <span className="ml-2 text-gray-500">• {property.country}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl text-gray-900">{(property.rating || 4.8).toFixed(1)}</span>
                <span className="text-gray-600">({property.reviewCount || 12} відгуків)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Спальні</p>
                  <p className="text-lg text-gray-900">{property.bedrooms || 2}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Bath className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ванні</p>
                  <p className="text-lg text-gray-900">{property.bathrooms || 1}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Гостей</p>
                  <p className="text-lg text-gray-900">до {property.maxGuests || 4}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Заїзд/Виїзд</p>
                  <p className="text-sm text-gray-900">{property.checkInTime || '15:00'}/{property.checkOutTime || '11:00'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl text-gray-900 mb-3">Опис</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl text-gray-900 mb-3">Зручності</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl text-gray-900 mb-3">Правила дому</h2>
              <div className="space-y-2">
                {(property.rules || ['Немає куріння', 'Немає домашніх тварин', 'Без вечірок']).map((rule, index) => (
                  <div key={index} className="flex items-start gap-2 text-gray-700">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl text-gray-900">{property.pricePerNight} ₴</span>
                <span className="text-gray-600">за ніч</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{(property.rating || 4.8).toFixed(1)} ({property.reviewCount || 12} відгуків)</span>
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
                  onClick={() => {
                    if (!startDate || !endDate) {
                      alert('Будь ласка, оберіть дати заїзду та виїзду');
                      return;
                    }

                    if ((adults + children) > (property.maxGuests || 4)) {
                      alert(`Максимальна кількість гостей: ${property.maxGuests || 4}`);
                      return;
                    }

                    if (calculateTotalPrice() <= 0) {
                      alert('Невірні дати');
                      return;
                    }

                    const bookingData = {
                      propertyId: property.id,
                      startDate,
                      endDate,
                      adults,
                      children,
                      totalPrice: calculateTotalPrice(),
                    };

                    bookingMutation.mutate(bookingData);
                    setShowBookingSuccess(true);

                    setTimeout(() => {
                      setShowBookingSuccess(false);
                      setStartDate('');
                      setEndDate('');
                      setAdults(1);
                      setChildren(0);
                    }, 3000);
                  }}
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

