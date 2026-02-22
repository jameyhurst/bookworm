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

  return (
    <div
      className={`star-rating${interactive ? ' interactive' : ''}`}
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
            fill={star <= displayRating ? 'var(--warning)' : 'none'}
            stroke={star <= displayRating ? 'var(--warning)' : 'var(--text-muted)'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}
