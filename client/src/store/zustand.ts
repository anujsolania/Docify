import { create } from 'zustand'
import AuthService from '../services/user-service'
import type { Document } from '../interfaces/interfaces'



type StoreState = {
  documents: Document[]
  setDocuments: (docs: Document[]) => void
  getDocuments: () => Promise<void>
  title: string
  setTitle: (titlee: string) => void
  content: string
  setContent: (contentt: string) => void
  showShare: boolean
  setshowShare: (valuee: boolean) => void
  filterOption: string
  setFilterOption: (option: string) => void
}


export const useStore = create<StoreState>((set,get) => ({
    documents: [],
    filterOption: "Owned by me",
    setFilterOption: (option) => set({ filterOption: option }),
    setDocuments: (docs) => set({ documents: docs }),
    getDocuments: async () => {
    try {
      const token = sessionStorage.getItem("token") as string
      const response = await AuthService.getdocuments(token)
      const filterOption = get().filterOption
      if (filterOption == "Owned by me") {
        set({ documents: response.data.alldocuments.ownedbyme })
      } else if (filterOption == "Not owned by me") {
        set({ documents: response.data.alldocuments.notownedbyme })
      } else if (filterOption == "Owned by anyone") {
        set({ documents: response.data.alldocuments.ownedbyanyone })
      }
    } catch (error) {
      console.error("Error fetching:", error)
    }},
    title: "",
    setTitle: (titlee) => set({title: titlee}),
    content: "",
    setContent: (contentt) => set({content: contentt}),
    showShare: false,
    setshowShare: (valuee) => set({showShare: valuee}),
}))