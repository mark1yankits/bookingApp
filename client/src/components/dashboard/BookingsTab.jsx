import { Calendar, DollarSign, Clock, CheckCircle, XCircle, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const BookingsTab = ({ bookings, bookingsLoading, onCancelBooking, onUpdateBookingStatus, getStatusIcon, getStatusText, isHost = false }) => {
  if (bookingsLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
        {isHost ? 'Запитів на бронювання немає' : 'У вас немає бронювань'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-[var(--bg-tertiary)] rounded-lg shadow-md p-6 border border-[var(--border-color)] hover-lift"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Link
                to={`/property/${booking.propertyId}`}
                className="text-xl font-semibold hover-lift transition-colors duration-200"
                style={{ color: 'var(--accent-color)' }}
              >
                {booking.property.title}
              </Link>
              <p className="text-[var(--text-secondary)] mt-1">{booking.property.location}</p>
              {isHost && booking.user && (
                <p className="text-[var(--text-secondary)] mt-1 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Гість: {booking.user.name || booking.user.email}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(booking.startDate).toLocaleDateString('uk-UA')} -
                  {new Date(booking.endDate).toLocaleDateString('uk-UA')}
                </span>
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {booking.totalPrice} ₴
                </span>
              </div>
              {/* TODO: Show cancellation reason when field is available */}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {getStatusIcon(booking.status)}
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{getStatusText(booking.status)}</span>
              {isHost && booking.status === 'pending' && onUpdateBookingStatus && (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onUpdateBookingStatus(booking.id, 'confirmed')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Підтвердити
                  </button>
                  <button
                    onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Відхилити
                  </button>
                </div>
              )}
              {!isHost && booking.status === 'pending' && (
                <button
                  onClick={() => onCancelBooking(booking.id)}
                  className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Скасувати
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BookingsTab
