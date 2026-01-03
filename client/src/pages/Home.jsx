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
    <div className="animate-fade-in">
      {/* Hero секція */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 animate-slide-in">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-5xl mb-6">Знайдіть ідеальне житло для оренди</h1>
            <p className="text-xl opacity-90">
              Тисячі перевірених варіантів житла в Україні та за кордоном.
              Бронюйте безпечно та зручно.
            </p>
          </div>

          {/* Пошукова панель */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg shadow-lg p-6 max-w-5xl mx-auto border border-[var(--border-color)] hover-lift">
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
                    className="w-full pl-10 pr-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                    style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
                    placeholder="Куди плануєте поїхати?"
                  />
                </div>
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((loc, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchLocation(loc)
                          setShowSuggestions(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <MapPin className="inline w-4 h-4 mr-2 text-gray-400" />
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
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
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
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
                />
              </div>

              {/* Кнопка пошуку */}
              <div className="flex items-end">
                <button
                  className="w-full px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover-lift"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}
                >
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
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
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
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className="bg-[var(--bg-tertiary)] rounded-lg shadow-md overflow-hidden hover-lift cursor-pointer group border border-[var(--border-color)]"
                style={{ animationDelay: `${index * 100}ms` }}
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

                  <div className="absolute bottom-4 left-4 bg-[var(--bg-primary)] px-3 py-1 rounded-full text-sm border border-[var(--border-color)]" style={{ color: 'var(--text-secondary)' }}>
                    {property.type || 'Будинок'}
                  </div>
                </div>

                <div className="p-6" onClick={() => window.location.href = `/property/${property.id}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl flex-1" style={{ color: 'var(--text-primary)' }}>
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {(property.rating || 4.8).toFixed(1)}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        ({property.reviewCount || 12})
                      </span>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {property.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex gap-4">
                      <span>{property.bedrooms || 2} спальні</span>
                      <span>{property.bathrooms || 1} ванні</span>
                      <span>до {property.maxGuests || 4} гостей</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                      <span className="text-2xl" style={{ color: 'var(--text-primary)' }}>{property.pricePerNight} ₴</span>
                      <span style={{ color: 'var(--text-secondary)' }}> / ніч</span>
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

