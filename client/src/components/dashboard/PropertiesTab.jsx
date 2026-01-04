import { Home, Plus, MapPin, Upload, X } from 'lucide-react'
import { useState } from 'react'

const PropertiesTab = ({ myProperties, propertiesLoading, onPropertySubmit }) => {
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    country: 'Україна',
    type: 'Квартира',
    bedrooms: '1',
    bathrooms: '1',
    maxGuests: '2',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: '',
    rules: '',
    images: [],
    imageFiles: []
  })
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setPropertyForm(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...files],
        images: [...prev.images, ...files.map(file => URL.createObjectURL(file))]
      }))
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files)
      setPropertyForm(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...files],
        images: [...prev.images, ...files.map(file => URL.createObjectURL(file))]
      }))
    }
  }

  const removeImage = (index) => {
    setPropertyForm(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!propertyForm.title || !propertyForm.description || !propertyForm.price || !propertyForm.location) {
      alert('Будь ласка, заповніть всі обов\'язкові поля')
      return
    }

    // Validate price
    const price = parseFloat(propertyForm.price)
    if (isNaN(price) || price <= 0) {
      alert('Будь ласка, введіть коректну ціну')
      return
    }

    if (propertyForm.imageFiles.length === 0) {
      alert('Додайте хоча б одне зображення')
      return
    }

    onPropertySubmit(propertyForm)
  }

  const countries = [
    'Україна',
    'Іспанія',
    'Франція',
    'Італія',
    'Португалія',
    'Греція',
    'Туреччина',
    'Хорватія',
    'Польща',
    'Чехія'
  ]

  const propertyTypes = [
    'Квартира',
    'Будинок',
    'Апартаменти',
    'Студія',
    'Вілла',
    'Котедж'
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Home className="w-6 h-6" />
          Моя нерухомість
        </h2>
        <button
          onClick={() => setShowPropertyForm(!showPropertyForm)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover-lift transition-all duration-300"
          style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
        >
          <Plus className="h-5 w-5" />
          <span>Додати нерухомість</span>
        </button>
      </div>

      {/* Properties List */}
      {propertiesLoading ? (
        <div className="text-center py-8">
          <div className="text-lg">Завантаження...</div>
        </div>
      ) : myProperties && myProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {myProperties.map((property) => (
            <div
              key={property.id}
              className="bg-[var(--bg-tertiary)] rounded-lg shadow-md overflow-hidden border border-[var(--border-color)] hover-lift"
            >
              <div className="relative">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0].startsWith('http') ? property.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${property.images[0]}`}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Немає зображення</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-[var(--bg-primary)] px-3 py-1 rounded-full text-sm border border-[var(--border-color)]" style={{ color: 'var(--text-secondary)' }}>
                    {property.type}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{property.title}</h3>
                <p className="text-[var(--text-secondary)] mb-4 line-clamp-2">{property.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{property.pricePerNight} ₴</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>за ніч</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          У вас немає нерухомості
        </div>
      )}

      {showPropertyForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xl mb-4" style={{ color: 'var(--text-primary)' }}>Нова нерухомість</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Назва *
              </label>
              <input
                type="text"
                value={propertyForm.title}
                onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                placeholder="Сучасна квартира в центрі міста"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Опис *
              </label>
              <textarea
                value={propertyForm.description}
                onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                placeholder="Детальний опис вашої нерухомості..."
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Ціна за ніч (₴) *
              </label>
              <input
                type="number"
                value={propertyForm.price}
                onChange={(e) => setPropertyForm({ ...propertyForm, price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                placeholder="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Розташування *
              </label>
              <input
                type="text"
                value={propertyForm.location}
                onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                placeholder="Київ, вул. Хрещатик, 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Країна
              </label>
              <select
                value={propertyForm.country}
                onChange={(e) => setPropertyForm({ ...propertyForm, country: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Тип нерухомості
              </label>
              <select
                value={propertyForm.type}
                onChange={(e) => setPropertyForm({ ...propertyForm, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Спальні
              </label>
              <select
                value={propertyForm.bedrooms}
                onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Ванні кімнати
              </label>
              <select
                value={propertyForm.bathrooms}
                onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Максимум гостей
              </label>
              <select
                value={propertyForm.maxGuests}
                onChange={(e) => setPropertyForm({ ...propertyForm, maxGuests: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Час заїзду
              </label>
              <input
                type="time"
                value={propertyForm.checkInTime}
                onChange={(e) => setPropertyForm({ ...propertyForm, checkInTime: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Час виїзду
              </label>
              <input
                type="time"
                value={propertyForm.checkOutTime}
                onChange={(e) => setPropertyForm({ ...propertyForm, checkOutTime: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Зручності (через кому)
              </label>
              <input
                type="text"
                value={propertyForm.amenities}
                onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                placeholder="Wi-Fi, Кондиціонер, Парковка"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Правила дому (через кому)
              </label>
              <input
                type="text"
                value={propertyForm.rules}
                onChange={(e) => setPropertyForm({ ...propertyForm, rules: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--bg-primary)]"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                placeholder="Немає куріння, Немає домашніх тварин"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Зображення *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{ borderColor: dragActive ? 'var(--accent-color)' : 'var(--border-color)' }}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Перетягніть зображення сюди або{' '}
                  <label className="text-blue-600 cursor-pointer hover:underline">
                    оберіть файли
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </p>
              </div>

              {propertyForm.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {propertyForm.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg transition-all duration-300 hover-lift"
              style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
            >
              Створити нерухомість
            </button>
            <button
              type="button"
              onClick={() => setShowPropertyForm(false)}
              className="px-6 py-2 border rounded-lg transition-colors duration-200"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Скасувати
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default PropertiesTab
