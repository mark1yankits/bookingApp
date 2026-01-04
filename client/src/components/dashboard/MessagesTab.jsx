import { MessageSquare, Send, ArrowLeft, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const MessagesTab = ({ messagesData, messagesLoading, onSendMessage, onMarkAsRead, initialPropertyId, initialProperty, isSendingMessage, isFetchingMessages, onRefresh }) => {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [showNewMessageToast, setShowNewMessageToast] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)

  // Track previous messages count for new message detection
  const [previousMessagesCount, setPreviousMessagesCount] = useState(0)

  // Debug logging for data changes and new messages detection
  useEffect(() => {
    console.log('MessagesTab data updated:', messagesData?.conversations?.length, 'conversations')

    // Підраховуємо загальну кількість повідомлень
    const totalMessages = messagesData?.conversations?.reduce((total, conv) => total + conv.messages.length, 0) || 0

    // Перевіряємо, чи з'явилися нові повідомлення
    if (totalMessages > previousMessagesCount && previousMessagesCount > 0) {
      const newMessages = totalMessages - previousMessagesCount
      console.log(`New messages received: ${newMessages}`)
      setNewMessageCount(prev => prev + newMessages)
      setShowNewMessageToast(true)

      // Спробуємо відтворити звук нового повідомлення
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO0fLPgTQFLHfH8N2QQAoUXrTp66hVFApGn+DhE=')
        audio.volume = 0.3
        audio.play().catch(() => {}) // Ігноруємо помилки, якщо звук вимкнений
      } catch (error) {
        // Ігноруємо помилки звуку
      }

      // Автоматично ховаємо toast через 3 секунди
      setTimeout(() => {
        setShowNewMessageToast(false)
        setNewMessageCount(0)
      }, 3000)
    }

    setPreviousMessagesCount(totalMessages)

    if (selectedConversation) {
      const currentConv = messagesData?.conversations?.find(c =>
        c.property.id === selectedConversation.property.id &&
        c.otherUser.id === selectedConversation.otherUser.id
      )
      console.log('Current conversation messages:', currentConv?.messages?.length)

      // Оновлюємо selectedConversation при зміні даних
      if (currentConv && JSON.stringify(currentConv) !== JSON.stringify(selectedConversation)) {
        console.log('Updating selected conversation')
        setSelectedConversation(currentConv)
      }
    }
  }, [messagesData, selectedConversation, previousMessagesCount])

  // Auto-select conversation if initialPropertyId is provided
  useEffect(() => {
    if (initialPropertyId && messagesData?.conversations && !selectedConversation) {
      const conversation = messagesData.conversations.find(
        (conv) => conv.property.id === initialPropertyId
      )
      if (conversation) {
        setSelectedConversation(conversation)
        // Mark unread messages as read
        conversation.messages.forEach((message) => {
          if (message.receiverId === user?.id && !message.isRead) {
            onMarkAsRead(message.id)
          }
        })
      } else if (initialProperty && initialProperty.host) {
        // Create virtual conversation if none exists
        const virtualConversation = {
          property: {
            id: initialProperty.id,
            title: initialProperty.title
          },
          otherUser: {
            id: initialProperty.host.id,
            email: initialProperty.host.email
          },
          messages: [],
          unreadCount: 0,
          lastMessage: {
            content: 'Почніть розмову...',
            createdAt: new Date().toISOString()
          },
          isVirtual: true // Mark as virtual conversation
        }
        setSelectedConversation(virtualConversation)
      }
    }
  }, [initialPropertyId, messagesData, selectedConversation, user, onMarkAsRead, initialProperty])

  // Auto-scroll to bottom when conversation changes or new messages arrive
  useEffect(() => {
    if (selectedConversation) {
      console.log('Auto-scrolling, messages count:', selectedConversation.messages.length)
      const chatContainer = document.querySelector('.messages-container')
      if (chatContainer) {
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight
          console.log('Scrolled to bottom')
        }, 100)
      }
    }
  }, [selectedConversation, selectedConversation?.messages?.length])

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)

    // Mark unread messages as read
    conversation.messages.forEach((message) => {
      if (message.receiverId === user?.id && !message.isRead) {
        onMarkAsRead(message.id)
      }
    })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    const messageData = {
      receiverId: selectedConversation.otherUser.id,
      propertyId: selectedConversation.property.id,
      content: newMessage.trim(),
    }

    onSendMessage(messageData)
    setNewMessage('')
  }

  if (messagesLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[500px] relative">

      {/* Conversations List */}
      <div className="lg:col-span-1 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Розмови ({messagesData?.conversations?.length || 0})
            </h3>
            {isFetchingMessages && (
              <div className="w-4 h-4 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {messagesData?.conversations?.length > 0 ? (
            messagesData.conversations
              .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
              .map((conversation) => (
              <div
                key={`${conversation.property.id}-${conversation.otherUser.id}`}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-[var(--border-color)] cursor-pointer hover-lift transition-colors ${
                  selectedConversation &&
                  selectedConversation.property.id === conversation.property.id &&
                  selectedConversation.otherUser.id === conversation.otherUser.id
                    ? 'bg-[var(--accent-color)] bg-opacity-10 border-l-4 border-[var(--accent-color)]'
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {conversation.property.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {isFetchingMessages && conversation === selectedConversation && (
                      <div className="w-2 h-2 border border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-pulse">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {conversation.otherUser.email}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {conversation.lastMessage.content}
                  </p>
                  {conversation.lastMessage.isOptimistic && (
                    <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin opacity-60" />
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {new Date(conversation.lastMessage.createdAt).toLocaleDateString('uk-UA')}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Поки що немає повідомлень</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] flex flex-col h-full">
        {selectedConversation ? (
          <>
            {/* Chat Header - Fixed */}
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedConversation.property.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {selectedConversation.otherUser.email}
                    </p>
                  </div>
                  {isFetchingMessages && (
                    <div className="w-3 h-3 border border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </div>

            {/* Messages Container - Scrollable */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 max-h-[calc(100vh-20rem)] overflow-y-auto p-4 space-y-4 messages-container pb-2">
              {selectedConversation.isVirtual ? (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Це початок розмови. Напишіть перше повідомлення!</p>
                </div>
              ) : (
                selectedConversation.messages
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((message) => {
                    console.log('Rendering message:', message.id, message.content, message.isOptimistic)
                    return (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-[var(--accent-color)] text-white'
                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{message.content}</p>
                          {message.isOptimistic && (
                            <div className="flex items-center gap-1 text-xs opacity-60">
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              <span>Надсилається...</span>
                            </div>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.id ? 'text-blue-100' : 'text-[var(--text-muted)]'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString('uk-UA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    )
                  })
              )}
              </div>

              {/* Message Input - Fixed at Bottom */}
              <div className="p-4 border-t border-[var(--border-color)] flex-shrink-0 bg-[var(--bg-tertiary)]">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isSendingMessage ? "Надсилається..." : "Введіть повідомлення..."}
                    disabled={isSendingMessage}
                    className="flex-1 px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)] disabled:opacity-50"
                    style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="px-4 py-3 bg-[var(--accent-color)] text-white rounded-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isSendingMessage ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Оберіть розмову</h3>
              <p className="text-sm">Виберіть розмову зі списку, щоб почати спілкування</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesTab
