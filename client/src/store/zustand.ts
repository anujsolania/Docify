import { create } from 'zustand'
import AuthService from '../services/user-service'
import type { Document } from '../interfaces/interfaces'



type StoreState = {
  documents: Document[]
  getDocuments: () => Promise<void>
  setDocuments: (docs: Document[]) => void
}


export const useStore = create<StoreState>((set) => ({
    documents: [],
    getDocuments: async () => {
    try {
      const token = sessionStorage.getItem("token") as string
      const response = await AuthService.getdocuments(token)
      set({ documents: response.data.documents })
    } catch (error) {
      console.error("Error fetching:", error)
    }
  },
  setDocuments: (docs) => set({ documents: docs })
}))