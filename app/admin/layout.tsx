"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Toaster } from "sonner"
import { toast } from "sonner"
import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  MessageCircle,
  Menu as MenuIcon,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  Wrench,
  X,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "대시보드", icon: Home },
  { href: "/admin/orders", label: "주문 관리", icon: ShoppingBag },
  { href: "/admin/shops", label: "정비소 관리", icon: Wrench },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/menu", label: "메뉴·가격", icon: Tag },
  { href: "/admin/finance", label: "정산", icon: CreditCard },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
  { href: "/admin/cs", label: "CS·문의", icon: MessageCircle },
  { href: "/admin/settings", label: "설정", icon: Settings },
]

const PAGE_TITLES: Record<string, string> = {
  "/admin": "대시보드",
  "/admin/orders": "주문 관리",
  "/admin/shops": "정비소 관리",
  "/admin/users": "사용자 관리",
  "/admin/menu": "메뉴·가격",
  "/admin/finance": "정산",
  "/admin/analytics": "통계 분석",
  "/admin/cs": "CS·문의",
  "/admin/settings": "설정",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = PAGE_TITLES[pathname] ?? "운영자"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      <DesktopSidebar pathname={pathname} />
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴 열기"
            className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <h1 className="flex-1 truncate text-base font-bold text-gray-900">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-gray-600 sm:inline">
              <span className="font-semibold">오징어땅쿙</span> 사장님
            </span>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
            >
              오
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors"
            style={{
              backgroundColor: active ? "#1E40AF" : "transparent",
              color: active ? "#FFFFFF" : "#374151",
            }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function DesktopSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <Link
        href="/"
        className="flex h-14 items-center gap-2 border-b border-gray-200 px-5 transition-opacity hover:opacity-80"
      >
        <span
          className="text-xl font-extrabold tracking-tight"
          style={{ color: "#1E40AF" }}
        >
          OilRun
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          Admin
        </span>
      </Link>
      <NavList pathname={pathname} />
      <div className="mt-auto border-t border-gray-200 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
          >
            오
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              오징어땅쿙
            </p>
            <p className="truncate text-[11px] text-gray-500">
              사장님 · OilRun
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast("로그아웃 (시연용)")}
            aria-label="로그아웃"
            className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

function MobileSidebar({
  open,
  onClose,
  pathname,
}: {
  open: boolean
  onClose: () => void
  pathname: string
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="ad-backdrop"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="ad-aside"
            className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white shadow-2xl lg:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
              <span
                className="text-xl font-extrabold tracking-tight"
                style={{ color: "#1E40AF" }}
              >
                OilRun
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="-mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList pathname={pathname} onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
