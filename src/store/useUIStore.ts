import { create } from "zustand"

interface UIState {
  pendingRequests: number
  loading: boolean
  startRequest: () => void
  endRequest: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  pendingRequests: 0,
  loading: false,

  startRequest: () => {
    const count = get().pendingRequests + 1
    set({
      pendingRequests: count,
      loading: true,
    })
  },

  endRequest: () => {
    const count = Math.max(0, get().pendingRequests - 1)
    set({
      pendingRequests: count,
      loading: count > 0,
    })
  },
}))
