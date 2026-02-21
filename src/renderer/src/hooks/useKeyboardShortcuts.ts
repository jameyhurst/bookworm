import { useEffect, useRef, useState, useCallback } from 'react'

export interface ShortcutCallbacks {
  onAddBook: () => void
  onToggleSidebar: () => void
  onGoToFilter: (filter: string) => void
  onNavigate: (direction: 'up' | 'down') => void
  onOpenSelected: () => void
  onEscape: () => void
}

const CHORD_TIMEOUT = 500

export function useKeyboardShortcuts(callbacks: ShortcutCallbacks): {
  pendingChord: boolean
} {
  const [pendingChord, setPendingChord] = useState(false)
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef(false)
  // Stable ref to always read latest callbacks without re-attaching listener
  const cbRef = useRef(callbacks)
  cbRef.current = callbacks

  const clearChord = useCallback(() => {
    if (chordTimerRef.current) {
      clearTimeout(chordTimerRef.current)
      chordTimerRef.current = null
    }
    pendingRef.current = false
    setPendingChord(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const key = e.key

      // Escape always works, even in input fields
      if (key === 'Escape') {
        cbRef.current.onEscape()
        return
      }

      // Skip other shortcuts when focus is in an input element
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Handle second key of g-chord
      if (pendingRef.current) {
        clearChord()
        const chordMap: Record<string, string> = {
          b: 'all',
          r: 'reading',
          w: 'want-to-read',
          f: 'finished'
        }
        if (chordMap[key]) {
          e.preventDefault()
          cbRef.current.onGoToFilter(chordMap[key])
        }
        return
      }

      // Single-key shortcuts
      switch (key) {
        case 'a':
          e.preventDefault()
          cbRef.current.onAddBook()
          break
        case 's':
          e.preventDefault()
          cbRef.current.onToggleSidebar()
          break
        case 'g':
          e.preventDefault()
          pendingRef.current = true
          setPendingChord(true)
          chordTimerRef.current = setTimeout(clearChord, CHORD_TIMEOUT)
          break
        case 'ArrowUp':
          e.preventDefault()
          cbRef.current.onNavigate('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          cbRef.current.onNavigate('down')
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
  }, [clearChord])

  return { pendingChord }
}
