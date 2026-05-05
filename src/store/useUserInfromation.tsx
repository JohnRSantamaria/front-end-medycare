import { create } from "zustand"
import api from "@/lib/api"

import type {
  ResolvedTimeline,
  UserSessionResponse,
} from "@/types/user_information"

import { resolveTimeline } from "@/utils/convert"

export interface UserInformationState {
  data: UserSessionResponse | null
  resolvedTimeline: ResolvedTimeline | null

  error: string | null
  loading: boolean

  fetchUserInformation: (phone_number: string) => Promise<void>
}

export const useUserInformationStore = create<UserInformationState>((set) => ({
  data: null,
  resolvedTimeline: null,

  error: null,
  loading: false,

  fetchUserInformation: async (phone_number: string) => {
    set({ loading: true, error: null })

    try {
      const response = await api.get<UserSessionResponse>(
        `reports/${phone_number}`,
        {
          skipGlobalLoading: true,
        }
      )

      const data = response.data

      const resolvedTimeline = resolveTimeline(data.timeline)

      set({
        data,
        resolvedTimeline,
        loading: false,
      })
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message ?? "Usuario no encontrado",
        loading: false,
      })
    }
  },
}))
