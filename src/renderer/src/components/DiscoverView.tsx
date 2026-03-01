import { useState, useEffect, useCallback, useRef } from 'react'
import { Compass, RefreshCw, Loader2, Settings, BookOpenCheck, Plus, CheckCircle, Sparkles, KeyRound, BookOpen, AlertCircle } from 'lucide-react'
import { Book } from '../App'
import type { AddBookMeta } from './AddBookModal'

interface Recommendation {
  title: string
  author: string
  reason: string
}

interface DiscoverViewProps {
  onOpenSettings: () => void
  onAddBook: (book: Omit<Book, 'id' | 'bookId' | 'dateAdded' | 'dateFinished'>, meta?: AddBookMeta) => Promise<string | null>
  existingBooks: Book[]
  cachedRecs?: Recommendation[] | null
  onRecsLoaded?: (recs: Recommendation[]) => void
}

function sanitizeError(msg: string): string {
  // Strip Electron IPC wrapper: "Error invoking remote method '...': Error: ..."
  const ipcMatch = msg.match(/Error invoking remote method '[^']+': (?:Error: )?(.+)/)
  return ipcMatch ? ipcMatch[1] : msg
}

const LUCKY_ANGLES = [
  'books by Japanese or Korean authors',
  'Latin American literature or magical realism',
  'Scandinavian or Nordic fiction',
  'books published in the last 2 years',
  'overlooked classics from before 1970',
  'hidden gems from the 1980s or 1990s',
  'books with unconventional narrative structures',
  'darkly funny or satirical novels',
  'novellas or short books under 200 pages',
  'short story collections',
  'debut novels',
  'books about food, cooking, or meals',
  'books set in the natural world or wilderness',
  'books about music, art, or creative obsession',
  'books exploring solitude or inner life',
  'translated fiction originally written in a language other than English',
  'African literature',
  'books from the Middle East or South Asia',
  'genre-bending books that defy easy categorization',
  'books featuring unreliable narrators',
  'epistolary novels or books told through documents',
  'books about journeys, travel, or displacement',
  'lesser-known works by well-known authors',
  'cult favorites with a devoted following',
  'books set in a single day or a very short timespan',
  'books with an ensemble cast or multiple POVs',
  'historical fiction set somewhere unexpected',
  'speculative fiction that feels literary',
  'memoir or creative nonfiction with novelistic prose',
  'books that blur the line between fiction and nonfiction'
]

const MOOD_CHIPS = [
  { label: 'Cozy', prompt: 'cozy, comforting, warm reads' },
  { label: 'Mind-Bending', prompt: 'mind-bending, thought-provoking, intellectually challenging' },
  { label: 'Page-Turners', prompt: 'fast-paced page-turners that are hard to put down' },
  { label: 'Literary Fiction', prompt: 'literary fiction with beautiful prose' },
  { label: 'Nonfiction', prompt: 'nonfiction — science, history, biography, essays' },
  { label: 'Fantasy & Sci-Fi', prompt: 'fantasy and science fiction' },
  { label: 'Dark & Gritty', prompt: 'dark, gritty, noir, or morally complex' },
  { label: 'Short Reads', prompt: 'short books under 250 pages' }
]

