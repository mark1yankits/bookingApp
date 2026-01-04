import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Eye, ChevronLeft, Cloud, Thermometer, Droplets, Wind } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import PropertyImageGallery from '../components/property/PropertyImageGallery'
import PropertyInfo from '../components/property/PropertyInfo'
import PropertyReviews from '../components/property/PropertyReviews'
import PropertyBooking from '../components/property/PropertyBooking'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch property data
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

  // Fetch reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const response = await api.get(`/reviews/property/${id}`)
      return response.data.reviews
    },
    enabled: !!property,
  })

  // Fetch user's booking for this property
  const { data: userBooking } = useQuery({
    queryKey: ['userBooking', id, user?.id],
    queryFn: async () => {
      if (!user) return null
      const response = await api.get(`/bookings/my-bookings?propertyId=${id}`)
      return response.data.bookings[0] || null
    },
    enabled: !!user && !!property,
  })

  // Mutations for reviews
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const response = await api.post('/reviews', reviewData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', id])
      alert('Відгук успішно додано!')
    },
  })

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, reviewData }) => {
      const response = await api.put(`/reviews/${reviewId}`, reviewData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', id])
      alert('Відгук успішно оновлено!')
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      const response = await api.delete(`/reviews/${reviewId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', id])
      alert('Відгук успішно видалено!')
    },
  })

  const handleCreateReview = (reviewData) => {
    createReviewMutation.mutate({
      propertyId: id,
      ...reviewData,
    })
  }

  const handleUpdateReview = (reviewId, reviewData) => {
    updateReviewMutation.mutate({ reviewId, reviewData })
  }

  const handleDeleteReview = (reviewId) => {
    if (confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      deleteReviewMutation.mutate(reviewId)
    }
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

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in"
      style={{ backgroundColor: 'var(--bg-primary)' }}
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
          <PropertyImageGallery images={property.images} title={property.title} />

          {/* Property Information */}
          <PropertyInfo property={property} reviewsData={reviewsData} />

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

          {/* Reviews Section */}
          <PropertyReviews
            reviewsData={reviewsData}
            reviewsLoading={reviewsLoading}
            user={user}
            onCreateReview={handleCreateReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
          />
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <PropertyBooking
            property={property}
            reviewsData={reviewsData}
            userBooking={userBooking}
          />
        </div>
      </div>
    </div>
  )
}
