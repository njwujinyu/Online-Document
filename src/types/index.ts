/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
export interface User {
  id: string
  username: string
  createdAt: Date
}

export interface Document {
  id: string
  title: string
  content: string
  path: string
  lastModified: Date
  size: number
}

export interface Folder {
  name: string
  path: string
  documents: Document[]
  subfolders: Folder[]
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  currentDocument: Document | null
  documents: Document[]
  folders: Folder[]
}
