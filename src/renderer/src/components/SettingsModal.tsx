import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Sun, Moon, Download, Upload } from 'lucide-react'

interface SettingsModalProps {
  onClose: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onLibraryImported: () => void
  addToast: (message: string, type: 'added' | 'deleted') => void
}

export function SettingsModal({ onClose, theme, onToggleTheme, onLibraryImported, addToast }: SettingsModalProps): JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    window.api.getSettings().then((settings) => {
      if (settings.claudeApiKey) setApiKey(settings.claudeApiKey)
    })
  }, [])

  const handleSave = async (): Promise<void> => {
    await window.api.updateSettings({ claudeApiKey: apiKey.trim() || null })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async (): Promise<void> => {
    setExporting(true)
    try {
      const result = await window.api.exportLibrary()
      if (result.error) {
        addToast(`Export failed: ${result.error}`, 'deleted')
      } else if (result.success) {
        addToast(`Exported ${result.bookCount} book${result.bookCount === 1 ? '' : 's'}`, 'added')
      }
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (): Promise<void> => {
    setImporting(true)
    try {
      const result = await window.api.importLibrary()
      if (result.error) {
        addToast(`Import failed: ${result.error}`, 'deleted')
      } else if (result.success) {
        addToast(`Imported ${result.bookCount} book${result.bookCount === 1 ? '' : 's'}`, 'added')
        onLibraryImported()
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-form">
          <div className="form-group">
            <label>Theme</label>
            <button className="theme-toggle-setting" onClick={onToggleTheme}>
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>

          <div className="form-group">
            <label>Library</label>
            <p className="form-hint">
              Export saves your books and covers as a .zip file. Import replaces your current library.
            </p>
            <div className="library-actions">
              <button className="btn-secondary" onClick={handleExport} disabled={exporting || importing}>
                <Download size={15} />
                {exporting ? 'Exporting...' : 'Export'}
              </button>
              <button className="btn-secondary" onClick={handleImport} disabled={exporting || importing}>
                <Upload size={15} />
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="api-key">Claude API Key</label>
            <p className="form-hint">
              Required for book recommendations. Get your key from{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-link">console.anthropic.com</a>
            </p>
            <div className="api-key-input">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
              />
              <button
                type="button"
                className="key-toggle"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSave}>
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
