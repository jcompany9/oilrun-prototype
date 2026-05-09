"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Users,
  TrendingUp,
  Building2,
  PlayCircle,
  ExternalLink,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react"
import { saasLocations } from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: typeof Calendar
  badge?: string
  isModule?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "통합 캘린더", href: "/saas", icon: Calendar },
  { label: "고객·차량", href: "/saas/customers", icon: Users },
  { label: "매출", href: "/saas/revenue", icon: TrendingUp },
  { label: "지점", href: "/saas/locations", icon: Building2 },
  { label: "Creator 모듈", href: "/saas/creator", icon: PlayCircle, isModule: true },
]

const EXTERNAL_ITEMS: NavItem[] = [
  { label: "차주 부킹 페이지", href: "/book/hyungje", icon: ExternalLink },
]

export function SaasShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeLocation, setActiveLocation] = useState("all")

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <SaasHeader
        onOpenSidebar={() => setSidebarOpen(true)}
        activeLocation={activeLocation}
        onLocationChange={setActiveLocation}
      />

      <div className="flex flex-1 overflow-hidden">
        <SaasSidebar />

        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white lg:hidden">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4">
                <span
                  className="text-xl font-extrabold tracking-tight"
                  style={{ color: "#1E40AF" }}
                >
                  OilRun
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav onClickItem={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        <main className="relative flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function SaasHeader({
  onOpenSidebar,
  activeLocation,
  onLocationChange,
}: {
  onOpenSidebar: () => void
  activeLocation: string
  onLocationChange: (id: string) => void
}) {
  const totalRevenue = saasLocations.reduce((s, l) => s + l.todayRevenue, 0)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 lg:hidden"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80">
          <span
            className="text-xl font-extrabold tracking-tight sm:text-2xl"
            style={{ color: "#1E40AF" }}
          >
            OilRun
          </span>
          <span
            className="hidden rounded-md px-1.5 py-0.5 text-[10px] font-bold sm:inline-block"
            style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
          >
            SaaS
          </span>
        </Link>
        <span className="hidden text-sm font-medium text-gray-600 md:block">
          형제자동차정비
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <LocationSwitcher
          activeLocation={activeLocation}
          onLocationChange={onLocationChange}
        />

        <div
          className="hidden rounded-xl px-3 py-1.5 sm:block"
          style={{ backgroundColor: "#DBEAFE" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#1E40AF" }}>
            오늘 매출
          </p>
          <p className="text-sm font-bold tabular-nums" style={{ color: "#1E40AF" }}>
            {formatKRW(totalRevenue)}
          </p>
        </div>

        <button
          type="button"
          aria-label="알림"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            3
          </span>
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
          aria-label="김형제 사장님"
        >
          김
        </div>
      </div>
    </header>
  )
}

function LocationSwitcher({
  activeLocation,
  onLocationChange,
}: {
  activeLocation: string
  onLocationChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const activeLabel =
    activeLocation === "all"
      ? "전체"
      : saasLocations.find((l) => l.id === activeLocation)?.shortName ?? "전체"

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Building2 className="h-4 w-4" />
        <span>{activeLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-40 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                onLocationChange("all")
                setOpen(false)
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                activeLocation === "all" ? "font-bold text-blue-700" : "text-gray-700"
              }`}
            >
              전체 (본점 + 2호점)
            </button>
            {saasLocations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  onLocationChange(loc.id)
                  setOpen(false)
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                  activeLocation === loc.id ? "font-bold text-blue-700" : "text-gray-700"
                }`}
              >
                {loc.shortName}
                <span className="ml-2 text-xs text-gray-400">{loc.address.split(" ").slice(1, 3).join(" ")}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SaasSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <SidebarNav />
    </aside>
  )
}

function SidebarNav({ onClickItem }: { onClickItem?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
      <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        Core
      </p>
      {NAV_ITEMS.filter((i) => !i.isModule).map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} onClick={onClickItem} />
      ))}

      <p className="mt-4 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        🎬 Add-on Modules
      </p>
      {NAV_ITEMS.filter((i) => i.isModule).map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} onClick={onClickItem} />
      ))}

      <p className="mt-4 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        퍼블릭
      </p>
      {EXTERNAL_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} onClick={onClickItem} external />
      ))}

      <div className="mt-auto rounded-lg bg-gradient-to-br from-blue-50 to-orange-50 p-3 text-xs">
        <p className="font-bold text-gray-900">Standard 플랜</p>
        <p className="mt-0.5 text-gray-600">
          + 🎬 Creator (design partner)
        </p>
        <p className="mt-1.5 font-bold tabular-nums" style={{ color: "#1E40AF" }}>
          월 49,000원
        </p>
      </div>
    </nav>
  )
}

function NavLink({
  item,
  pathname,
  onClick,
  external,
}: {
  item: NavItem
  pathname: string
  onClick?: () => void
  external?: boolean
}) {
  const Icon = item.icon
  const isActive = pathname === item.href || (item.href !== "/saas" && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? "font-bold text-white"
          : "font-medium text-gray-700 hover:bg-gray-50"
      }`}
      style={isActive ? { backgroundColor: "#1E40AF" } : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
      <span className="flex-1">{item.label}</span>
      {external && <ExternalLink className="h-3 w-3 text-gray-400" />}
    </Link>
  )
}
