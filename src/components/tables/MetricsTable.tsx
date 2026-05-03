// src/components/MetricsTable.tsx
import { useState } from "react"
import { useMetricsStore } from "@/store/useMetricsStore"
import { useUIStore } from "@/store/useUIStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

export function MetricsTable() {
  const { data, pagination, filters, fetchMetrics, setFilters } =
    useMetricsStore()
  const { loading } = useUIStore()

  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key: string, value: unknown) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleApplyFilters = () => {
    setFilters(localFilters)
    fetchMetrics(localFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      limit: 20,
      offset: 0,
    }
    setLocalFilters(resetFilters)
    setFilters(resetFilters)
    fetchMetrics(resetFilters)
  }

  const handleNextPage = () => {
    if (pagination.next) {
      const nextOffset = (filters.offset ?? 0) + (filters.limit ?? 20)
      const newFilters = { ...localFilters, offset: nextOffset }
      setLocalFilters(newFilters)
      setFilters(newFilters)
      fetchMetrics(newFilters)
    }
  }

  const handlePreviousPage = () => {
    if (pagination.previous && (filters.offset ?? 0) > 0) {
      const prevOffset = Math.max(
        0,
        (filters.offset ?? 0) - (filters.limit ?? 20)
      )
      const newFilters = { ...localFilters, offset: prevOffset }
      setLocalFilters(newFilters)
      setFilters(newFilters)
      fetchMetrics(newFilters)
    }
  }

  return (
    <div className="space-y-4">
      {/* FILTROS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Buscar por nombre..."
          value={localFilters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />

        <Input
          type="datetime-local"
          placeholder="Desde"
          value={localFilters.desde || ""}
          onChange={(e) => handleFilterChange("desde", e.target.value)}
        />

        <Input
          type="datetime-local"
          placeholder="Hasta"
          value={localFilters.hasta || ""}
          onChange={(e) => handleFilterChange("hasta", e.target.value)}
        />

        <div className="flex items-center gap-2">
          <Checkbox
            id="sin_nombre"
            checked={localFilters.sin_nombre || false}
            onCheckedChange={(checked) =>
              handleFilterChange("sin_nombre", checked)
            }
          />
          <label htmlFor="sin_nombre" className="cursor-pointer text-sm">
            Sin nombre
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="sin_email"
            checked={localFilters.sin_email || false}
            onCheckedChange={(checked) =>
              handleFilterChange("sin_email", checked)
            }
          />
          <label htmlFor="sin_email" className="cursor-pointer text-sm">
            Sin email
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="reservar"
            checked={localFilters.reservar || false}
            onCheckedChange={(checked) =>
              handleFilterChange("reservar", checked)
            }
          />
          <label htmlFor="reservar" className="cursor-pointer text-sm">
            Reservar
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="humano"
            checked={localFilters.humano || false}
            onCheckedChange={(checked) => handleFilterChange("humano", checked)}
          />
          <label htmlFor="humano" className="cursor-pointer text-sm">
            Humano
          </label>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Aplicar filtros
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={loading}>
          Limpiar
        </Button>
      </div>

      {/* TABLA */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teléfono</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Reservar</TableHead>
              <TableHead>Humano</TableHead>
              <TableHead>Total eventos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.phone_number}>
                  <TableCell>{item.phone_number}</TableCell>
                  <TableCell>{item.name || "-"}</TableCell>
                  <TableCell>{item.email || "-"}</TableCell>
                  <TableCell>
                    <Checkbox checked={item.reservar} disabled />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={item.humano} disabled />
                  </TableCell>
                  <TableCell>{item.total_eventos}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-4 text-center text-muted-foreground"
                >
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total: {pagination.count} resultados
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={loading || !pagination.previous}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={loading || !pagination.next}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