export function DiscoverView({ onOpenSettings, onAddBook, existingBooks, cachedRecs, onRecsLoaded }: DiscoverViewProps): JSX.Element {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(cachedRecs || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(!!cachedRecs?.length)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [addingRec, setAddingRec] = useState<number | null>(null)
  const [promptInput, setPromptInput] = useState('')
  const [activePrompt, setActivePrompt] = useState<string | undefined>(undefined)
  const booksRef = useRef(existingBooks)
  booksRef.current = existingBooks

  const isInLibrary = useCallback((title: string, author: string): boolean => {
    const normTitle = title.trim().toLowerCase()
    const normAuthor = author.trim().toLowerCase()
    return existingBooks.some((b) => {
      return b.title.trim().toLowerCase() === normTitle && b.author.trim().toLowerCase() === normAuthor
    })
  }, [existingBooks])

  const fetchRecommendations = useCallback(async (userPrompt?: string): Promise<void> => {
    setLoading(true)
    setError(null)
    setActivePrompt(userPrompt)
    try {
      const recs = await window.api.getRecommendations(userPrompt)
      // Filter out books already in the user's library (safety net for prompt instruction)
      const fresh = recs.filter((r) => {
        const t = r.title.trim().toLowerCase()
        const a = r.author.trim().toLowerCase()
        return !booksRef.current.some((b) =>
          b.title.trim().toLowerCase() === t && b.author.trim().toLowerCase() === a
        )
      })
      setRecommendations(fresh)
      setHasLoaded(true)
      onRecsLoaded?.(fresh)
    } catch (err: any) {
      setError(sanitizeError(err.message || 'Failed to get recommendations.'))
    } finally {
      setLoading(false)
    }
  }, [onRecsLoaded])

  useEffect(() => {
    if (cachedRecs?.length) return
    window.api.getSettings().then((settings) => {
      const keyExists = !!settings.claudeApiKey
      setHasApiKey(keyExists)
      if (keyExists) fetchRecommendations()
    })
  }, [fetchRecommendations, cachedRecs])

  const handleAddFromRec = async (rec: Recommendation, index: number): Promise<void> => {
    if (addingRec !== null) return
    setAddingRec(index)

    try {
      // Search Open Library for cover and metadata
      const results = await window.api.search(`${rec.title} ${rec.author}`)
      const match = results[0]

      const error = await onAddBook({
        title: rec.title,
        author: rec.author,
        status: 'want-to-read',
        rating: null,
        review: null,
        tags: [],
        coverId: null,
        summary: null,
        dateRead: null
      }, match ? {
        openLibraryCoverId: match.coverId ?? undefined,
        olKey: match.olKey
      } : undefined)

      if (error) {
        setError(error)
      }
    } catch {
      setError('Failed to add book.')
    } finally {
      setAddingRec(null)
    }
  }

  const handleChipClick = (prompt: string): void => {
    if (loading) return
    setPromptInput('')
    fetchRecommendations(prompt)
  }

  const handlePromptSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (loading || !promptInput.trim()) return
    fetchRecommendations(promptInput.trim())
  }

  const renderNotice = (): JSX.Element | null => {
    if (!error) return null

    if (error.includes('API key')) {
      return (
        <div className="discover-notice discover-notice--setup">
          <KeyRound size={20} strokeWidth={1.5} className="discover-notice-icon" />
          <div className="discover-notice-body">
            <p className="discover-notice-heading">API key needed</p>
            <p className="discover-notice-text">
              Add your Claude API key in Settings to get personalized recommendations based on your reading history.
            </p>
            <button className="btn-secondary" onClick={onOpenSettings}>
              <Settings size={14} />
              Open Settings
            </button>
          </div>
        </div>
      )
    }

    if (error.includes('finished book')) {
      return (
        <div className="discover-notice discover-notice--nudge">
          <BookOpen size={20} strokeWidth={1.5} className="discover-notice-icon" />
          <div className="discover-notice-body">
            <p className="discover-notice-heading">Almost there</p>
            <p className="discover-notice-text">
              Mark at least one book as finished to unlock personalized recommendations.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="discover-notice discover-notice--error">
        <AlertCircle size={18} strokeWidth={1.5} className="discover-notice-icon" />
        <p className="discover-notice-text">{error}</p>
      </div>
    )
  }

  if (hasApiKey === null && !cachedRecs?.length) return <div />

  if (!hasApiKey && !hasLoaded && !loading && !error && !cachedRecs?.length) {
    return (
      <div className="discover-empty">
        <Compass size={48} strokeWidth={1.2} />
        <h2>Discover Your Next Read</h2>
        <p>Get personalized book recommendations powered by Claude, based on your reading history, ratings, and reviews.</p>
        <div className="discover-empty-actions">
          <button className="btn-primary" onClick={() => fetchRecommendations()}>
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
          onClick={() => fetchRecommendations(activePrompt)}
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className="search-spinner" /> : <RefreshCw size={14} />}
          {loading ? 'Thinking...' : 'Refresh'}
        </button>
      </div>

      <div className="discover-prompt-section">
        <div className="discover-chips">
          {MOOD_CHIPS.map((chip) => (
            <button
              key={chip.label}
              className="discover-chip"
              onClick={() => handleChipClick(chip.prompt)}
              disabled={loading}
            >
              {chip.label}
            </button>
          ))}
          <button
            className="discover-chip discover-chip-lucky"
            onClick={() => {
              const angle = LUCKY_ANGLES[Math.floor(Math.random() * LUCKY_ANGLES.length)]
              handleChipClick(`surprise me with something unexpected — specifically, ${angle}`)
            }}
            disabled={loading}
          >
            <Sparkles size={12} />
            Feeling Lucky
          </button>
        </div>
        <form className="discover-prompt-form" onSubmit={handlePromptSubmit}>
          <input
            type="text"
            className="discover-prompt-input"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Or describe what you're in the mood for..."
            disabled={loading}
          />
        </form>
      </div>

      {renderNotice()}

      {recommendations.length > 0 && (
        <div className="recommendation-list">
          {recommendations.map((rec, i) => {
            const inLibrary = isInLibrary(rec.title, rec.author)
            return (
              <div key={i} className="recommendation-card">
                <div className="recommendation-number">{i + 1}</div>
                <div className="recommendation-content">
                  <h3 className="recommendation-title">{rec.title}</h3>
                  <p className="recommendation-author">by {rec.author}</p>
                  <p className="recommendation-reason">{rec.reason}</p>
                </div>
                <div className="recommendation-actions">
                  {inLibrary ? (
                    <span className="recommendation-in-library">
                      <CheckCircle size={14} />
                      In Library
                    </span>
                  ) : (
                    <button
                      className="btn-secondary recommendation-add-btn"
                      onClick={() => handleAddFromRec(rec, i)}
                      disabled={addingRec !== null}
                    >
                      {addingRec === i ? (
                        <Loader2 size={14} className="search-spinner" />
                      ) : (
                        <Plus size={14} />
                      )}
                      {addingRec === i ? 'Adding...' : 'Add to Library'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
