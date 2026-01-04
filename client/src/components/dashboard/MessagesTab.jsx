import { MessageSquare, Send, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const MessagesTab = ({ messagesData, messagesLoading, onSendMessage, onMarkAsRead }) => {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')

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
  }

  if (messagesLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)]">
          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Розмови ({messagesData?.conversations?.length || 0})
          </h3>
        </div>
        <div className="overflow-y-auto h-full">
          {messagesData?.conversations?.length > 0 ? (
            messagesData.conversations.map((conversation) => (
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
                  {conversation.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {conversation.otherUser.email}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {conversation.lastMessage.content}
                </p>
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
      <div className="lg:col-span-2 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <div>
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {selectedConversation.property.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {selectedConversation.otherUser.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
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
                    <p className="text-sm">{message.content}</p>
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
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[var(--border-color)]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введіть повідомлення..."
                  className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
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
