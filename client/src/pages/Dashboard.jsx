import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Home, Plus, DollarSign, CheckCircle, XCircle, Clock, Eye, MessageCircle, Upload, X, Image } from 'lucide-react'
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
    country: '',
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)

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

  // Fetch host's properties
  const { data: myProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['myProperties'],
    queryFn: async () => {
      const response = await api.get('/properties/host/my-properties')
      return response.data.properties
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
      queryClient.invalidateQueries(['myProperties'])
      setShowPropertyForm(false)
      setPropertyForm({
        title: '',
        description: '',
        pricePerNight: '',
        location: '',
        amenities: '',
        country: '',
      })
      // Clear images and revoke URLs to prevent memory leaks
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
      setImages([])
      setImagePreviews([])
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

  const handleImageSelect = (files) => {
    const newFiles = Array.from(files)
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'))

    if (validFiles.length !== newFiles.length) {
      alert('Будь ласка, оберіть тільки зображення')
      return
    }

    setImages(prev => [...prev, ...validFiles])

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const handleImageRemove = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageSelect(files)
    }
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
                    Країна
                  </label>
                  <select
                    value={propertyForm.country}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        country: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Оберіть країну</option>
                    <option value="Україна">Україна</option>
                    <option value="Іспанія">Іспанія</option>
                    <option value="Франція">Франція</option>
                    <option value="Італія">Італія</option>
                    <option value="Португалія">Португалія</option>
                    <option value="Греція">Греція</option>
                    <option value="Туреччина">Туреччина</option>
                    <option value="Хорватія">Хорватія</option>
                    <option value="Польща">Польща</option>
                    <option value="Чехія">Чехія</option>
                  </select>
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Зображення
                  </label>

                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <Upload className={`mx-auto h-12 w-12 ${
                        isDragOver ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <div className="mt-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Перетягніть зображення сюди або{' '}
                            <span className="text-blue-600 hover:text-blue-500">
                              оберіть файли
                            </span>
                          </span>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageSelect(e.target.files)}
                          className="sr-only"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, JPEG до 10MB кожен
                      </p>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Вибрані зображення ({imagePreviews.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleImageRemove(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

          {/* My Properties */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Мої оголошення</h3>
            {propertiesLoading ? (
              <div className="text-center py-8">Завантаження...</div>
            ) : myProperties && myProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={
                          property.images[0].startsWith('http')
                            ? property.images[0]
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`
                        }
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Немає зображення</span>
                      </div>
                    )}
                    <div className="p-4">
                      <Link
                        to={`/property/${property.id}`}
                        className="text-lg font-semibold text-blue-600 hover:underline block mb-2"
                      >
                        {property.title}
                      </Link>
                      <p className="text-gray-600 text-sm mb-3">{property.location}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-blue-600">
                          {property.pricePerNight} ₴
                        </span>
                        <span className="text-sm text-gray-500">за ніч</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{property.views || 0} переглядів</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{property.bookings?.length || 0} бронювань</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                У вас немає оголошень. Створіть перше оголошення!
              </div>
            )}
          </div>

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

