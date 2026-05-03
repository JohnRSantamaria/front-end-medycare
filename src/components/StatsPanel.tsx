import { useEffect } from "react"
import { useStatsStore } from "@/store/useStatsStore"
import { useUIStore } from "@/store/useUIStore"
import { StatsBarChart } from "./charts/StatsBarChart"

import { Skeleton } from "@/components/ui/skeleton"
import { MetricsTable } from "./tables/MetricsTable"
import { useMetricsStore } from "@/store/useMetricsStore"

export function StatsPanel() {
  const { data, error, fetchStats } = useStatsStore()
  const loading = useUIStore((state) => state.loading)
  const { fetchMetrics } = useMetricsStore()
  useEffect(() => {
    fetchStats()
    fetchMetrics()
  }, [fetchStats, fetchMetrics])

  if (loading) {
    return (
      <div className="mx-auto max-w-480 p-4">
        {/* Chart interactions section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Cargando estadísticas de interacciones...{" "}
          </h2>
          <div className="mt-18 grid grid-cols-4 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }
  if (error) return <p>Error: {error}</p>

  return (
    <div className="mx-auto max-w-480 p-4">
      {/* Chart interactions section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Estadísticas de Interacciones{" "}
          {data?.total_users ? `(${data.total_users} usuarios)` : ""}
        </h2>
        <div className="w-full rounded-md p-4">
          <StatsBarChart data={data} />
        </div>
      </div>
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">Métricas</h1>
        <MetricsTable />
      </div>
    </div>
  )
}
