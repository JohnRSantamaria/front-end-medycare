import Header from "@/components/layout/Header"
import { Outlet } from "react-router-dom"

export function MainLayout() {
  return (
    <div className="mx-auto max-w-480 min-w-0">
      <Header />

      <div>
        <Outlet />
      </div>
    </div>
  )
}
