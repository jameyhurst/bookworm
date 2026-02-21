import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

export interface Book {
  id: number
  title: string
  author: string
  totalPages: number
  currentPage: number
  status: 'want-to-read' | 'reading' | 'finished'
  rating: number | null
  coverId: number | null
  dateAdded: string
  dateFinished: string | null
}

export type NewBook = Omit<Book, 'id' | 'dateAdded' | 'dateFinished'>

interface Store {
  books: Book[]
  nextId: number
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
      const data = readFileSync(this.filePath, 'utf-8')
      return JSON.parse(data)
    }
    return { books: [], nextId: 1 }
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
      dateFinished: null
    }
    this.store.books.push(newBook)
    this.save()
    return newBook
  }

  updateBook(id: number, updates: Partial<NewBook>): Book {
    const index = this.store.books.findIndex((b) => b.id === id)
    if (index === -1) throw new Error(`Book ${id} not found`)

    this.store.books[index] = { ...this.store.books[index], ...updates }
    this.save()
    return this.store.books[index]
  }

  updateProgress(id: number, currentPage: number): Book {
    const index = this.store.books.findIndex((b) => b.id === id)
    if (index === -1) throw new Error(`Book ${id} not found`)

    const book = this.store.books[index]
    book.currentPage = currentPage
    book.status = currentPage >= book.totalPages ? 'finished' : 'reading'
    book.dateFinished = book.status === 'finished' ? new Date().toISOString() : null

    this.save()
    return book
  }

  deleteBook(id: number): void {
    this.store.books = this.store.books.filter((b) => b.id !== id)
    this.save()
  }
}
