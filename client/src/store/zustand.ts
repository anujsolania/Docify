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

  colorOfUser: Map<number, string>
  setColorOfUser: (userId: number, color: string) => void
  removeColorOfUser: (userId: number) => void

  activeUsers: { userId: number; userEmail: string }[]
  setActiveUsers: (users: { userId: number; userEmail: string }[] | ((prev: { userId: number; userEmail: string }[]) => { userId: number; userEmail: string }[])) => void
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

    colorOfUser: new Map<number, string>(),
    setColorOfUser: (userId, color) => set((state) => {
      const newMap = new Map(state.colorOfUser)
      newMap.set(userId, color)
      return { colorOfUser: newMap }
    }),
    removeColorOfUser: (userId) => set((state) => {
      const newMap = new Map(state.colorOfUser)
      newMap.delete(userId)
      return { colorOfUser: newMap }
    }),

    activeUsers: [],
    setActiveUsers: (users) => set((state) => ({
      activeUsers: typeof users === 'function' ? users(state.activeUsers) : users
    }))
}))