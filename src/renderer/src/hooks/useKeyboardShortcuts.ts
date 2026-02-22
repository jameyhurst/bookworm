import { useEffect, useRef, useState, useCallback } from 'react'

export interface ShortcutCallbacks {
  onAddBook: () => void
  onToggleSidebar: () => void
  onGoToFilter: (filter: string) => void
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void
  onOpenSelected: () => void
  onEscape: () => void
  onRateSelected: (rating: number | null) => void
  onSetStatusSelected: (status: string) => void
  onEditReview: () => void
  onToggleView: () => void
  onShowHelp: () => void
  onSortBy: (sort: string) => void
}

type ChordKey = 'g' | 'r' | 'm' | 's' | null

const CHORD_TIMEOUT = 500

export function useKeyboardShortcuts(callbacks: ShortcutCallbacks): {
  pendingChord: boolean
} {
  const [pendingChord, setPendingChord] = useState(false)
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingKeyRef = useRef<ChordKey>(null)
  // Stable ref to always read latest callbacks without re-attaching listener
  const cbRef = useRef(callbacks)
  cbRef.current = callbacks

  const clearChord = useCallback(() => {
    if (chordTimerRef.current) {
      clearTimeout(chordTimerRef.current)
      chordTimerRef.current = null
    }
    pendingKeyRef.current = null
    setPendingChord(false)
  }, [])

  const startChord = useCallback(
    (key: ChordKey) => {
      pendingKeyRef.current = key
      setPendingChord(true)
      chordTimerRef.current = setTimeout(clearChord, CHORD_TIMEOUT)
    },
    [clearChord]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const key = e.key

      // Escape always works, even in input fields
      if (key === 'Escape') {
        if (pendingKeyRef.current) {
          clearChord()
          return
        }
        // If focus is on an input, blur it first so shortcuts resume
        const activeEl = document.activeElement as HTMLElement
        const activeTag = activeEl?.tagName
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
          activeEl.blur()
          return
        }
        cbRef.current.onEscape()
        return
      }

      // Skip other shortcuts when focus is in an input element
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Handle second key of a chord
      const pending = pendingKeyRef.current
      if (pending) {
        clearChord()
        e.preventDefault()

        if (pending === 'g') {
          const chordMap: Record<string, string> = {
            a: 'all',
            w: 'want-to-read',
            c: 'reading',
            r: 'finished',
            d: 'discover'
          }
          if (chordMap[key]) cbRef.current.onGoToFilter(chordMap[key])
        } else if (pending === 'r') {
          if (key >= '1' && key <= '5') {
            cbRef.current.onRateSelected(parseInt(key))
          } else if (key === '0') {
            cbRef.current.onRateSelected(null)
          }
        } else if (pending === 'm') {
          const statusMap: Record<string, string> = {
            w: 'want-to-read',
            c: 'reading',
            r: 'finished'
          }
          if (statusMap[key]) cbRef.current.onSetStatusSelected(statusMap[key])
        } else if (pending === 's') {
          const sortMap: Record<string, string> = {
            a: 'author',
            t: 'title'
          }
          if (sortMap[key]) cbRef.current.onSortBy(sortMap[key])
        }
        return
      }

      // Single-key shortcuts
      switch (key) {
        case 'a':
          e.preventDefault()
          cbRef.current.onAddBook()
          break
        case 'd':
          e.preventDefault()
          cbRef.current.onGoToFilter('discover')
          break
        case 'b':
          e.preventDefault()
          cbRef.current.onToggleSidebar()
          break
        case 'e':
          e.preventDefault()
          cbRef.current.onEditReview()
          break
        case 'v':
          e.preventDefault()
          cbRef.current.onToggleView()
          break
        case 'g':
        case 'r':
        case 'm':
        case 's':
          e.preventDefault()
          startChord(key as ChordKey)
          break
        case 'ArrowUp':
          e.preventDefault()
          cbRef.current.onNavigate('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          cbRef.current.onNavigate('down')
          break
        case 'ArrowLeft':
          e.preventDefault()
          cbRef.current.onNavigate('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          cbRef.current.onNavigate('right')
          break
        case '?':
          e.preventDefault()
          cbRef.current.onShowHelp()
          break
        case 'o':
        case 'Enter':
          e.preventDefault()
          cbRef.current.onOpenSelected()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (chordTimerRef.current) clearTimeout(chordTimerRef.current)
    }
  }, [clearChord, startChord])

  return { pendingChord }
}
