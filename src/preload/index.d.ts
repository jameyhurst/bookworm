import { BookAPI } from './index'

declare global {
  interface Window {
    api: BookAPI
  }
}
