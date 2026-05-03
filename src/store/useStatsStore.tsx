// src/store/useStatsStore.tsx
import { create } from "zustand"
import api from "@/lib/api"
import type { StatsResponse } from "@/types/stats"

interface StatsState {
  data: StatsResponse | null
  error: string | null

  fetchStats: () => Promise<void>
}

export const useStatsStore = create<StatsState>((set) => ({
  data: null,
  error: null,

  fetchStats: async () => {
    set({ error: null })

    try {
      const { data } = await api.get<StatsResponse>("/stats/")

      set({
        data,
      })
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message ?? "Error fetching stats",
      })
    }
  },
}))
