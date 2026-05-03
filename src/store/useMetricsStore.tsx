// src/store/useMetricsStore.tsx
import { create } from "zustand"
import api from "@/lib/api"
import type { StatsMetricsResponse } from "@/types/stats_metrics"
import type { PaginatedResponse } from "@/types/paginated_response"

export interface MetricsFilters {
  desde?: string
  hasta?: string
  search?: string
  sin_nombre?: boolean
  sin_email?: boolean
  reservar?: boolean
  humano?: boolean
  limit?: number
  offset?: number
}

interface MetricsState {
  data: StatsMetricsResponse[] | null
  pagination: {
    count: number
    next: string | null
    previous: string | null
  }
  error: string | null
  filters: MetricsFilters

  fetchMetrics: (filters?: MetricsFilters) => Promise<void>
  setFilters: (filters: MetricsFilters) => void
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  data: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
  error: null,
  filters: {
    limit: 20,
    offset: 0,
  },

  setFilters: (filters) => set({ filters }),

  fetchMetrics: async (filters?: MetricsFilters) => {
    const currentFilters = filters ?? get().filters
    set({ error: null })

    try {
      const { data } = await api.get<PaginatedResponse<StatsMetricsResponse>>(
        "/stats/metrics",
        {
          params: currentFilters,
        }
      )
      console.log(`data:  ${data}`)

      set({
        data: data.results,
        pagination: {
          count: data.count,
          next: data.next,
          previous: data.previous,
        },
        filters: currentFilters,
      })
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message ?? "Error fetching metrics",
      })
    }
  },
}))
