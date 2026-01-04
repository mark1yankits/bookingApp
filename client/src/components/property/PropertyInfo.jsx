import { Bed, Bath, Users, Clock, Star, MapPin, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PropertyInfo = ({ property, reviewsData }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const rating = reviewsData && reviewsData.length > 0
    ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
    : (property.rating || 0).toFixed(1)

  const reviewCount = reviewsData ? reviewsData.length : property.reviewCount || 0

  return (
    <div className="card p-6 mb-6 animate-slide-in" style={{ animationDelay: '0.4s' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>{property.title}</h1>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <MapPin className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
            <span>{property.location}</span>
            {property.country && <span className="ml-2" style={{ color: 'var(--text-muted)' }}>• {property.country}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <Star className="w-5 h-5" style={{ color: '#fbbf24', fill: '#fbbf24' }} />
          <span className="text-xl" style={{ color: 'var(--text-primary)' }}>{rating}</span>
          <span style={{ color: 'var(--text-secondary)' }}>({reviewCount} відгуків)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Bed className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Спальні</p>
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{property.bedrooms || 2}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Bath className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ванні</p>
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{property.bathrooms || 1}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Users className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Гостей</p>
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>до {property.maxGuests || 4}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Clock className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Заїзд/Виїзд</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{property.checkInTime || '15:00'}/{property.checkOutTime || '11:00'}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl mb-3" style={{ color: 'var(--text-primary)' }}>Опис</h2>
        <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{property.description}</p>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl mb-3" style={{ color: 'var(--text-primary)' }}>Зручності</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl mb-3" style={{ color: 'var(--text-primary)' }}>Правила дому</h2>
        <div className="space-y-2">
          {(property.rules || ['Немає куріння', 'Немає домашніх тварин', 'Без вечірок']).map((rule, index) => (
            <div key={index} className="flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-color)' }} />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {user && (
        <div className="pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => navigate(`/dashboard?tab=messages&propertyId=${property.id}`)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Написати господарю
          </button>
        </div>
      )}
    </div>
  )
}

export default PropertyInfo
