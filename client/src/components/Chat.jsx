import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Send, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

export default function Chat({ propertyId, hostId, hostEmail }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef(null)

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', propertyId],
    queryFn: async () => {
      const response = await api.get(`/messages/property/${propertyId}`)
      return response.data.messages
    },
    enabled: isOpen && !!user,
    refetchInterval: 3000, // Refresh every 3 seconds
  })

  const { data: participants } = useQuery({
    queryKey: ['participants', propertyId],
    queryFn: async () => {
      const response = await api.get(`/messages/property/${propertyId}/participants`)
      return response.data.participants
    },
    enabled: isOpen && !!user,
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      // If user is host, find a guest from participants
      // If user is guest, send to host
      let receiverId = hostId
      if (user.id === hostId) {
        // Host sending message - find first guest from participants
        const guest = participants?.find((p) => p.id !== hostId)
        if (guest) {
          receiverId = guest.id
        } else {
          // No guests yet
          alert('Немає гостей для спілкування')
          return
        }
      }
      
      const response = await api.post('/messages', {
        propertyId,
        receiverId,
        content,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', propertyId])
      setMessage('')
    },
  })

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim() || !user) return
    sendMessageMutation.mutate(message)
  }

  if (!user) return null

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center space-x-2"
        >
          <MessageCircle className="h-6 w-6" />
          <span>Чат</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col h-[500px]">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Чат з власником</h3>
              <p className="text-sm text-blue-100">{hostEmail}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="text-center text-gray-500">Завантаження...</div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.senderId === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('uk-UA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                Немає повідомлень. Почніть розмову!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Напишіть повідомлення..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

