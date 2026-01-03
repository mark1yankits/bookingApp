import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import LocationAutocomplete from '../components/LocationAutocomplete'

export default function Home() {
  const [searchLocation, setSearchLocation] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', searchLocation, minPrice, maxPrice],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchLocation) params.append('location', searchLocation)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)

      const response = await api.get(`/properties?${params.toString()}`)
      return response.data.properties
    },
  })

  const properties = data || []

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Знайдіть ідеальне житло для оренди
          </h1>
          <p className="text-xl mb-8">
            Відкрийте для себе найкращі пропозиції оренди житла
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-4">
            <LocationAutocomplete
              value={searchLocation}
              onChange={setSearchLocation}
              placeholder="Місцезнаходження"
            />
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Мін. ціна"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded outline-none text-gray-800"
              />
              <input
                type="number"
                placeholder="Макс. ціна"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded outline-none text-gray-800"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Пошук</span>
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg">Завантаження...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Помилка завантаження нерухомості
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">
              Нерухомість не знайдена
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {property.images && property.images.length > 0 ? (
                  <img
                    src={
                      property.images[0].startsWith('http')
                        ? property.images[0]
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`
                    }
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Немає зображення</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {property.location}
                    </span>
                    <span className="text-blue-600 font-bold text-lg">
                      {property.pricePerNight} ₴/ніч
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

