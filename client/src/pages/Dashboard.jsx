import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Home, MessageSquare, Settings, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import BookingsTab from '../components/dashboard/BookingsTab'
import PropertiesTab from '../components/dashboard/PropertiesTab'
import MessagesTab from '../components/dashboard/MessagesTab'
import SettingsTab from '../components/dashboard/SettingsTab'

export default function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('bookings')

  // Fetch user's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/my-bookings')
      return response.data.bookings
    },
    enabled: !!user,
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

  // Fetch user's messages
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['myMessages'],
    queryFn: async () => {
      const response = await api.get('/messages/my-messages')
      return response.data
    },
    enabled: !!user,
  })

  const propertyMutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData()

      Object.keys(formData).forEach((key) => {
        if (key !== 'images' && key !== 'imageFiles') {
          if (key === 'amenities' && formData[key]) {
            // Convert comma-separated string to JSON array
            const amenitiesArray = formData[key].split(',').map(item => item.trim()).filter(item => item)
            data.append(key, JSON.stringify(amenitiesArray))
          } else if (key === 'rules' && formData[key]) {
            // Convert comma-separated string to JSON array
            const rulesArray = formData[key].split(',').map(item => item.trim()).filter(item => item)
            data.append(key, JSON.stringify(rulesArray))
          } else if (key === 'price') {
            // Ensure price is a valid number
            const price = parseFloat(formData[key]);
            if (isNaN(price) || price <= 0) {
              throw new Error('Invalid price');
            }
            data.append('pricePerNight', price.toString())
          } else if (key === 'bedrooms' || key === 'bathrooms' || key === 'maxGuests') {
            // Ensure these are numbers
            data.append(key, parseInt(formData[key], 10).toString())
          } else {
            data.append(key, formData[key])
          }
        }
      })

      formData.imageFiles.forEach((file) => {
        data.append('images', file)
      })

      const response = await api.post('/properties', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myProperties'])
      alert('Нерухомість успішно додано!')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при додаванні нерухомості')
    },
  })

  const cancelBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }) => {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myBookings'])
      alert('Бронювання успішно скасовано!')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при скасуванні бронювання')
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const response = await api.post('/messages', messageData)
      return response.data
    },
    onSuccess: () => {
      refetchMessages()
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при відправці повідомлення')
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      const response = await api.patch(`/messages/${messageId}/read`)
      return response.data
    },
    onSuccess: () => {
      refetchMessages()
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await api.patch('/auth/profile', profileData)
      return response.data
    },
    onSuccess: () => {
      alert('Профіль успішно оновлено!')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при оновленні профілю')
    },
  })

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

  const handleCancelBooking = (bookingId) => {
    const reason = prompt('Вкажіть причину скасування (необов\'язково):')
    if (reason === null) return

    cancelBookingMutation.mutate({ bookingId, reason: reason || undefined })
  }

  const handlePropertySubmit = (formData) => {
    propertyMutation.mutate(formData)
  }

  const handleSendMessage = (messageData) => {
    sendMessageMutation.mutate(messageData)
  }

  const handleMarkAsRead = (messageId) => {
    markAsReadMutation.mutate(messageId)
  }

  const handleUpdateProfile = (profileData) => {
    updateProfileMutation.mutate(profileData)
  }

  const tabs = [
    { id: 'bookings', label: 'Бронювання', icon: Calendar, showFor: ['guest', 'host', 'admin'] },
    { id: 'properties', label: 'Нерухомість', icon: Home, showFor: ['host', 'admin'] },
    { id: 'messages', label: 'Повідомлення', icon: MessageSquare, showFor: ['guest', 'host', 'admin'] },
    { id: 'settings', label: 'Налаштування', icon: Settings, showFor: ['guest', 'host', 'admin'] },
  ]

  const availableTabs = tabs.filter(tab => tab.showFor.includes(user?.role || 'guest'))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Панель управління</h1>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-[var(--border-color)]">
          <nav className="flex space-x-8">
            {availableTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-in">
        {activeTab === 'bookings' && (
          <BookingsTab
            bookings={bookings}
            bookingsLoading={bookingsLoading}
            onCancelBooking={handleCancelBooking}
            getStatusIcon={getStatusIcon}
            getStatusText={getStatusText}
          />
        )}
        {activeTab === 'properties' && (
          <PropertiesTab
            myProperties={myProperties}
            propertiesLoading={propertiesLoading}
            onPropertySubmit={handlePropertySubmit}
          />
        )}
        {activeTab === 'messages' && (
          <MessagesTab
            messagesData={messagesData}
            messagesLoading={messagesLoading}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            user={user}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </div>
    </div>
  )
}
