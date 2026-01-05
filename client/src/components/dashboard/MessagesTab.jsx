import { MessageSquare, Send, ArrowLeft, RefreshCw, Search, Phone, Video, MoreVertical, ChevronLeft, Image as ImageIcon, Smile, Paperclip, Check, CheckCheck, PhoneOff, VideoOff } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'

const MessagesTab = ({ messagesData, messagesLoading, onSendMessage, onMarkAsRead, initialPropertyId, initialProperty, isSendingMessage, isFetchingMessages, onRefresh }) => {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [showNewMessageToast, setShowNewMessageToast] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

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

      // Auto-focus input when conversation opens
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 200)
      }
    }
  }, [selectedConversation])

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
    inputRef.current?.focus()
  }

  // Filter conversations based on search
  const filteredConversations = messagesData?.conversations?.filter(conv =>
    conv.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.property.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Вчора'
    } else if (days < 7) {
      return date.toLocaleDateString('uk-UA', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
    }
  }

  if (messagesLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)]  rounded-lg shadow-xl overflow-hidden transition-colors duration-300 relative">

      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} md:w-96 w-full flex-col border-r border-[var(--border-color)] transition-all`}>
        {/* Заголовок з градієнтом */}
        <div className="p-4 border-b border-[var(--border-color)]" style={{ backgroundColor: 'var(--accent-color)' }}>
          <h2 className="text-xl text-white mb-4">Повідомлення</h2>

          {/* Пошук */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Пошук розмов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: `1px solid var(--border-color)`,
                '--tw-ring-color': 'var(--accent-color)',
                '--tw-placeholder-color': 'var(--text-muted)'
              }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8" style={{ color: 'var(--text-secondary)' }}>
              <svg className="w-24 h-24 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-center">Немає повідомлень</p>
              <p className="text-sm text-center mt-2">Розпочніть розмову з власником нерухомості</p>
            </div>
          ) : (
            filteredConversations
              .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
              .map((conversation) => (
              <button
                key={`${conversation.property.id}-${conversation.otherUser.id}`}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full p-4 flex items-start gap-3 transition-all border-b ${
                  selectedConversation?.property.id === conversation.property.id
                    ? 'bg-[var(--bg-secondary)] border-l-4 border-l-[var(--accent-color)]'
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}
                style={{ borderColor: 'var(--border-color)' }}
              >
                {/* Аватар */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {conversation.otherUser.email.charAt(0).toUpperCase()}
                  </div>
                  {/* Онлайн індикатор */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ backgroundColor: 'var(--success-color)', borderColor: 'var(--bg-primary)' }}></div>
                </div>

                {/* Інформація про розмову */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {conversation.otherUser.email.split('@')[0]}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {conversation.property.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {conversation.lastMessage?.content || 'Почніть розмову...'}
                    </p>
                    {isFetchingMessages && conversation === selectedConversation && (
                      <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Непрочитані */}
                {conversation.unreadCount > 0 && (
                  <div className="flex-shrink-0 ml-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full animate-pulse">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                {/* Кнопка назад на мобільних */}
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </button>

                {/* Аватар і інфо */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {selectedConversation.otherUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedConversation.otherUser.email.split('@')[0]}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {selectedConversation.property.title}
                  </p>
                </div>
              </div>

              {/* Дії */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg transition-colors group hover:bg-[var(--bg-secondary)]">
                  <Phone className="w-5 h-5 group-hover:text-[var(--accent-color)] transition-colors" style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button className="p-2 rounded-lg transition-colors group hover:bg-[var(--bg-secondary)]">
                  <Video className="w-5 h-5 group-hover:text-[var(--accent-color)] transition-colors" style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button className="p-2 rounded-lg transition-colors group hover:bg-[var(--bg-secondary)]">
                  <MoreVertical className="w-5 h-5 group-hover:text-[var(--accent-color)] transition-colors" style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container" style={{ background: 'var(--gradient-primary)' }}>
              {selectedConversation.isVirtual ? (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Це початок розмови. Напишіть перше повідомлення!</p>
                </div>
              ) : (
                selectedConversation.messages
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const showAvatar = index === 0 ||
                      selectedConversation.messages[index - 1].senderId !== message.senderId;

                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
                      >
                        {/* Аватар */}
                        {showAvatar ? (
                          <div className="w-8 h-8 flex-shrink-0">
                            {!isOwn && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">
                                {selectedConversation.otherUser.email.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-8 h-8 flex-shrink-0"></div>
                        )}

                        {/* Повідомлення */}
                        <div className={`group relative max-w-[70%] ${message.isOptimistic ? 'opacity-70' : ''}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-sm ${
                              isOwn
                                ? 'rounded-br-sm'
                                : 'rounded-bl-sm'
                            }`}
                            style={{
                              backgroundColor: isOwn ? 'var(--accent-color)' : 'var(--bg-primary)',
                              color: isOwn ? 'white' : 'var(--text-primary)',
                              border: isOwn ? 'none' : `1px solid var(--border-color)`
                            }}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                          </div>

                          {/* Час і статус */}
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(message.createdAt).toLocaleTimeString('uk-UA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isOwn && (
                              message.isRead ? (
                                <CheckCheck className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                              ) : (
                                <Check className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}

              {/* Індикатор друку */}
              {isSendingMessage && (
                <div className="flex items-end gap-2 animate-fadeIn">
                  <div className="w-8 h-8 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">
                      {selectedConversation.otherUser.email.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', border: `1px solid var(--border-color)` }}>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border rounded-lg" style={{backgroundColor: 'color-mix(in srgb, var(--bg-primary), transparent 50%)', 
                    borderColor: 'color-mix(in srgb, var(--border-color), transparent 50%)'  }}>
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  {/* Кнопки додаткових дій */}
                  <div className="flex gap-1 mb-2">
                    <button
                      type="button"
                      className="p-2 rounded-lg transition-colors group hover:bg-[var(--bg-secondary)]"
                    >
                      <Paperclip className="w-5 h-5 group-hover:text-[var(--accent-color)] transition-colors" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-lg transition-colors group hover:bg-[var(--bg-secondary)]"
                    >
                      <ImageIcon className="w-5 h-5 group-hover:text-[var(--accent-color)] transition-colors" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  </div>

                  {/* Поле введення */}
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isSendingMessage ? "Надсилається..." : "Напишіть повідомлення..."}
                      disabled={isSendingMessage}
                      className="w-full px-4 py-3 pr-12 border-0 rounded-2xl focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: `1px solid var(--border-color)`
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                    >
                      <Smile className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  </div>

                  {/* Кнопка відправки */}
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:hover:scale-100"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-color)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Виберіть розмову</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Оберіть розмову зліва, щоб почати спілкування</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesTab
