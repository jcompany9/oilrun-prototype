"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import {
  Bell,
  ChevronRight,
  ChevronUp,
  Clock,
  MapPin,
  Truck,
  X,
  Wrench,
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { weeklyRevenue } from "@/lib/mock-data"
import {
  shopInfo,
  shopOrders,
  type ShopOrder,
  type OrderStatus,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

const ShopMap = dynamic(() => import("@/components/shop/ShopMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
      지도를 불러오는 중…
    </div>
  ),
})

const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; bg: string; fg: string }
> = {
  new: { label: "새 주문", bg: "#FEE2E2", fg: "#B91C1C" },
  scheduled: { label: "예정", bg: "#DBEAFE", fg: "#1E40AF" },
  departed: { label: "출발", bg: "#DBEAFE", fg: "#1E40AF" },
  arrived: { label: "도착", bg: "#DBEAFE", fg: "#1E40AF" },
  in_progress: { label: "진행중", bg: "#DCFCE7", fg: "#15803D" },
  completed: { label: "완료", bg: "#E5E7EB", fg: "#374151" },
}

function formatTimeShort(d: Date) {
  const h = d.getHours()
  const m = d.getMinutes()
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export default function ShopDashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<ShopOrder[]>(shopOrders)
  const [sheetOpen, setSheetOpen] = useState(false)

  const newOrders = useMemo(
    () => orders.filter((o) => o.status === "new"),
    [orders]
  )
  const todayOrders = useMemo(
    () => orders.filter((o) => o.status !== "new" && o.status !== "completed"),
    [orders]
  )

  const accept = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "scheduled" } : o))
    )
    toast.success("주문이 수락되었습니다", {
      description: "오늘 일정에 추가되었어요",
    })
  }

  const dismiss = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
    toast("주문이 무시되었습니다")
  }

  const selectOrder = (id: string) => {
    router.push(`/shop/orders/${id}`)
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <ShopHeader />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[380px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white lg:flex">
          <SidebarContent
            newOrders={newOrders}
            todayOrders={todayOrders}
            onAccept={accept}
            onDismiss={dismiss}
            onSelect={selectOrder}
          />
        </aside>

        <main className="relative flex-1">
          <ShopMap
            newOrders={newOrders}
            todayOrders={todayOrders}
            onAccept={accept}
            onDismiss={dismiss}
            onSelectOrder={selectOrder}
          />
        </main>
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed inset-x-3 bottom-3 z-[2000] flex items-center justify-between rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-2xl lg:hidden"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-sm font-semibold">
            새 주문 ({newOrders.length}) · 오늘 {todayOrders.length}건
          </span>
        </div>
        <ChevronUp className="h-4 w-4" />
      </button>

      <MobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        newOrders={newOrders}
        todayOrders={todayOrders}
        onAccept={(id) => {
          accept(id)
        }}
        onDismiss={dismiss}
        onSelect={(id) => {
          setSheetOpen(false)
          selectOrder(id)
        }}
      />
    </div>
  )
}

function ShopHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
      >
        <span
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: "#1E40AF" }}
        >
          OilRun
        </span>
        <span className="hidden text-sm font-medium text-gray-600 sm:block">
          {shopInfo.name}
        </span>
      </Link>
      <Link
        href="/shop/revenue"
        className="hidden items-center gap-3 rounded-xl bg-blue-50 p-3 transition-colors hover:bg-blue-100 sm:flex"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
            오늘 매출
          </p>
          <p className="text-base font-bold tabular-nums text-blue-900">
            {formatKRW(shopInfo.todayRevenue)}
          </p>
        </div>
        <div className="h-9 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyRevenue}>
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1E40AF"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ChevronRight className="h-4 w-4 text-blue-700" />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/shop/settlement"
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
        >
          정산 D-3
          <ChevronRight className="h-3 w-3" />
        </Link>
        <button
          type="button"
          aria-label="알림"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            2
          </span>
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
          aria-label="박정비"
        >
          박
        </div>
      </div>
    </header>
  )
}

function SidebarContent({
  newOrders,
  todayOrders,
  onAccept,
  onDismiss,
  onSelect,
}: {
  newOrders: ShopOrder[]
  todayOrders: ShopOrder[]
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          새 주문 ({newOrders.length})
        </h2>
        {newOrders.length === 0 ? (
          <div className="rounded-xl bg-gray-50 px-3 py-6 text-center text-xs text-gray-500">
            새로운 주문이 없어요
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {newOrders.map((o) => (
                <motion.li
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.2 }}
                >
                  <NewOrderCard
                    order={o}
                    onAccept={() => onAccept(o.id)}
                    onDismiss={() => onDismiss(o.id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-gray-900">
          📅 오늘 일정 ({todayOrders.length})
        </h2>
        <ul className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {todayOrders.map((o) => (
              <motion.li
                key={o.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TodayOrderRow order={o} onClick={() => onSelect(o.id)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </div>
  )
}

function NewOrderCard({
  order,
  onAccept,
  onDismiss,
}: {
  order: ShopOrder
  onAccept: () => void
  onDismiss: () => void
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-900">
            {formatTimeShort(order.scheduledAt)}
          </span>
          <span className="text-xs text-gray-500">({order.timeUntil})</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
          {order.address.replace(/^서울시\s*/, "")}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Truck className="h-4 w-4 shrink-0 text-gray-400" />
          {order.vehicleModel} / {order.menuOilSpec}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            📏 {order.distance}km · 💰{" "}
            <span className="font-semibold text-gray-900 tabular-nums">
              {formatKRW(order.total)}
            </span>
          </span>
        </div>
      </div>
      <div className="flex border-t border-gray-100">
        <button
          type="button"
          onClick={onAccept}
          className="flex-1 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F97316" }}
        >
          수락
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          무시
        </button>
      </div>
    </article>
  )
}

function TodayOrderRow({
  order,
  onClick,
}: {
  order: ShopOrder
  onClick: () => void
}) {
  const badge = STATUS_BADGE[order.status]
  const dotColor =
    order.status === "in_progress"
      ? "#15803D"
      : order.status === "completed"
        ? "#9CA3AF"
        : "#1E40AF"
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <span className="w-12 shrink-0 text-sm font-bold tabular-nums text-gray-900">
        {formatTimeShort(order.scheduledAt)}
      </span>
      <span className="flex-1 truncate text-sm text-gray-700">
        {order.address.replace(/^서울시\s*/, "")}
      </span>
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
        style={{ backgroundColor: badge.bg, color: badge.fg }}
      >
        {badge.label}
      </span>
    </button>
  )
}

function MobileSheet({
  open,
  onClose,
  newOrders,
  todayOrders,
  onAccept,
  onDismiss,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  newOrders: ShopOrder[]
  todayOrders: ShopOrder[]
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
  onSelect: (id: string) => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[2500] bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className="fixed inset-x-0 bottom-0 z-[2600] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" style={{ color: "#1E40AF" }} />
                <span className="text-sm font-bold text-gray-900">
                  새 주문 ({newOrders.length}) · 오늘 {todayOrders.length}건
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="-mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              newOrders={newOrders}
              todayOrders={todayOrders}
              onAccept={onAccept}
              onDismiss={onDismiss}
              onSelect={onSelect}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
