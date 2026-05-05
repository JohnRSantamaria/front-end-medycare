import { useEffect } from "react"
import { useStatsStore } from "@/store/useStatsStore"
import { useUIStore } from "@/store/useUIStore"
import { StatsBarChart } from "./charts/StatsBarChart"
import { MetricsTable } from "./tables/MetricsTable"
import { Loader2 } from "lucide-react"

export function StatsPanel() {
  const { data, error, fetchStats } = useStatsStore()
  const loading = useUIStore((state) => state.loading)

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center p-4 text-primary">
        <Loader2 className="h-auto w-8 animate-spin" />
      </div>
    )
  }
  if (error) return <p>Error: {error}</p>

  return (
    <>
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
    </>
  )
}
