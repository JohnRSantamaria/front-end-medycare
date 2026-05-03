import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MainLayout } from "@/layouts/MainLayout"
import Home from "@/pages/Home"
import Dashboard from "@/pages/Dashboard"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
