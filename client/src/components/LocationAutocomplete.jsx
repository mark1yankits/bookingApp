import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Loader2} from 'lucide-react'
import axios from 'axios'
import api from '../api/api'

const GEOAPIFY_KEY = "fe7a068266114c29b845127a734fbc83";

export default function LocationAutocomplete({ value, onChange, placeholder = "Місцезнаходження" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [debouncedValue, setDebouncedValue] = useState(value)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['locationSuggestions', debouncedValue],
    queryFn: async () => {
      if (!debouncedValue || debouncedValue.length < 2) return []
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(debouncedValue)}&type=city&lang=uk&limit=10&apiKey=${GEOAPIFY_KEY}`;
      const response = await axios.get(url);

        return response.data.features.map(f => ({
        name: f.properties.city || f.properties.name,
        country: f.properties.country,
        displayName: f.properties.formatted, 
        lat: f.properties.lat,
        lon: f.properties.lon
      }));
    },
    enabled: Boolean(debouncedValue && debouncedValue.length >= 2),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Popular destinations to show when input is empty
  const popularDestinations = useMemo(() => [
    { name: 'Київ', country: 'Україна', displayName: 'Київ, Україна' },
    { name: 'Львів', country: 'Україна', displayName: 'Львів, Україна' },
    { name: 'Одеса', country: 'Україна', displayName: 'Одеса, Україна' },
    { name: 'Карпати', country: 'Україна', displayName: 'Карпати, Україна' },
    { name: 'Дніпро', country: 'Україна', displayName: 'Дніпро, Україна' },
    { name: 'Харків', country: 'Україна', displayName: 'Харків, Україна' },
    { name: 'Barcelona', country: 'Іспанія', displayName: 'Барселона, Іспанія' },
    { name: 'Madrid', country: 'Іспанія', displayName: 'Мадрид, Іспанія' },
    { name: 'Paris', country: 'Франція', displayName: 'Париж, Франція' },
    { name: 'Rome', country: 'Італія', displayName: 'Рим, Італія' },
    { name: 'Berlin', country: 'Німеччина', displayName: 'Берлін, Німеччина' },
    { name: 'Amsterdam', country: 'Нідерланди', displayName: 'Амстердам, Нідерланди' },
  ], [])

  const locations = suggestions || []
  const showPopular = !debouncedValue || debouncedValue.length < 2
  const displayLocations = showPopular ? popularDestinations : locations

  useEffect(() => {
    setSelectedIndex(-1)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          listRef.current && !listRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsOpen(true)
  }

  const handleKeyDown = (e) => {
    if (!isOpen || displayLocations.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => prev < displayLocations.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(displayLocations[selectedIndex])
        } else {
          // Close dropdown if no selection
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelect = (location) => {
    onChange(location.displayName)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  return (
    <div className="relative flex-1">
      <div className="flex items-center space-x-2">
        <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className="flex-1 outline-none text-gray-800 placeholder-gray-500"
          autoComplete="off"
        />
      </div>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {showPopular && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Популярні напрямки
                </span>
              </div>
              {displayLocations.map((location, index) => (
                <button
                  key={`${location.name}-${location.country}`}
                  onClick={() => handleSelect(location)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                    index === selectedIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{location.displayName}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {!showPopular && (
            <>
              {isLoading ? (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  Пошук місць...
                </div>
              ) : displayLocations.length > 0 ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Результати пошуку
                    </span>
                  </div>
                  {displayLocations.map((location, index) => (
                    <button
                      key={`${location.name}-${location.country}`}
                      onClick={() => handleSelect(location)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                        index === selectedIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{location.displayName}</span>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  Місця не знайдені
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
