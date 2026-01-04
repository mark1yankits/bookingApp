import { MessageSquare, Send, Edit, Trash2, Star } from 'lucide-react'
import { useState } from 'react'

const PropertyReviews = ({
  reviewsData,
  reviewsLoading,
  user,
  onCreateReview,
  onUpdateReview,
  onDeleteReview
}) => {
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)

  const handleCreateReview = (e) => {
    e.preventDefault()
    if (!user) {
      alert('Будь ласка, увійдіть для додавання відгуку')
      return
    }

    onCreateReview({
      rating: newReview.rating,
      comment: newReview.comment,
    })

    setNewReview({ rating: 5, comment: '' })
    setShowReviewForm(false)
  }

  const handleUpdateReview = (e) => {
    e.preventDefault()
    if (!editingReview) return

    onUpdateReview({
      reviewId: editingReview.id,
      rating: editingReview.rating,
      comment: editingReview.comment,
    })

    setEditingReview(null)
  }

  const userReview = reviewsData?.find(review => review.userId === user?.id)
  const canAddReview = user && !userReview

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Відгуки
        </h2>
        {canAddReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Додати відгук
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showReviewForm && (
        <form onSubmit={handleCreateReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg text-gray-900 mb-4">Залишити відгук</h3>

          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Оцінка</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="text-2xl focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= newReview.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Коментар</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Розкажіть про ваш досвід..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Надіслати
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false)
                setNewReview({ rating: 5, comment: '' })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}

      {/* Edit Review Form */}
      {editingReview && (
        <form onSubmit={handleUpdateReview} className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg text-gray-900 mb-4">Редагувати відгук</h3>

          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Оцінка</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditingReview({ ...editingReview, rating: star })}
                  className="text-2xl focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= editingReview.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Коментар</label>
            <textarea
              value={editingReview.comment || ''}
              onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Оновіть ваш коментар..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Оновити
            </button>
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="text-center py-8">
          <div className="text-lg">Завантаження відгуків...</div>
        </div>
      ) : reviewsData && reviewsData.length > 0 ? (
        <div className="space-y-4">
          {reviewsData.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {review.user?.email?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">
                      {review.user?.email || 'Користувач'}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {(user?.id === review.userId || user?.role === 'admin') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingReview(review)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Ви впевнені, що хочете видалити цей відгук?')) {
                          onDeleteReview(review.id)
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-2">{review.comment}</p>
              )}

              <p className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('uk-UA')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Поки що немає відгуків</p>
          {canAddReview && (
            <p className="text-sm text-gray-500 mt-2">
              Будьте першим, хто залишить відгук!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default PropertyReviews
