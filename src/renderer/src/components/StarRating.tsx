import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number | null
  onRate?: (rating: number | null) => void
  size?: number
}

export function StarRating({ rating, onRate, size = 18 }: StarRatingProps): JSX.Element {
  const [hovered, setHovered] = useState<number | null>(null)
  const interactive = !!onRate

  const displayRating = hovered ?? rating ?? 0

  const handleClick = (star: number): void => {
    if (!onRate) return
    // Click same star to clear
    onRate(star === rating ? null : star)
  }

  const ratingLevel = displayRating === 0 ? 0 : displayRating <= 2 ? 1 : displayRating <= 4 ? 2 : 3

  return (
    <div
      className={`star-rating${interactive ? ' interactive' : ''}`}
      data-level={ratingLevel}
      onMouseLeave={() => interactive && setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn${star <= displayRating ? ' filled' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          disabled={!interactive}
          tabIndex={interactive ? 0 : -1}
        >
          <Star
            size={size}
            fill={star <= displayRating ? 'currentColor' : 'none'}
            stroke={star <= displayRating ? 'currentColor' : 'var(--text-muted)'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}
