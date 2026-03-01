import { useEffect, useState } from 'react'
import { Check, Trash2, AlertCircle } from 'lucide-react'

export interface ToastItem {
  id: number
  message: string
  type: 'added' | 'deleted' | 'error'
}

interface ToastProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

function ToastEntry({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }): JSX.Element {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 3200)
    const removeTimer = setTimeout(() => onDismiss(toast.id), 3500)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [toast.id, onDismiss])

  const handleClick = (): void => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  const Icon = toast.type === 'added' ? Check : toast.type === 'error' ? AlertCircle : Trash2

  return (
    <div className={`toast${exiting ? ' toast-exiting' : ''}`} onClick={handleClick}>
      <Icon size={15} className={`toast-icon toast-icon--${toast.type}`} />
      <span className="toast-message">{toast.message}</span>
    </div>
  )
}

export function Toast({ toasts, onDismiss }: ToastProps): JSX.Element | null {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastEntry key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
