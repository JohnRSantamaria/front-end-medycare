import type { StatsResponse } from "@/types/stats"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

type Props = {
  data: StatsResponse | null
}

export function StatsBarChart({ data }: Props) {
  if (!data || data.total_users === 0) {
    return <p>No hay datos disponibles</p>
  }

  const total = data.total_users

  const chartData = [
    {
      name: `Recibierón el enlace de reserva: ${data.total_reservas}`,
      value: (data.total_reservas / total) * 100,
      color: "#22c55e",
    },
    {
      name: `Solicitarón hablar con un asesor: ${data.total_humanos}`,
      value: (data.total_humanos / total) * 100,
      color: "#3b82f6",
    },
    {
      name: `No proporcionaron su nombre: ${data.total_sin_nombre}`,
      value: (data.total_sin_nombre / total) * 100,
      color: "#f59e0b",
    },
    {
      name: `No proporcionaron su correo electrónico: ${data.total_sin_email}`,
      value: (data.total_sin_email / total) * 100,
      color: "#ef4444",
    },
  ]

  return (
    <div className="w-full p-4">
      <div className="h-50">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={false} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(value) => {
                const num =
                  typeof value === "number" ? value : Number(value ?? 0)
                return `${num.toFixed(2)}%`
              }}
            />
            <Bar
              dataKey="value"
              shape={(props) => {
                const { x, y, width, height, index } = props
                const color = chartData[index]?.color || "#000"
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                  />
                )
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda personalizada */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
