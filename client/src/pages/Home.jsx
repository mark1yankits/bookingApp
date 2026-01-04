import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

const popularLocations = [
  'Київ',
  'Львів',
  'Одеса',
  'Харків',
  'Дніпро',
  'Карпати',
  'Яремче',
  'Буковель',
  'Івано-Франківськ',
  'Тернопіль'
]

export default function Home() {
  const { user } = useAuth()
  const [searchLocation, setSearchLocation] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedGuests, setSelectedGuests] = useState(1)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

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

  const locationSuggestions = useMemo(() => {
    if (!searchLocation) return []
    return popularLocations.filter(loc =>
      loc.toLowerCase().includes(searchLocation.toLowerCase())
    )
  }, [searchLocation])

  const filteredProperties = useMemo(() => {
    let filtered = properties

    // Фільтр за локацією
    if (searchLocation) {
      filtered = filtered.filter(p =>
        p.location.toLowerCase().includes(searchLocation.toLowerCase())
      )
    }

    // Фільтр за ціною
    if (minPrice) {
      filtered = filtered.filter(p => p.pricePerNight >= parseInt(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.pricePerNight <= parseInt(maxPrice))
    }

    // Фільтр за типом (якщо є)
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType)
    }

    // Фільтр за кількістю гостей
    filtered = filtered.filter(p => (p.maxGuests || 4) >= selectedGuests)

    return filtered
  }, [properties, searchLocation, minPrice, maxPrice, selectedType, selectedGuests])

  const propertyTypes = useMemo(() => {
    const types = new Set(properties.map(p => p.type || 'Будинок'))
    return ['all', ...Array.from(types)]
  }, [properties])

  return (
    <div>
      {/* Hero секція */}
      <section className="bg-gradient-primary text-white py-20 theme-transition">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-5xl mb-6 animate-fade-in">Знайдіть ідеальне житло для оренди</h1>
            <p className="text-xl opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Тисячі перевірених варіантів житла в Україні та за кордоном.
              Бронюйте безпечно та зручно.
            </p>
          </div>

          {/* Пошукова панель */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg shadow-theme-lg p-6 max-w-5xl mx-auto border border-[var(--border-color)] animate-slide-in" style={{ animationDelay: '0.4s' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Місцезнаходження */}
              <div className="relative lg:col-span-2">
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Місцезнаходження
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Куди плануєте поїхати?"
                    className="input-primary"
                  />
                </div>
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg mt-1 shadow-theme-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((loc, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchLocation(loc)
                          setShowSuggestions(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[var(--bg-secondary)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <MapPin className="inline w-4 h-4 mr-2" style={{ color: 'var(--text-muted)' }} />
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Мінімальна ціна */}
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Від (₴)
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="500"
                  className="input-primary"
                />
              </div>

              {/* Максимальна ціна */}
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  До (₴)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="3000"
                  className="input-primary"
                />
              </div>

              {/* Кнопка пошуку */}
              <div className="flex items-end">
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Пошук
                </button>
              </div>
            </div>

            {/* Додаткові фільтри */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              {/* Тип житла */}
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Тип житла
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input-primary"
                >
                  <option value="all">Всі типи</option>
                  {propertyTypes.filter(t => t !== 'all').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Кількість гостей */}
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Кількість гостей
                </label>
                <select
                  value={selectedGuests}
                  onChange={(e) => setSelectedGuests(parseInt(e.target.value))}
                  className="input-primary"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'гість' : num < 5 ? 'гостя' : 'гостей'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Порожнє місце або інші фільтри */}
              <div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Сітка нерухомості */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl text-gray-900">
            Доступне житло
          </h2>
          <p className="text-gray-600">
            Знайдено {filteredProperties.length} {filteredProperties.length === 1 ? 'варіант' : filteredProperties.length < 5 ? 'варіанти' : 'варіантів'}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg">Завантаження...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Помилка завантаження нерухомості
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              На жаль, нічого не знайдено за вашими критеріями
            </p>
            <p className="text-gray-500 mt-2">
              Спробуйте змінити фільтри пошуку
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="relative">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={
                        property.images[0].startsWith('http')
                          ? property.images[0]
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`
                      }
                      alt={property.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => window.location.href = `/property/${property.id}`}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <span className="text-gray-400">Немає зображення</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm text-gray-700">
                    {property.type || 'Будинок'}
                  </div>
                </div>

                <div className="p-6" onClick={() => window.location.href = `/property/${property.id}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl text-gray-900 flex-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-700">
                        {(property.rating || 4.8).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({property.reviewCount || 12})
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex gap-4">
                      <span>{property.bedrooms || 2} спальні</span>
                      <span>{property.bathrooms || 1} ванні</span>
                      <span>до {property.maxGuests || 4} гостей</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-2xl text-gray-900">{property.pricePerNight} ₴</span>
                      <span className="text-gray-600"> / ніч</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

