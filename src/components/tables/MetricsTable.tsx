import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useMetricsStore } from "@/store/useMetricsStore"
import { useUserInformationStore } from "@/store/useUserInfromation"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Trash, FunnelPlus, FunnelX } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ResolvedTimelineEvent } from "@/types/user_information"

const getDefaultDesde = () => {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date.toISOString().slice(0, 16)
}

const getDefaultHasta = () => {
  const date = new Date()
  return date.toISOString().slice(0, 16)
}

function SkeletonGroup() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return <div className="text-sm text-red-500">{message}</div>
}

function Timeline({ events }: { events: ResolvedTimelineEvent[] }) {
  return (
    <div className="space-y-3">
      {events?.map((event: ResolvedTimelineEvent, index: number) => (
        <div
          key={index}
          className="space-y-1 rounded-md border bg-muted/30 p-3"
        >
          <p className="text-xs text-muted-foreground">{event.incoming}</p>
          <p className="text-sm">{event.to_meaning}</p>
        </div>
      ))}
    </div>
  )
}

function Field({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function UserInfoGrid({
  userInfo,
  selectedPhone,
}: {
  userInfo:
    | { name?: string; email?: string; total_eventos?: number }
    | null
    | undefined
  selectedPhone: string | null
}) {
  return (
    <div className="grid grid-cols-1 gap-4 text-sm">
      <Field label="Teléfono" value={selectedPhone} />
      <Field label="Nombre" value={userInfo?.name || "-"} />
      <Field label="Email" value={userInfo?.email || "-"} />
      <Field label="Eventos" value={userInfo?.total_eventos} />
    </div>
  )
}
function Section({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 border-b py-4 last:border-b-0">
      {title && <p className="text-sm font-medium">{title}</p>}
      {children}
    </div>
  )
}

export function MetricsTable() {
  const { data, pagination, filters, fetchMetrics, setFilters, loading } =
    useMetricsStore()

  const {
    data: userInfo,
    resolvedTimeline,
    loading: userLoading,
    error: userError,
    fetchUserInformation,
  } = useUserInformationStore()

  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const defaultDesde = useMemo(() => getDefaultDesde(), [])
  const defaultHasta = useMemo(() => getDefaultHasta(), [])

  const [localFilters, setLocalFilters] = useState({
    ...filters,
    desde: filters.desde || defaultDesde,
    hasta: filters.hasta || defaultHasta,
  })
  const initializedRef = useRef(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const debounceDateTimerRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)

  useEffect(() => {
    if (!initializedRef.current) {
      setFilters(localFilters)
      fetchMetrics(localFilters)
      initializedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = (key: string, value: unknown) => {
    setLocalFilters((prev) => {
      const updatedFilters = {
        ...prev,
        [key]: value,
      }

      // ← Debounce búsqueda por nombre
      if (key === "search") {
        clearTimeout(debounceTimerRef.current)

        const searchValue = (value as string).trim()

        if (searchValue.length > 3) {
          debounceTimerRef.current = setTimeout(() => {
            setFilters(updatedFilters)
            fetchMetrics(updatedFilters)
          }, 500)
        } else if (searchValue.length === 0) {
          debounceTimerRef.current = setTimeout(() => {
            const clearFilters = {
              ...updatedFilters,
              search: "",
              offset: 0,
            }
            setFilters(clearFilters)
            fetchMetrics(clearFilters)
          }, 500)
        }
      } else if (key === "desde" || key === "hasta") {
        // ← Validar formato de fecha
        if (value) {
          const dateValue = new Date(value as string)
          if (isNaN(dateValue.getTime())) {
            return prev // No actualizar si la fecha no es válida
          }
        }

        // ← Validar que "desde" no sea mayor a "hasta"
        if (updatedFilters.desde && updatedFilters.hasta) {
          const desdeDate = new Date(updatedFilters.desde)
          const hastaDate = new Date(updatedFilters.hasta)
          if (desdeDate > hastaDate) {
            return prev // No actualizar si "desde" es mayor a "hasta"
          }
        }

        // ← Validar que "hasta" no sea mayor a mañana
        if (updatedFilters.hasta) {
          const hastaDate = new Date(updatedFilters.hasta)
          const now = new Date()
          const tomorrow = new Date(now)
          tomorrow.setDate(now.getDate() + 1)
          if (hastaDate > tomorrow) {
            return prev
          }
        }

        // ← Debounce para fechas (800ms)
        clearTimeout(debounceDateTimerRef.current)

        debounceDateTimerRef.current = setTimeout(() => {
          const dateFilters = {
            ...updatedFilters,
            offset: 0,
          }
          setFilters(dateFilters)
          fetchMetrics(dateFilters)
        }, 800)
      } else if (
        ["sin_nombre", "sin_email", "reservar", "humano"].includes(key)
      ) {
        // ← Checkboxes buttons: enviar automáticamente
        const filtersToApply = Object.fromEntries(
          Object.entries(updatedFilters).filter(([filterKey, filterValue]) => {
            if (
              ["sin_nombre", "sin_email", "reservar", "humano"].includes(
                filterKey
              )
            ) {
              return filterValue === true
            }
            return true
          })
        ) as typeof localFilters

        filtersToApply.offset = 0

        setFilters(filtersToApply)
        fetchMetrics(filtersToApply)
      }

      return updatedFilters
    })
  }

  const handleRowClick = (phoneNumber: string) => {
    setSelectedPhone(phoneNumber)
    setIsModalOpen(true)
  }

  // Traer información del usuario cuando se abre el modal
  useEffect(() => {
    if (isModalOpen && selectedPhone) {
      fetchUserInformation(selectedPhone)
    }
  }, [isModalOpen, selectedPhone, fetchUserInformation])

  const handleReset = useCallback(() => {
    const resetFilters = {
      limit: 20,
      offset: 0,
      desde: defaultDesde,
      hasta: defaultHasta,
    }
    setLocalFilters(resetFilters)
    setFilters(resetFilters)
    fetchMetrics(resetFilters)
  }, [setFilters, fetchMetrics, defaultDesde, defaultHasta])

  const handleNextPage = useCallback(() => {
    if (pagination.next) {
      const nextOffset = (filters.offset ?? 0) + (filters.limit ?? 20)
      const newFilters = { ...localFilters, offset: nextOffset }
      setLocalFilters(newFilters)
      setFilters(newFilters)
      fetchMetrics(newFilters)
    }
  }, [
    pagination.next,
    filters.offset,
    filters.limit,
    localFilters,
    setFilters,
    fetchMetrics,
  ])

  const handlePreviousPage = useCallback(() => {
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
  }, [
    pagination.previous,
    filters.offset,
    filters.limit,
    localFilters,
    setFilters,
    fetchMetrics,
  ])

  // Limpiar debounces al desmontar
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimerRef.current)
      clearTimeout(debounceDateTimerRef.current)
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* FILTROS */}
      <div className="space-y-4">
        {/* FILA 1: Búsqueda y fechas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            placeholder="Buscar por nombre (mín. 3 caracteres)..."
            value={localFilters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            disabled={loading}
          />

          <Input
            type="datetime-local"
            placeholder="Desde"
            value={localFilters.desde || ""}
            onChange={(e) => handleFilterChange("desde", e.target.value)}
            disabled={loading}
          />

          <Input
            type="datetime-local"
            placeholder="Hasta"
            value={localFilters.hasta || ""}
            onChange={(e) => handleFilterChange("hasta", e.target.value)}
            disabled={loading}
          />
        </div>

        {/* FILA 2: Buttons como filtros */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={localFilters.sin_nombre ? "default" : "outline"}
            size="sm"
            onClick={() =>
              handleFilterChange("sin_nombre", !localFilters.sin_nombre)
            }
            disabled={loading}
          >
            {localFilters.sin_nombre ? (
              <FunnelX className="mr-2 h-4 w-4" />
            ) : (
              <FunnelPlus className="mr-2 h-4 w-4" />
            )}
            Sin nombre
          </Button>

          <Button
            variant={localFilters.sin_email ? "default" : "outline"}
            size="sm"
            onClick={() =>
              handleFilterChange("sin_email", !localFilters.sin_email)
            }
            disabled={loading}
          >
            {localFilters.sin_email ? (
              <FunnelX className="mr-2 h-4 w-4" />
            ) : (
              <FunnelPlus className="mr-2 h-4 w-4" />
            )}
            Sin email
          </Button>

          <Button
            variant={localFilters.reservar ? "default" : "outline"}
            size="sm"
            onClick={() =>
              handleFilterChange("reservar", !localFilters.reservar)
            }
            disabled={loading}
          >
            {localFilters.reservar ? (
              <FunnelX className="mr-2 h-4 w-4" />
            ) : (
              <FunnelPlus className="mr-2 h-4 w-4" />
            )}
            Reservar
          </Button>

          <Button
            variant={localFilters.humano ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("humano", !localFilters.humano)}
            disabled={loading}
          >
            {localFilters.humano ? (
              <FunnelX className="mr-2 h-4 w-4" />
            ) : (
              <FunnelPlus className="mr-2 h-4 w-4" />
            )}
            Humano
          </Button>
        </div>
      </div>

      {/* BOTÓN LIMPIAR */}
      <div className="flex gap-2">
        <Button variant="destructive" onClick={handleReset} disabled={loading}>
          Limpiar filtros <Trash className="ml-2 h-4 w-4" />
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
              <>
                {[...Array(6)].map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : data && data.length > 0 ? (
              data.map((item) => (
                <TableRow
                  key={item.phone_number}
                  onClick={() => handleRowClick(item.phone_number)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
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
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Página{" "}
            {Math.floor((filters.offset ?? 0) / (filters.limit ?? 20)) + 1}
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

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
          {/* HEADER FIJO */}
          <DialogHeader className="shrink-0 border-b pb-3">
            <DialogTitle>Detalles del contacto</DialogTitle>
          </DialogHeader>

          {/* BODY SCROLL */}
          <div className="flex-1 overflow-y-auto pr-2">
            {/* LOADING */}
            {userLoading && (
              <Section>
                <SkeletonGroup />
              </Section>
            )}

            {/* ERROR */}
            {!userLoading && userError && (
              <Section>
                <ErrorState message={userError} />
              </Section>
            )}

            {/* CONTENT */}
            {!userLoading && !userError && (
              <>
                <Section>
                  <UserInfoGrid
                    userInfo={
                      userInfo
                        ? {
                            name: userInfo.name ?? undefined,
                            email: userInfo.email ?? undefined,
                            total_eventos: userInfo.total_eventos ?? undefined,
                          }
                        : null
                    }
                    selectedPhone={selectedPhone}
                  />
                </Section>

                <Section title="Conversación">
                  <Timeline events={resolvedTimeline || []} />
                </Section>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
