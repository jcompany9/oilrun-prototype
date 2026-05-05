"use client"

import { useMemo, useState } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { AlertTriangle, Search, X } from "lucide-react"
import { adminOrdersFull, type AdminOrderFull } from "@/lib/admin-mock"
import { type AdminOrderStatus } from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

const STATUS_FILTERS: { value: AdminOrderStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "scheduled", label: "예정" },
  { value: "in_progress", label: "진행중" },
  { value: "completed", label: "완료" },
  { value: "cancelled", label: "취소" },
]

const PERIODS = [
  { value: "today", label: "오늘" },
  { value: "week", label: "이번 주" },
  { value: "month", label: "이번 달" },
  { value: "custom", label: "직접 선택" },
] as const

const STATUS_BADGE: Record<
  AdminOrderStatus,
  { label: string; bg: string; fg: string; pulse?: boolean }
> = {
  completed: { label: "완료", bg: "#E5E7EB", fg: "#374151" },
  in_progress: { label: "진행중", bg: "#FED7AA", fg: "#C2410C", pulse: true },
  scheduled: { label: "예정", bg: "#DBEAFE", fg: "#1E40AF" },
  cancelled: { label: "취소", bg: "#FEE2E2", fg: "#B91C1C" },
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "all">(
    "all"
  )
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["value"]>(
    "month"
  )
  const [shopFilter, setShopFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<AdminOrderFull | null>(null)

  const filtered = useMemo(() => {
    return adminOrdersFull.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        if (
          !o.id.toLowerCase().includes(q) &&
          !o.customerName.includes(q) &&
          !o.customerPhone.includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [statusFilter, query])

  const stats = useMemo(() => {
    const todayOrders = filtered.length
    const inProgress = filtered.filter((o) => o.status === "in_progress").length
    const claims = filtered.filter((o) => o.hasClaim).length
    return { todayOrders, inProgress, claims }
  }, [filtered])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 grid grid-cols-3 gap-3">
          <QuickStat label="오늘 주문" value={`${stats.todayOrders}건`} />
          <QuickStat label="진행중" value={`${stats.inProgress}건`} />
          <QuickStat
            label="클레임"
            value={`${stats.claims}건`}
            tone={stats.claims > 0 ? "warn" : "default"}
          />
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter === s.value
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatusFilter(s.value)}
                  className="h-8 rounded-full px-3 text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: active ? "#1E40AF" : "#F3F4F6",
                    color: active ? "#FFFFFF" : "#374151",
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value as (typeof PERIODS)[number]["value"])
              }
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-blue-800 focus:outline-none"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-blue-800 focus:outline-none"
            >
              <option value="all">전체 정비소</option>
              <option value="S-001">성수자동차정비</option>
            </select>
            <div className="relative ml-auto flex-1 min-w-[200px] max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="주문번호 / 차주 / 전화번호 검색"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-semibold text-gray-500">
                  <th className="px-4 py-2.5">주문번호</th>
                  <th className="px-4 py-2.5">일시</th>
                  <th className="px-4 py-2.5">차주</th>
                  <th className="px-4 py-2.5">차량</th>
                  <th className="px-4 py-2.5">메뉴</th>
                  <th className="px-4 py-2.5">정비소</th>
                  <th className="px-4 py-2.5 text-right">매출</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="px-4 py-2.5 text-center">액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((o) => {
                  const badge = STATUS_BADGE[o.status]
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelected(o)}
                      className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono text-[11px] tabular-nums text-gray-700">
                        {o.id}
                        {o.hasClaim && (
                          <AlertTriangle className="ml-1 inline h-3 w-3 text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums text-gray-600">
                        {o.date} {o.time}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {o.customerName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {o.vehicle}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {o.menuName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {o.shopName}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-gray-900">
                        {formatKRW(o.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.pulse ? "animate-pulse" : ""}`}
                          style={{ backgroundColor: badge.bg, color: badge.fg }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-blue-700 hover:underline">
                        보기
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            <span>
              총 {filtered.length}건 중 1–{Math.min(20, filtered.length)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="h-8 rounded-md border border-gray-200 px-3 disabled:opacity-40"
              >
                이전
              </button>
              <button
                type="button"
                className="h-8 rounded-md border border-gray-200 px-3"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>

      <OrderDetailDialog
        order={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

function QuickStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "warn" | "default"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-4 ring-1 ring-gray-200"
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className="mt-1 text-2xl font-bold tabular-nums"
        style={{ color: tone === "warn" ? "#B91C1C" : "#111827" }}
      >
        {value}
      </p>
    </motion.div>
  )
}

function OrderDetailDialog({
  order,
  onClose,
}: {
  order: AdminOrderFull | null
  onClose: () => void
}) {
  return (
    <DialogPrimitive.Root
      open={order !== null}
      onOpenChange={(o) => !o && onClose()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl outline-none data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right"
        >
          <DialogPrimitive.Title className="sr-only">주문 상세</DialogPrimitive.Title>
          <header className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 className="text-base font-bold text-gray-900">주문 상세</h2>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="닫기"
                className="-mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogPrimitive.Close>
          </header>
          {order && (
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="mb-1 font-mono text-xs tabular-nums text-gray-500">
                {order.id}
              </p>
              <p className="mb-4 text-lg font-bold text-gray-900">
                {order.customerName} · {order.vehicle}
              </p>
              <dl className="mb-5 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                <DetailRow label="일시" value={`${order.date} ${order.time}`} />
                <DetailRow label="전화" value={order.customerPhone} />
                <DetailRow label="차량번호" value={order.vehiclePlate} />
                <DetailRow label="메뉴" value={order.menuName} />
                <DetailRow label="정비소" value={order.shopName} />
                <DetailRow label="결제" value={formatKRW(order.payment)} />
                <DetailRow label="수수료" value={formatKRW(order.fee)} />
              </dl>
              {order.hasClaim && (
                <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-xs text-red-900">
                    클레임 발생 — CS 응대가 필요한 주문입니다
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toast.success("환불이 처리되었습니다 (시연용)")}
                  className="h-11 w-full rounded-lg bg-red-600 text-sm font-bold text-white hover:opacity-90"
                >
                  환불 처리
                </button>
                <button
                  type="button"
                  onClick={() => toast.success("주문이 취소되었습니다 (시연용)")}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  주문 취소
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast("정비소에 알림 발송됨", {
                      description: order.shopName,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  정비소에 알림 발송
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast("차주에게 알림 발송됨", {
                      description: order.customerName,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  차주에게 알림 발송
                </button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-right text-sm text-gray-900">{value}</dd>
    </div>
  )
}
