import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

export interface Book {
  id: number
  title: string
  author: string
  status: 'want-to-read' | 'reading' | 'finished'
  rating: number | null
  review: string | null
  tags: string[]
  coverId: number | null
  dateAdded: string
  dateFinished: string | null
}

export type NewBook = Omit<Book, 'id' | 'dateAdded' | 'dateFinished'>

export interface Settings {
  claudeApiKey: string | null
}

interface Store {
  books: Book[]
  nextId: number
  settings: Settings
}

export class Database {
  private store: Store
  private filePath: string

  constructor() {
    this.filePath = join(app.getPath('userData'), 'bookworm-data.json')
    this.store = this.load()
  }

  private load(): Store {
    if (existsSync(this.filePath)) {
      const data = JSON.parse(readFileSync(this.filePath, 'utf-8'))

      // Migrate: strip old progress fields, add new fields
      if (data.books) {
        data.books = data.books.map((b: any) => {
          delete b.totalPages
          delete b.currentPage
          if (b.review === undefined) b.review = null
          if (!Array.isArray(b.tags)) b.tags = []
          return b
        })
      }

      // Ensure settings exist
      if (!data.settings) {
        data.settings = { claudeApiKey: null }
      }

      return data
    }
    return { books: [], nextId: 1, settings: { claudeApiKey: null } }
  }

  private save(): void {
    writeFileSync(this.filePath, JSON.stringify(this.store, null, 2))
  }

  getAllBooks(): Book[] {
    return [...this.store.books].sort(
      (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
  }

  addBook(book: NewBook): Book {
    const newBook: Book = {
      ...book,
      id: this.store.nextId++,
      dateAdded: new Date().toISOString(),
      dateFinished: book.status === 'finished' ? new Date().toISOString() : null
    }
    this.store.books.push(newBook)
    this.save()
    return newBook
  }

  updateBook(id: number, updates: Partial<NewBook>): Book {
    const index = this.store.books.findIndex((b) => b.id === id)
    if (index === -1) throw new Error(`Book ${id} not found`)

    const oldBook = this.store.books[index]

    // Auto-manage dateFinished on status transitions
    if (updates.status && updates.status !== oldBook.status) {
      if (updates.status === 'finished' && oldBook.status !== 'finished') {
        updates = { ...updates }
        ;(updates as any).dateFinished = new Date().toISOString()
      } else if (updates.status !== 'finished' && oldBook.status === 'finished') {
        updates = { ...updates }
        ;(updates as any).dateFinished = null
      }
    }

    this.store.books[index] = { ...oldBook, ...updates }
    this.save()
    return this.store.books[index]
  }

  deleteBook(id: number): void {
    this.store.books = this.store.books.filter((b) => b.id !== id)
    this.save()
  }

  getSettings(): Settings {
    return { ...this.store.settings }
  }

  updateSettings(updates: Partial<Settings>): Settings {
    this.store.settings = { ...this.store.settings, ...updates }
    this.save()
    return this.store.settings
  }
}
