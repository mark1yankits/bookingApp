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

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const isHost = user?.role === 'host' || user?.role === 'admin'
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: isHost ? ['hostBookings'] : ['myBookings'],
    queryFn: async () => {
      const endpoint = isHost ? '/bookings/host-bookings' : '/bookings/my-bookings'
      const response = await api.get(endpoint)
      return response.data.bookings
    },
    enabled: !!user,
  })

  const { data: myProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['myProperties'],
    queryFn: async () => {
      const response = await api.get('/properties/host/my-properties')
      return response.data.properties
    },
    enabled: !!user && (user.role === 'host' || user.role === 'admin'),
  })

  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages, isFetching } = useQuery({
    queryKey: ['myMessages'],
    queryFn: async () => {
      const response = await api.get('/messages/my-messages')
      return response.data
    },
    enabled: !!user,
    refetchInterval: 3000, 
    refetchIntervalInBackground: false, 
  })

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
      queryClient.invalidateQueries(isHost ? ['hostBookings'] : ['myBookings'])
      alert('Бронювання успішно скасовано!')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при скасуванні бронювання')
    },
  })

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }) => {
      const response = await api.patch(`/bookings/${bookingId}/status`, { status })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['hostBookings'])
      const statusText = variables.status === 'confirmed' ? 'підтверджено' : 'відхилено'
      alert(`Бронювання успішно ${statusText}!`)
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка при оновленні статусу бронювання')
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      console.log('Sending message via mutation:', messageData);

      if (messageData.attachments && messageData.attachments.length > 0) {
        const formData = new FormData()
        formData.append('receiverId', messageData.receiverId)
        formData.append('propertyId', messageData.propertyId)
        formData.append('content', messageData.content)

        messageData.attachments.forEach((file) => {
          formData.append('attachments', file)
        })

        const response = await api.post('/messages', formData)
        return response.data
      } else {
        const response = await api.post('/messages', {
          receiverId: messageData.receiverId,
          propertyId: messageData.propertyId,
          content: messageData.content
        })
        return response.data
      }
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['myMessages'] })

      const previousData = queryClient.getQueryData(['myMessages'])

      queryClient.setQueryData(['myMessages'], (oldData) => {
        if (!oldData) return oldData

        let updatedConversations = [...oldData.conversations]
        let conversationFound = false

        updatedConversations = updatedConversations.map((conversation) => {
          if (conversation.property.id === variables.propertyId &&
              conversation.otherUser.id === variables.receiverId) {

            conversationFound = true

            const optimisticMessage = {
              id: `optimistic-${Date.now()}`,
              content: variables.content,
              senderId: user.id,
              receiverId: variables.receiverId,
              propertyId: variables.propertyId,
              isRead: false,
              createdAt: new Date(Date.now() + 1).toISOString(),
              attachments: variables.attachments || [],
              messageType: variables.attachments && variables.attachments.length > 0 ? 'file' : 'text',
              isOptimistic: true 
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
      console.log('Message sent successfully:', data) 
      queryClient.setQueryData(['myMessages'], (oldData) => {
        if (!oldData) return oldData

        const updatedConversations = oldData.conversations.map((conversation) => {
          if (conversation.property.id === variables.propertyId &&
              conversation.otherUser.id === variables.receiverId) {

            const messages = conversation.messages.map((msg) =>
              msg.isOptimistic ? {
                ...data.data, 
                isOptimistic: false
              } : msg
            )

            return {
              ...conversation,
              messages,
              lastMessage: data.data 
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
      if (context?.previousData) {
        queryClient.setQueryData(['myMessages'], context.previousData)
      }
      alert(error.response?.data?.message || 'Помилка при відправці повідомлення')
    },
    onSettled: () => {
      console.log('Message settled, refreshing data...')
      setTimeout(() => {
        console.log('Invalidating myMessages query')
        queryClient.invalidateQueries(['myMessages'])
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

  const handleUpdateBookingStatus = (bookingId, status) => {
    updateBookingStatusMutation.mutate({ bookingId, status })
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
            onUpdateBookingStatus={handleUpdateBookingStatus}
            getStatusIcon={getStatusIcon}
            getStatusText={getStatusText}
            isHost={isHost}
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
