import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState } from "../types"
import { authAPI } from "../services/api"

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (identifier: string, password: string) => {
        try {
          const response = await authAPI.login(identifier, password)
          const { token, user } = response.data

          set({
            user,
            token,
            isAuthenticated: true,
          })
        } catch (error: any) {
          throw new Error(error.response?.data?.error || "Login failed")
        }
      },

      register: async (username: string, email: string, password: string) => {
        try {
          const response = await authAPI.register(username, email, password)
          const { token, user } = response.data

          set({
            user,
            token,
            isAuthenticated: true,
          })
        } catch (error: any) {
          throw new Error(error.response?.data?.error || "Registration failed")
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
