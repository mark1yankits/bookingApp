import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'bookings')

  // Update active tab when URL param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

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

  // Fetch user's messages with real-time updates
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages, isFetching } = useQuery({
    queryKey: ['myMessages'],
    queryFn: async () => {
      const response = await api.get('/messages/my-messages')
      return response.data
    },
    enabled: !!user,
    refetchInterval: 3000, // Оновлювати кожні 3 секунди для отримання нових повідомлень
    refetchIntervalInBackground: false, // Не оновлювати у фоні
  })

  // Fetch property info if propertyId is in URL params
  const propertyId = searchParams.get('propertyId')
  const { data: initialProperty } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null
      const response = await api.get(`/properties/${propertyId}`)
      return response.data.property
    },
    enabled: !!propertyId,
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
    onMutate: async (variables) => {
      // Скасовуємо будь-які вхідні refetch
      await queryClient.cancelQueries({ queryKey: ['myMessages'] })

      // Зберігаємо попередній стан
      const previousData = queryClient.getQueryData(['myMessages'])

      // Оптимістичне оновлення
      queryClient.setQueryData(['myMessages'], (oldData) => {
        if (!oldData) return oldData

        let updatedConversations = [...oldData.conversations]
        let conversationFound = false

        updatedConversations = updatedConversations.map((conversation) => {
          // Знаходимо розмову, до якої було надіслано повідомлення
          if (conversation.property.id === variables.propertyId &&
              conversation.otherUser.id === variables.receiverId) {

            conversationFound = true

            const optimisticMessage = {
              id: `optimistic-${Date.now()}`, // Оптимістичний ID
              content: variables.content,
              senderId: user.id,
              receiverId: variables.receiverId,
              propertyId: variables.propertyId,
              isRead: false,
              createdAt: new Date(Date.now() + 1).toISOString(), // Трохи в майбутньому, щоб бути останнім
              isOptimistic: true // Позначка для оптимістичного оновлення
            }

            return {
              ...conversation,
              messages: [...conversation.messages, optimisticMessage],
              lastMessage: optimisticMessage,
              unreadCount: conversation.otherUser.id === user.id ? conversation.unreadCount + 1 : conversation.unreadCount
            }
          }
          return conversation
        })

        // Якщо розмова не знайдена, створюємо нову (хоча це не повинно траплятися)
        if (!conversationFound) {
          console.warn('Conversation not found for optimistic update, this should not happen')
        }

        return {
          ...oldData,
          conversations: updatedConversations
        }
      })

      return { previousData }
    },
    onSuccess: (data, variables, context) => {
      // Замінюємо оптимістичне повідомлення на реальне
      console.log('Message sent successfully:', data) // Додаємо логування для діагностики
      queryClient.setQueryData(['myMessages'], (oldData) => {
        if (!oldData) return oldData

        const updatedConversations = oldData.conversations.map((conversation) => {
          if (conversation.property.id === variables.propertyId &&
              conversation.otherUser.id === variables.receiverId) {

            // Знаходимо і замінюємо оптимістичне повідомлення на реальне
            const messages = conversation.messages.map((msg) =>
              msg.isOptimistic ? {
                ...data.data, // Використовуємо правильну структуру відповіді
                isOptimistic: false
              } : msg
            )

            return {
              ...conversation,
              messages,
              lastMessage: data.data // Використовуємо правильну структуру відповіді
            }
          }
          return conversation
        })

        return {
          ...oldData,
          conversations: updatedConversations
        }
      })
    },
    onError: (error, variables, context) => {
      // Відкочуємо до попереднього стану при помилці
      if (context?.previousData) {
        queryClient.setQueryData(['myMessages'], context.previousData)
      }
      alert(error.response?.data?.message || 'Помилка при відправці повідомлення')
    },
    onSettled: () => {
      // Завжди синхронізуємо з сервером через 0.5 секунди для швидшої видимості
      console.log('Message settled, refreshing data...')
      setTimeout(() => {
        console.log('Invalidating myMessages query')
        queryClient.invalidateQueries(['myMessages'])
        // Також робимо прямий refetch для гарантії
        refetchMessages()
      }, 500)
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
            initialPropertyId={searchParams.get('propertyId')}
            initialProperty={initialProperty}
            isSendingMessage={sendMessageMutation.isPending}
            isFetchingMessages={isFetching}
            onRefresh={() => refetchMessages()}
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
