import { X } from 'lucide-react'

interface HelpModalProps {
  onClose: () => void
}

function Key({ children }: { children: string }): JSX.Element {
  return <kbd>{children}</kbd>
}

function Chord({ keys, sep = 'then' }: { keys: string[]; sep?: 'then' | 'or' }): JSX.Element {
  return (
    <span className="shortcut-keys">
      {keys.map((k, i) => (
        <span key={i}>
          {i > 0 && <span className="chord-arrow">{sep}</span>}
          <Key>{k}</Key>
        </span>
      ))}
    </span>
  )
}

function ShortcutRow({ label, keys, sep }: { label: string; keys: string[]; sep?: 'then' | 'or' }): JSX.Element {
  return (
    <div className="shortcut-row">
      <span className="shortcut-label">{label}</span>
      <Chord keys={keys} sep={sep} />
    </div>
  )
}

export function HelpModal({ onClose }: HelpModalProps): JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="help-body">
          <div className="help-section">
            <h3 className="help-section-title">Navigation</h3>
            <ShortcutRow label="Move up / down" keys={['↑', '↓']} sep="or" />
            <ShortcutRow label="Move left / right (grid)" keys={['←', '→']} sep="or" />
            <ShortcutRow label="Open selected book" keys={['o']} />
            <ShortcutRow label="Open selected book" keys={['Enter']} />
            <ShortcutRow label="Close / deselect" keys={['Esc']} />
          </div>

          <div className="help-section">
            <h3 className="help-section-title">Views</h3>
            <ShortcutRow label="Toggle list / grid" keys={['v']} />
            <ShortcutRow label="Toggle sidebar" keys={['b']} />
            <ShortcutRow label="Toggle appearance" keys={['t']} />
            <ShortcutRow label="Discover" keys={['d']} />
          </div>

          <div className="help-section">
            <h3 className="help-section-title">Actions</h3>
            <ShortcutRow label="Add book" keys={['a']} />
            <ShortcutRow label="Find book" keys={['⌘', 'F']} />
            <ShortcutRow label="Save book" keys={['⌘', 'Enter']} />
            <ShortcutRow label="Edit review" keys={['e']} />
            <ShortcutRow label="Toggle date read" keys={['d']} />
            <ShortcutRow label="Delete selected" keys={['⌘', '⌫']} />
          </div>

          <div className="help-section">
            <h3 className="help-section-title">Sort</h3>
            <ShortcutRow label="By title" keys={['s', 't']} />
            <ShortcutRow label="By author" keys={['s', 'a']} />
            <ShortcutRow label="By date read" keys={['s', 'd']} />
            <ShortcutRow label="By date added" keys={['s', 'r']} />
          </div>

          <div className="help-section">
            <h3 className="help-section-title">Go to</h3>
            <ShortcutRow label="All Books" keys={['g', 'a']} />
            <ShortcutRow label="Want to Read" keys={['g', 'w']} />
            <ShortcutRow label="Currently Reading" keys={['g', 'c']} />
            <ShortcutRow label="Read Books" keys={['g', 'r']} />
            <ShortcutRow label="Discover" keys={['g', 'd']} />
            <ShortcutRow label="Reports" keys={['g', 'p']} />
          </div>

          <div className="help-section">
            <h3 className="help-section-title">Rate selected</h3>
            <ShortcutRow label="Rate 1–5 stars" keys={['r', '1–5']} />
            <ShortcutRow label="Clear rating" keys={['r', '0']} />
          </div>

          <div className="help-section">
            <h3 className="help-section-title">Set status</h3>
            <ShortcutRow label="Want to Read" keys={['m', 'w']} />
            <ShortcutRow label="Currently Reading" keys={['m', 'c']} />
            <ShortcutRow label="Read" keys={['m', 'r']} />
          </div>
        </div>
      </div>
    </div>
  )
}
