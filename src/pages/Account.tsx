import { useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { fetchCustomerProfile, customerLogout, fetchMyRepairRequests } from "@/lib/api"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useSeo } from "@/lib/useSeo"
import { products } from "@/data/products"
import { mockOrders, mockRecentlyViewedSlugs } from "@/data/dashboardMock"
import { SECTIONS, type SectionKey } from "@/components/dashboard/sections"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardProfileHeader } from "@/components/dashboard/DashboardProfileHeader"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { OrdersSection } from "@/components/dashboard/OrdersSection"
import { SupportSection } from "@/components/dashboard/SupportSection"
import { SettingsPanel } from "@/components/dashboard/SettingsPanel"
import { RecentlyViewed } from "@/components/dashboard/RecentlyViewed"

export default function Account() {
  const { isAuthenticated, isLoading: authLoading, invalidate } = useCustomerAuth()
  const navigate = useNavigate()
  useSeo({ title: "My Account", description: "Your Lapsoo ownership dashboard — orders, support, and account settings in one place." })

  const [section, setSection] = useState<SectionKey>("overview")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: fetchCustomerProfile,
    enabled: isAuthenticated,
  })

  const { data: repairRequests = [] } = useQuery({
    queryKey: ["my-repair-requests"],
    queryFn: fetchMyRepairRequests,
    enabled: isAuthenticated,
  })

  const recentlyViewedProducts = useMemo(() => products.filter((p) => mockRecentlyViewedSlugs.includes(p.slug)), [])
  const openRequests = repairRequests.filter((r) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(r.status)).length

  const handleLogout = async () => {
    await customerLogout()
    invalidate()
    navigate("/")
  }

  const handleSelectSection = (key: SectionKey) => {
    setSection(key)
    setMobileNavOpen(false)
  }

  if (authLoading) {
    return <div className="py-32 text-center text-ink/40">Loading your dashboard…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const activeLabel = SECTIONS.find((s) => s.key === section)?.label ?? "Overview"

  return (
    <div className="bg-paper-soft/40">
      <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-8 lg:py-12">
        {!profileLoading && profile && (
          <DashboardProfileHeader profile={profile} onEditProfile={() => handleSelectSection("settings")} />
        )}

        <div className="mt-8 flex items-center justify-between lg:hidden">
          <h2 className="font-display text-xl font-bold">{activeLabel}</h2>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 text-ink/60"
            aria-label="Open account menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex gap-10 lg:mt-10">
          <aside className="sticky top-24 hidden h-fit w-[280px] shrink-0 rounded-2xl border border-ink/8 bg-white p-3 lg:block">
            <DashboardSidebar active={section} onSelect={handleSelectSection} onLogout={handleLogout} />
          </aside>

          <main className="min-w-0 flex-1 space-y-10 pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {section === "overview" && (
                  <div className="space-y-10">
                    <QuickActions orders={mockOrders.length} openTickets={openRequests} onSelect={handleSelectSection} />

                    <section>
                      <div className="flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold">Recent Orders</h2>
                        <button onClick={() => handleSelectSection("orders")} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                          View all
                        </button>
                      </div>
                      <div className="mt-4">
                        <OrdersSection orders={mockOrders.slice(0, 2)} />
                      </div>
                    </section>

                    <section>
                      <h2 className="font-display text-lg font-bold">Recently Viewed</h2>
                      <div className="mt-4">
                        <RecentlyViewed products={recentlyViewedProducts} />
                      </div>
                    </section>
                  </div>
                )}

                {section === "orders" && (
                  <section>
                    <h2 className="font-display text-lg font-bold">Orders</h2>
                    <div className="mt-4">
                      <OrdersSection orders={mockOrders} />
                    </div>
                  </section>
                )}

                {section === "support" && (
                  <section>
                    <h2 className="font-display text-lg font-bold">Repairs</h2>
                    <div className="mt-4">
                      <SupportSection requests={repairRequests} />
                    </div>
                  </section>
                )}

                {section === "settings" && profile && (
                  <section>
                    <h2 className="font-display text-lg font-bold">Settings</h2>
                    <div className="mt-4">
                      <SettingsPanel profile={profile} />
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-ink/50" onClick={() => setMobileNavOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto bg-white p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between px-2 pb-3">
                <span className="font-display text-sm font-bold">My Account</span>
                <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ink/[0.06]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <DashboardSidebar active={section} onSelect={handleSelectSection} onLogout={handleLogout} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
