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
    <div className="card mt-6">
      <div className="flex justify-between items-center mb-6 p-4">
        <h2 className="text-2xl flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <MessageSquare className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
          Відгуки
        </h2>
        {canAddReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}
          >
            <MessageSquare className="w-4 h-4" />
            Додати відгук
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showReviewForm && (
        <form onSubmit={handleCreateReview} className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Залишити відгук</h3>

          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Оцінка</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="text-2xl focus:outline-none"
                >
                  <Star
                    className="w-6 h-6"
                    style={{
                      color: star <= newReview.rating ? '#fbbf24' : 'var(--text-muted)',
                      fill: star <= newReview.rating ? '#fbbf24' : 'none'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Коментар</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                '--tw-ring-color': 'var(--accent-color)'
              }}
              placeholder="Розкажіть про ваш досвід..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}
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
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--text-muted)', color: 'white' }}
            >
              Скасувати
            </button>
          </div>
        </form>
      )}

      {/* Edit Review Form */}
      {editingReview && (
        <form onSubmit={handleUpdateReview} className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Редагувати відгук</h3>

          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Оцінка</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditingReview({ ...editingReview, rating: star })}
                  className="text-2xl focus:outline-none"
                >
                  <Star
                    className="w-6 h-6"
                    style={{
                      color: star <= editingReview.rating ? '#fbbf24' : 'var(--text-muted)',
                      fill: star <= editingReview.rating ? '#fbbf24' : 'none'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Коментар</label>
            <textarea
              value={editingReview.comment || ''}
              onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                '--tw-ring-color': 'var(--accent-color)'
              }}
              placeholder="Оновіть ваш коментар..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}
            >
              <Send className="w-4 h-4" />
              Оновити
            </button>
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--text-muted)', color: 'white' }}
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
            <div key={review.id} className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)', border: `1px solid var(--border-color)` }}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
                    <span className="font-semibold">
                      {(review.user?.name || review.user?.email)?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {review.user?.name || (review.user?.email ? review.user.email.split('@')[0] : 'Користувач')}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4"
                          style={{
                            color: star <= review.rating ? '#fbbf24' : 'var(--text-muted)',
                            fill: star <= review.rating ? '#fbbf24' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {(user?.id === review.userId || user?.role === 'admin') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingReview(review)}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Ви впевнені, що хочете видалити цей відгук?')) {
                          onDeleteReview(review.id)
                        }
                      }}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--error-color)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {review.comment && (
                <p className="mb-2" style={{ color: 'var(--text-primary)' }}>{review.comment}</p>
              )}

              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {new Date(review.createdAt).toLocaleDateString('uk-UA')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Поки що немає відгуків</p>
          {canAddReview && (
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Будьте першим, хто залишить відгук!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default PropertyReviews
