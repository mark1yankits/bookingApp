import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const PropertyImageGallery = ({ images, title }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const nextImage = () => {
    if (images && images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (images && images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      )
    }
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const getImageUrl = (imagePath) => {
    return imagePath.startsWith('http')
      ? imagePath
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imagePath}`
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
        <span className="text-gray-400">Немає зображення</span>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Main Image */}
      <div className="relative mb-4">
        <img
          src={getImageUrl(images[selectedImageIndex])}
          alt={`${title} - зображення ${selectedImageIndex + 1}`}
          className="w-full h-96 object-cover rounded-lg shadow-lg"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all hover:scale-110"
              aria-label="Попереднє зображення"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all hover:scale-110"
              aria-label="Наступне зображення"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={getImageUrl(image)}
                alt={`${title} - мініатюра ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedImageIndex === index && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      <div className="mt-2 text-sm text-gray-600 text-center">
        {selectedImageIndex + 1} з {images.length}
      </div>
    </div>
  )
}

export default PropertyImageGallery
