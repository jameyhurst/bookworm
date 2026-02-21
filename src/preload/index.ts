import { contextBridge, ipcRenderer } from 'electron'

export interface BookAPI {
  getAll: () => Promise<any[]>
  add: (book: any) => Promise<any>
  update: (id: number, updates: any) => Promise<any>
  delete: (id: number) => Promise<void>
  updateProgress: (id: number, currentPage: number) => Promise<any>
  search: (query: string) => Promise<any[]>
  downloadCover: (coverId: number) => Promise<number | null>
}

const api: BookAPI = {
  getAll: () => ipcRenderer.invoke('books:getAll'),
  add: (book) => ipcRenderer.invoke('books:add', book),
  update: (id, updates) => ipcRenderer.invoke('books:update', id, updates),
  delete: (id) => ipcRenderer.invoke('books:delete', id),
  updateProgress: (id, currentPage) => ipcRenderer.invoke('books:updateProgress', id, currentPage),
  search: (query) => ipcRenderer.invoke('books:search', query),
  downloadCover: (coverId) => ipcRenderer.invoke('books:downloadCover', coverId)
}

contextBridge.exposeInMainWorld('api', api)
