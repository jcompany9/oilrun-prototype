"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Users,
  TrendingUp,
  PlayCircle,
  ExternalLink,
  Menu,
  X,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { saasLocations } from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"
import { InboxProvider, useInbox } from "@/lib/contexts/saas-inbox"
import { InboxSidebar } from "./InboxSidebar"
import { DragGhost } from "./DragGhost"

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
  { label: "Creator 모듈", href: "/saas/creator", icon: PlayCircle, isModule: true },
]

const EXTERNAL_ITEMS: NavItem[] = [
  { label: "차주 부킹 페이지", href: "/book/hyungje", icon: ExternalLink },
]

export function SaasShell({ children }: { children: React.ReactNode }) {
  return (
    <InboxProvider>
      <SaasShellInner>{children}</SaasShellInner>
    </InboxProvider>
  )
}

function SaasShellInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const inbox = useInbox()

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <SaasHeader onOpenSidebar={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <SaasSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />

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

        <InboxSidebar />
      </div>

      <DragGhost />
    </div>
  )
}

function SaasHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  // 1 Shop = 1 호점 (호점이 다르면 별도 가입). 매출은 현 정비소 본점만.
  const todayRevenue = saasLocations[0]?.todayRevenue ?? 0
  const inbox = useInbox()
  const inboxCount = inbox.incoming.length
  const hasInbox = !inbox.loading && inboxCount > 0

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
        <div
          className="hidden rounded-xl px-3 py-1.5 sm:block"
          style={{ backgroundColor: "#DBEAFE" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#1E40AF" }}>
            오늘 매출
          </p>
          <p className="text-sm font-bold tabular-nums" style={{ color: "#1E40AF" }}>
            {formatKRW(todayRevenue)}
          </p>
        </div>

        <button
          type="button"
          onClick={inbox.expandInbox}
          aria-label="들어오는 예약"
          title={hasInbox ? `들어오는 예약 ${inboxCount}건` : "들어오는 예약"}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
          {hasInbox && (
            <>
              <span
                className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: "#F97316" }}
              >
                {inboxCount}
              </span>
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ backgroundColor: "#FB923C" }}
                />
              </span>
            </>
          )}
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

function SaasSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <aside
      className={`relative hidden shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 lg:flex ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* 우측 가장자리 떠있는 토글 버튼 — 항상 보임 */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <SidebarNav collapsed={collapsed} />
    </aside>
  )
}

function SidebarNav({
  onClickItem,
  collapsed,
}: {
  onClickItem?: () => void
  collapsed?: boolean
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2 py-4">
      {!collapsed && (
        <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Core
        </p>
      )}
      {NAV_ITEMS.filter((i) => !i.isModule).map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          onClick={onClickItem}
          collapsed={collapsed}
        />
      ))}

      {collapsed ? (
        <div className="mx-2 my-2 border-t border-gray-200" />
      ) : (
        <p className="mt-4 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          🎬 Add-on Modules
        </p>
      )}
      {NAV_ITEMS.filter((i) => i.isModule).map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          onClick={onClickItem}
          collapsed={collapsed}
        />
      ))}

      {collapsed ? (
        <div className="mx-2 my-2 border-t border-gray-200" />
      ) : (
        <p className="mt-4 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          퍼블릭
        </p>
      )}
      {EXTERNAL_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          onClick={onClickItem}
          external
          collapsed={collapsed}
        />
      ))}

      {!collapsed && (
        <div className="mt-auto rounded-lg bg-gradient-to-br from-blue-50 to-orange-50 p-3 text-xs">
          <p className="font-bold text-gray-900">Standard 플랜</p>
          <p className="mt-0.5 text-gray-600">+ 🎬 Creator (design partner)</p>
          <p className="mt-1.5 font-bold tabular-nums" style={{ color: "#1E40AF" }}>
            월 49,000원
          </p>
        </div>
      )}
    </nav>
  )
}

function NavLink({
  item,
  pathname,
  onClick,
  external,
  collapsed,
}: {
  item: NavItem
  pathname: string
  onClick?: () => void
  external?: boolean
  collapsed?: boolean
}) {
  const Icon = item.icon
  const isActive = pathname === item.href || (item.href !== "/saas" && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 rounded-lg text-sm transition-colors ${
        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
      } ${
        isActive
          ? "font-bold text-white"
          : "font-medium text-gray-700 hover:bg-gray-50"
      }`}
      style={isActive ? { backgroundColor: "#1E40AF" } : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {external && <ExternalLink className="h-3 w-3 text-gray-400" />}
        </>
      )}
    </Link>
  )
}
