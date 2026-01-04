import { Bed, Bath, Users, Clock, Star, MapPin } from 'lucide-react'

const PropertyInfo = ({ property, reviewsData }) => {
  const rating = reviewsData && reviewsData.length > 0
    ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
    : (property.rating || 0).toFixed(1)

  const reviewCount = reviewsData ? reviewsData.length : property.reviewCount || 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{property.location}</span>
            {property.country && <span className="ml-2 text-gray-500">• {property.country}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-xl text-gray-900">{rating}</span>
          <span className="text-gray-600">({reviewCount} відгуків)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Bed className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Спальні</p>
            <p className="text-lg text-gray-900">{property.bedrooms || 2}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Bath className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Ванні</p>
            <p className="text-lg text-gray-900">{property.bathrooms || 1}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Гостей</p>
            <p className="text-lg text-gray-900">до {property.maxGuests || 4}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Заїзд/Виїзд</p>
            <p className="text-sm text-gray-900">{property.checkInTime || '15:00'}/{property.checkOutTime || '11:00'}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl text-gray-900 mb-3">Опис</h2>
        <p className="text-gray-600 leading-relaxed">{property.description}</p>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl text-gray-900 mb-3">Зручності</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl text-gray-900 mb-3">Правила дому</h2>
        <div className="space-y-2">
          {(property.rules || ['Немає куріння', 'Немає домашніх тварин', 'Без вечірок']).map((rule, index) => (
            <div key={index} className="flex items-start gap-2 text-gray-700">
              <div className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PropertyInfo
