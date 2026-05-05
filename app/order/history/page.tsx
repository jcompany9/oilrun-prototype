"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog as DialogPrimitive } from "radix-ui"
import { AnimatePresence, motion } from "framer-motion"
import { toast, Toaster } from "sonner"
import {
  Bell,
  Calendar,
  Car,
  Check,
  ChevronRight,
  Download,
  MapPin,
  Phone,
  Plus,
  Receipt,
  Star,
  X,
} from "lucide-react"
import {
  historyOrders,
  nextExchangeReminder,
  type HistoryOrder,
  type HistoryStatus,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STATUS_BADGE: Record<
  HistoryStatus,
  { label: string; bg: string; fg: string; emoji: string }
> = {
  in_progress: { label: "작업 중", bg: "#DCFCE7", fg: "#15803D", emoji: "🟢" },
  completed: { label: "완료", bg: "#E5E7EB", fg: "#374151", emoji: "✅" },
  cancelled: { label: "취소", bg: "#FEE2E2", fg: "#B91C1C", emoji: "✕" },
}

export default function OrderHistoryPage() {
  const [tab, setTab] = useState<HistoryStatus>("in_progress")
  const [receiptOrder, setReceiptOrder] = useState<HistoryOrder | null>(null)

  const groups = useMemo(() => {
    return {
      in_progress: historyOrders.filter((o) => o.status === "in_progress"),
      completed: historyOrders.filter((o) => o.status === "completed"),
      cancelled: historyOrders.filter((o) => o.status === "cancelled"),
    }
  }, [])

  return (
    <div className="flex flex-1 flex-col bg-gray-50 px-4 pt-4 pb-12">
      <Toaster position="top-center" richColors />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as HistoryStatus)}
        className="gap-4"
      >
        <TabsList className="h-12 w-full bg-white shadow-sm ring-1 ring-gray-200">
          <TabsTrigger value="in_progress" className="h-full text-sm">
            진행중 ({groups.in_progress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="h-full text-sm">
            완료 ({groups.completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="h-full text-sm">
            취소됨 ({groups.cancelled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in_progress" className="flex flex-col gap-4">
          <ReminderCard />
          <AnimatePresence mode="popLayout">
            {groups.in_progress.length === 0 ? (
              <EmptyState
                key="empty-in-progress"
                title="진행중인 예약이 없어요"
                ctaHref="/order/start"
                ctaLabel="지금 예약하기"
              />
            ) : (
              groups.in_progress.map((o) => (
                <InProgressCard key={o.id} order={o} />
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="completed" className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {groups.completed.length === 0 ? (
              <EmptyState
                key="empty-completed"
                title="완료된 예약이 없어요"
              />
            ) : (
              groups.completed.map((o) => (
                <CompletedCard
                  key={o.id}
                  order={o}
                  onShowReceipt={() => setReceiptOrder(o)}
                />
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="cancelled" className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {groups.cancelled.length === 0 ? (
              <EmptyState
                key="empty-cancelled"
                title="취소된 예약이 없어요"
              />
            ) : (
              groups.cancelled.map((o) => (
                <CancelledCard key={o.id} order={o} />
              ))
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      <ReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  )
}

function ReminderCard() {
  const r = nextExchangeReminder
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border-2 border-orange-200 bg-orange-50 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <Bell className="h-4 w-4" style={{ color: "#F97316" }} />
        <span className="text-xs font-bold text-orange-700">
          다음 교환 시기 도래
        </span>
      </div>
      <p className="mb-1 text-sm font-semibold text-gray-900">
        {r.vehicleModel} · 마지막 교환 {r.monthsSinceLast}개월 전
      </p>
      <p className="mb-3 text-xs text-gray-700">{r.message}</p>
      <Link
        href={`/order/menu?vehicleId=${r.vehicleId}`}
        className="flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#F97316" }}
      >
        지금 예약하기
      </Link>
    </motion.div>
  )
}

function StatusPill({ status }: { status: HistoryStatus }) {
  const b = STATUS_BADGE[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${status === "in_progress" ? "animate-pulse" : ""}`}
      style={{ backgroundColor: b.bg, color: b.fg }}
    >
      {b.label}
    </span>
  )
}

function InProgressCard({ order }: { order: HistoryOrder }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
    >
      <div className="mb-3 flex items-center justify-between">
        <StatusPill status={order.status} />
        <span className="font-mono text-[10px] tabular-nums text-gray-400">
          {order.id}
        </span>
      </div>
      <div className="mb-3 flex items-start gap-2">
        <Car className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#1E40AF" }} />
        <div>
          <p className="text-base font-bold text-gray-900">
            {order.vehicleModel}
          </p>
          <p className="text-sm text-gray-700">{order.menuName}</p>
          {order.addOptions.map((a) => (
            <p key={a} className="text-xs text-gray-500">
              + {a}
            </p>
          ))}
        </div>
      </div>
      <ul className="mb-4 flex flex-col gap-1.5 text-sm">
        <li className="flex items-start gap-2 text-gray-700">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          {order.scheduledLabel}
        </li>
        <li className="flex items-start gap-2 text-gray-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          {order.location}
        </li>
        {order.mechanicName && (
          <li className="flex items-start gap-2 text-gray-700">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            {order.mechanicName}
            {order.mechanicPhone ? ` · ${order.mechanicPhone}` : ""}
          </li>
        )}
      </ul>
      <div className="mb-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-500">결제</span>
        <span className="text-base font-bold tabular-nums text-gray-900">
          {formatKRW(order.total)}
        </span>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/order/${order.id}`}
          className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F97316" }}
        >
          상세보기
          <ChevronRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() =>
            alert(
              `정비사 연락 (시연용)\n${order.mechanicName} ${order.mechanicPhone}`
            )
          }
          className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Phone className="h-4 w-4" />
          정비사 연락
        </button>
      </div>
    </motion.article>
  )
}

function CompletedCard({
  order,
  onShowReceipt,
}: {
  order: HistoryOrder
  onShowReceipt: () => void
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
    >
      <div className="mb-2 flex items-center justify-between">
        <StatusPill status={order.status} />
        <span className="text-xs text-gray-500">{order.date}</span>
      </div>
      <p className="mb-1 text-sm font-semibold text-gray-900">
        {order.vehicleModel}{" "}
        <span className="text-gray-500">/ {order.menuOilSpec}</span>
      </p>
      <p className="mb-3 text-base font-bold tabular-nums text-gray-900">
        {formatKRW(order.total)}
      </p>
      {order.rating && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-gray-50 p-2.5">
          <div className="flex shrink-0 items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                fill={i < (order.rating ?? 0) ? "#FACC15" : "transparent"}
                stroke={i < (order.rating ?? 0) ? "#FACC15" : "#D1D5DB"}
                strokeWidth={1.5}
              />
            ))}
          </div>
          {order.review && (
            <p className="line-clamp-2 text-xs text-gray-700">
              &ldquo;{order.review}&rdquo;
            </p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Link
          href={`/order/menu?vehicleId=${order.vehicleId}&prefilledMenu=${order.menuId}`}
          className="flex h-11 flex-1 items-center justify-center gap-1 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F97316" }}
        >
          <Plus className="h-4 w-4" />
          재주문하기
        </Link>
        <button
          type="button"
          onClick={onShowReceipt}
          className="flex h-11 flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Receipt className="h-4 w-4" />
          영수증
        </button>
      </div>
    </motion.article>
  )
}

function CancelledCard({ order }: { order: HistoryOrder }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl bg-gray-100 p-4 ring-1 ring-gray-200"
    >
      <div className="mb-2 flex items-center justify-between">
        <StatusPill status={order.status} />
        <span className="text-xs text-gray-500">{order.date}</span>
      </div>
      <p className="mb-1 text-sm font-medium text-gray-700">
        {order.vehicleModel} / {order.menuOilSpec}
      </p>
      <p className="mb-3 text-sm tabular-nums text-gray-500 line-through">
        {formatKRW(order.total)}
      </p>
      {order.cancelReason && (
        <div className="rounded-lg bg-white px-3 py-2 text-xs text-gray-600">
          <p>
            <span className="text-gray-400">사유 · </span>
            {order.cancelReason}
          </p>
          {order.refundStatus && (
            <p className="mt-1 text-green-700">{order.refundStatus}</p>
          )}
        </div>
      )}
    </motion.article>
  )
}

function EmptyState({
  title,
  ctaHref,
  ctaLabel,
}: {
  title: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center rounded-xl bg-white py-12 text-center shadow-sm ring-1 ring-gray-200"
    >
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Calendar className="h-7 w-7 text-gray-400" />
      </div>
      <p className="mb-4 text-sm text-gray-600">{title}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="inline-flex h-11 items-center rounded-lg px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F97316" }}
        >
          {ctaLabel}
        </Link>
      )}
    </motion.div>
  )
}

function ReceiptModal({
  order,
  onClose,
}: {
  order: HistoryOrder | null
  onClose: () => void
}) {
  return (
    <DialogPrimitive.Root
      open={order !== null}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl outline-none data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
        >
          <DialogPrimitive.Title className="sr-only">영수증</DialogPrimitive.Title>
          <header className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
            <h2 className="text-base font-bold text-gray-900">영수증</h2>
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
            <div className="px-6 py-5">
              <div className="mb-5 text-center">
                <p
                  className="mb-1 text-xl font-extrabold tracking-tight"
                  style={{ color: "#1E40AF" }}
                >
                  OilRun
                </p>
                <p className="text-xs text-gray-500">출장 오일교환</p>
              </div>
              <dl className="mb-4 flex flex-col gap-2 border-y border-dashed border-gray-200 py-4 text-sm">
                <ReceiptRow label="주문번호" value={order.id} mono />
                <ReceiptRow label="결제일" value={order.date} />
                <ReceiptRow
                  label="차량"
                  value={`${order.vehicleModel} (${order.vehiclePlate})`}
                />
                <ReceiptRow label="작업" value={order.menuName} />
                {order.addOptions.length > 0 && (
                  <ReceiptRow
                    label="추가"
                    value={order.addOptions.join(", ")}
                  />
                )}
                <ReceiptRow label="위치" value={order.location} />
                {order.mechanicName && (
                  <ReceiptRow label="담당" value={order.mechanicName} />
                )}
              </dl>
              <div className="mb-5 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm font-bold text-gray-900">합계</span>
                <span className="text-xl font-bold tabular-nums text-gray-900">
                  {formatKRW(order.total)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toast("영수증 다운로드 (시연용)")}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                다운로드
              </button>
              <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-gray-400">
                <Check className="h-3 w-3" />
                결제 완료된 시연용 영수증입니다
              </p>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function ReceiptRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs text-gray-500">{label}</dt>
      <dd
        className={`text-right text-sm text-gray-900 ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  )
}
