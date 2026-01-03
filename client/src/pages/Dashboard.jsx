import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Home, Plus, DollarSign, CheckCircle, XCircle, Clock, Eye, MessageCircle, Upload, X, Image, MapPin, Check, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { Link } from 'react-router-dom'

const countries = [
  'Україна',
  'Іспанія',
  'Франція',
  'Італія',
  'Португалія',
  'Греція',
  'Туреччина',
  'Хорватія',
  'Польща',
  'Чехія'
]

const propertyTypes = [
  'Квартира',
  'Будинок',
  'Апартаменти',
  'Студія',
  'Вілла',
  'Котедж'
]

export default function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    country: 'Україна',
    type: 'Квартира',
    bedrooms: '1',
    bathrooms: '1',
    maxGuests: '2',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: '',
    rules: '',
    images: []
  })
  const [dragActive, setDragActive] = useState(false)

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
          if (key === 'amenities') {
            data.append(key, JSON.stringify(formData[key].split(',').map(a => a.trim()).filter(a => a)))
          } else if (key === 'rules') {
            data.append(key, JSON.stringify(formData[key].split('\n').map(r => r.trim()).filter(r => r)))
          } else {
          data.append(key, formData[key])
          }
        }
      })
      formData.images.forEach((image) => {
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
        price: '',
        location: '',
        country: 'Україна',
        type: 'Квартира',
        bedrooms: '1',
        bathrooms: '1',
        maxGuests: '2',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        amenities: '',
        rules: '',
        images: []
      })
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

    if (!propertyForm.title || !propertyForm.description || !propertyForm.price || !propertyForm.location) {
      alert('Будь ласка, заповніть всі обов\'язкові поля')
      return
    }

    if (propertyForm.images.length === 0) {
      alert('Додайте хоча б одне зображення')
      return
    }

    propertyMutation.mutate(propertyForm)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files)

    fileArray.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Файл ${file.name} занадто великий. Максимальний розмір 10MB`)
        return
      }

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert(`Файл ${file.name} має неприпустимий формат. Дозволені: PNG, JPG, JPEG`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setPropertyForm(prev => ({
            ...prev,
            images: [...prev.images, e.target.result]
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setPropertyForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
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
            <form onSubmit={handlePropertySubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl text-gray-900 mb-4">Нова нерухомість</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Назва *
                  </label>
                  <input
                    type="text"
                    value={propertyForm.title}
                    onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Сучасна квартира в центрі міста"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Опис *
                  </label>
                  <textarea
                    value={propertyForm.description}
                    onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Детальний опис вашої нерухомості..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Тип житла *
                  </label>
                  <select
                    value={propertyForm.type}
                    onChange={(e) => setPropertyForm({ ...propertyForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Ціна за ніч (₴) *
                  </label>
                  <input
                    type="number"
                    value={propertyForm.price}
                    onChange={(e) => setPropertyForm({ ...propertyForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="1200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Місцезнаходження *
                  </label>
                  <input
                    type="text"
                    value={propertyForm.location}
                    onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Київ, Шевченківський район"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Країна *
                  </label>
                  <select
                    value={propertyForm.country}
                    onChange={(e) => setPropertyForm({ ...propertyForm, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Кількість спалень *
                  </label>
                  <select
                    value={propertyForm.bedrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Кількість ванних *
                  </label>
                  <select
                    value={propertyForm.bathrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Максимум гостей *
                  </label>
                  <select
                    value={propertyForm.maxGuests}
                    onChange={(e) => setPropertyForm({ ...propertyForm, maxGuests: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Час заїзду *
                  </label>
                  <input
                    type="time"
                    value={propertyForm.checkInTime}
                    onChange={(e) => setPropertyForm({ ...propertyForm, checkInTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Час виїзду *
                  </label>
                  <input
                    type="time"
                    value={propertyForm.checkOutTime}
                    onChange={(e) => setPropertyForm({ ...propertyForm, checkOutTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Зручності (через кому)
                  </label>
                  <input
                    type="text"
                    value={propertyForm.amenities}
                    onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Wi-Fi, Парковка, Кондиціонер, Кухня"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Правила дому (кожне правило з нового рядка)
                  </label>
                  <textarea
                    value={propertyForm.rules}
                    onChange={(e) => setPropertyForm({ ...propertyForm, rules: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Заборонено курити&#10;Домашні тварини не дозволені&#10;Тихі години: 22:00-08:00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Зображення *
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Перетягніть файли сюди або{' '}
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                        оберіть файли
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG до 10MB на файл
                    </p>
                  </div>

                  {propertyForm.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {propertyForm.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Фото ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Додати нерухомість
                </button>
                <button
                  type="button"
                  onClick={() => setShowPropertyForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </form>
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

