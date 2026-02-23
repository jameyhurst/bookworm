import { contextBridge, ipcRenderer } from 'electron'

export interface BookAPI {
  getAll: () => Promise<any[]>
  add: (book: any) => Promise<any>
  update: (id: number, updates: any) => Promise<any>
  delete: (id: number) => Promise<void>
  search: (query: string) => Promise<any[]>
  downloadCover: (coverId: number) => Promise<number | null>
  fetchSummary: (olKey: string) => Promise<string | null>
  getSettings: () => Promise<any>
  updateSettings: (updates: any) => Promise<any>
  getRecommendations: () => Promise<any>
  syncTheme: (theme: string) => Promise<void>
}

const api: BookAPI = {
  getAll: () => ipcRenderer.invoke('books:getAll'),
  add: (book) => ipcRenderer.invoke('books:add', book),
  update: (id, updates) => ipcRenderer.invoke('books:update', id, updates),
  delete: (id) => ipcRenderer.invoke('books:delete', id),
  search: (query) => ipcRenderer.invoke('books:search', query),
  downloadCover: (coverId) => ipcRenderer.invoke('books:downloadCover', coverId),
  fetchSummary: (olKey) => ipcRenderer.invoke('books:fetchSummary', olKey),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (updates) => ipcRenderer.invoke('settings:update', updates),
  getRecommendations: () => ipcRenderer.invoke('discover:getRecommendations'),
  syncTheme: (theme) => ipcRenderer.invoke('theme:sync', theme)
}

contextBridge.exposeInMainWorld('api', api)
