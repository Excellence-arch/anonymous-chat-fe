import type React from "react"
import { Outlet } from "react-router-dom"
import { useThemeStore } from "../../store/themeStore"
import Header from "./Header"

const Layout: React.FC = () => {
  const { isDark } = useThemeStore()

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <Header />
      <main className="h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
