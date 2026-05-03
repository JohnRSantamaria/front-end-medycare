import axios from "axios"
import { useUIStore } from "@/store/useUIStore"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL no está definido")
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

/* -----------------------------
   REQUEST INTERCEPTOR
----------------------------- */
api.interceptors.request.use((config) => {
  // 🔵 GLOBAL LOADING START
  useUIStore.getState().startRequest()

  console.log("REQUEST ➜")
  console.log("URL:", (config.baseURL ?? "") + config.url)
  console.log("Method:", config.method)
  console.log("Headers:", config.headers)
  console.log("Data:", config.data)

  return config
})

/* -----------------------------
   RESPONSE SUCCESS
----------------------------- */
api.interceptors.response.use(
  (response) => {
    // 🔵 GLOBAL LOADING END
    useUIStore.getState().endRequest()

    console.log("RESPONSE ✔")
    console.log("Status:", response.status)
    console.log("Data:", response.data)

    return response
  },

  /* -----------------------------
     RESPONSE ERROR
  ----------------------------- */
  (error) => {
    // 🔵 IMPORTANT: siempre cerrar loading
    useUIStore.getState().endRequest()

    console.log("RESPONSE ERROR ✖")
    console.log("Message:", error.message)
    console.log("Response:", error.response)

    return Promise.reject(error)
  }
)

export default api
