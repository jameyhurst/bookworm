import { useState, useEffect, useCallback } from 'react'
import { Compass, RefreshCw, Loader2, Settings, BookOpenCheck } from 'lucide-react'

interface Recommendation {
  title: string
  author: string
  reason: string
}

interface DiscoverViewProps {
  onOpenSettings: () => void
}

export function DiscoverView({ onOpenSettings }: DiscoverViewProps): JSX.Element {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  const fetchRecommendations = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const recs = await window.api.getRecommendations()
      setRecommendations(recs)
      setHasLoaded(true)
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    window.api.getSettings().then((settings) => {
      const keyExists = !!settings.claudeApiKey
      setHasApiKey(keyExists)
      if (keyExists) fetchRecommendations()
    })
  }, [fetchRecommendations])

  if (hasApiKey === null) return <div />

  if (!hasApiKey && !hasLoaded && !loading && !error) {
    return (
      <div className="discover-empty">
        <Compass size={48} strokeWidth={1.2} />
        <h2>Discover Your Next Read</h2>
        <p>Get personalized book recommendations powered by Claude, based on your reading history, ratings, and reviews.</p>
        <div className="discover-empty-actions">
          <button className="btn-primary" onClick={fetchRecommendations}>
            <BookOpenCheck size={16} />
            Get Recommendations
          </button>
          <button className="btn-secondary" onClick={onOpenSettings}>
            <Settings size={14} />
            API Key Settings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="discover-view">
      <div className="discover-header">
        <h2 className="discover-title">Recommended for You</h2>
        <button
          className="btn-secondary discover-refresh"
          onClick={fetchRecommendations}
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className="search-spinner" /> : <RefreshCw size={14} />}
          {loading ? 'Thinking...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="discover-error">
          <p>{error}</p>
          {error.includes('API key') && (
            <button className="btn-secondary" onClick={onOpenSettings}>
              <Settings size={14} />
              Open Settings
            </button>
          )}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendation-list">
          {recommendations.map((rec, i) => (
            <div key={i} className="recommendation-card">
              <div className="recommendation-number">{i + 1}</div>
              <div className="recommendation-content">
                <h3 className="recommendation-title">{rec.title}</h3>
                <p className="recommendation-author">{rec.author}</p>
                <p className="recommendation-reason">{rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
