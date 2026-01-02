import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Home, Plus, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    pricePerNight: '',
    location: '',
    amenities: '',
  })
  const [images, setImages] = useState([])

  // Fetch user's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/my-bookings')
      return response.data.bookings
    },
    enabled: !!user,
  })

  // Fetch host bookings if user is host
  const { data: hostBookings, isLoading: hostBookingsLoading } = useQuery({
    queryKey: ['hostBookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/host-bookings')
      return response.data.bookings
    },
    enabled: !!user && (user.role === 'host' || user.role === 'admin'),
  })

  const propertyMutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData()
      Object.keys(formData).forEach((key) => {
        if (key !== 'images') {
          data.append(key, formData[key])
        }
      })
      images.forEach((image) => {
        data.append('images', image)
      })
      const response = await api.post('/properties', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['properties'])
      setShowPropertyForm(false)
      setPropertyForm({
        title: '',
        description: '',
        pricePerNight: '',
        location: '',
        amenities: '',
      })
      setImages([])
      alert('Нерухомість успішно додано!')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при додаванні нерухомості')
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ bookingId, status }) => {
      const response = await api.patch(`/bookings/${bookingId}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hostBookings'])
      queryClient.invalidateQueries(['myBookings'])
    },
  })

  const handlePropertySubmit = (e) => {
    e.preventDefault()
    const amenitiesArray = propertyForm.amenities
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a)
    propertyMutation.mutate({
      ...propertyForm,
      amenities: JSON.stringify(amenitiesArray),
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Підтверджено'
      case 'cancelled':
        return 'Скасовано'
      default:
        return 'Очікує підтвердження'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Панель управління</h1>

      {/* Host Section */}
      {(user?.role === 'host' || user?.role === 'admin') && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Моя нерухомість</h2>
            <button
              onClick={() => setShowPropertyForm(!showPropertyForm)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Додати нерухомість</span>
            </button>
          </div>

          {showPropertyForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <form onSubmit={handlePropertySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Назва
                  </label>
                  <input
                    type="text"
                    value={propertyForm.title}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, title: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Опис
                  </label>
                  <textarea
                    value={propertyForm.description}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        description: e.target.value,
                      })
                    }
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ціна за ніч (₴)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={propertyForm.pricePerNight}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          pricePerNight: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Місцезнаходження
                    </label>
                    <input
                      type="text"
                      value={propertyForm.location}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          location: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Зручності (через кому)
                  </label>
                  <input
                    type="text"
                    value={propertyForm.amenities}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        amenities: e.target.value,
                      })
                    }
                    placeholder="Wi-Fi, Парковка, Кондиціонер"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Зображення
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={propertyMutation.isPending}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {propertyMutation.isPending ? 'Збереження...' : 'Додати'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPropertyForm(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Host Bookings */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Бронювання моєї нерухомості</h3>
            {hostBookingsLoading ? (
              <div className="text-center py-8">Завантаження...</div>
            ) : hostBookings && hostBookings.length > 0 ? (
              <div className="space-y-4">
                {hostBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link
                          to={`/property/${booking.property.id}`}
                          className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                          {booking.property.title}
                        </Link>
                        <p className="text-gray-600 mt-1">
                          Гість: {booking.user.email}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(booking.startDate).toLocaleDateString('uk-UA')} -{' '}
                            {new Date(booking.endDate).toLocaleDateString('uk-UA')}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {booking.totalPrice} ₴
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          <span className="text-sm">{getStatusText(booking.status)}</span>
                        </div>
                        {booking.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                statusMutation.mutate({
                                  bookingId: booking.id,
                                  status: 'confirmed',
                                })
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Підтвердити
                            </button>
                            <button
                              onClick={() =>
                                statusMutation.mutate({
                                  bookingId: booking.id,
                                  status: 'cancelled',
                                })
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Скасувати
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                Немає бронювань
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tenant Bookings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Мої бронювання</h2>
        {bookingsLoading ? (
          <div className="text-center py-8">Завантаження...</div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link
                      to={`/property/${booking.property.id}`}
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {booking.property.title}
                    </Link>
                    <p className="text-gray-600 mt-1">{booking.property.location}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(booking.startDate).toLocaleDateString('uk-UA')} -{' '}
                        {new Date(booking.endDate).toLocaleDateString('uk-UA')}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {booking.totalPrice} ₴
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(booking.status)}
                    <span className="text-sm">{getStatusText(booking.status)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            У вас немає бронювань
          </div>
        )}
      </div>
    </div>
  )
}

