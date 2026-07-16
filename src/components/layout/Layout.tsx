import { Outlet, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { WhatsAppFloat } from "./WhatsAppFloat"

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
