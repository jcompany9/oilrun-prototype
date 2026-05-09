"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Search,
  Bell,
  Crown,
  Phone,
  Calendar,
  PlayCircle,
  MessageSquare,
} from "lucide-react"
import {
  saasCustomers,
  channelLabel,
  channelEmoji,
  channelColor,
  jobTypeEmoji,
  jobTypeLabel,
  findVideoById,
  type SaasCustomer,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

type Filter = "all" | "due" | "vip" | "youtube"

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "due", label: "정비 권장" },
  { id: "vip", label: "VIP 단골" },
  { id: "youtube", label: "유튜브 유입" },
]

export default function CustomersPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")
  const [reminded, setReminded] = useState<string[]>([])

  const customers = useMemo(() => {
    let list = saasCustomers
    if (filter === "due") list = list.filter((c) => c.isDue)
    if (filter === "vip") list = list.filter((c) => c.isVip)
    if (filter === "youtube") list = list.filter((c) => c.source === "youtube")
    if (search) {
      const s = search.trim()
      list = list.filter(
        (c) =>
          c.name.includes(s) ||
          c.vehiclePlate.includes(s) ||
          c.vehicleModel.includes(s)
      )
    }
    return list
  }, [filter, search])

  const dueCount = saasCustomers.filter((c) => c.isDue).length

  const sendReminder = (c: SaasCustomer) => {
    setReminded((prev) => [...prev, c.id])
    toast.success(`${c.name}님께 알림톡 발송`, {
      description: `${c.vehicleModel} · ${c.nextDueLabel}`,
    })
  }

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">고객·차량</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              총 {saasCustomers.length}명 · 정비 권장{" "}
              <span className="font-bold text-orange-600">{dueCount}명</span>
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름·차량번호·차종"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none sm:w-72"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                filter === f.id
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {customers.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-500">
            조건에 맞는 고객이 없어요
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {customers.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <CustomerCard
                  customer={c}
                  reminded={reminded.includes(c.id)}
                  onSendReminder={() => sendReminder(c)}
                />
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function CustomerCard({
  customer,
  reminded,
  onSendReminder,
}: {
  customer: SaasCustomer
  reminded: boolean
  onSendReminder: () => void
}) {
  const ch = channelColor[customer.source]
  const video = findVideoById(customer.videoRef)

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold"
          style={{
            backgroundColor: customer.isVip ? "#FED7AA" : "#DBEAFE",
            color: customer.isVip ? "#C2410C" : "#1E40AF",
          }}
        >
          {customer.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-base font-bold text-gray-900">{customer.name}</p>
            {customer.isVip && (
              <span
                className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
              >
                <Crown className="h-2.5 w-2.5" />
                VIP
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {customer.vehicleModel} ({customer.vehicleYear}) · {customer.vehiclePlate}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            <Phone className="mr-1 inline h-2.5 w-2.5" />
            {customer.phone}
          </p>
        </div>
        <span
          className="shrink-0 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: ch.bg, color: ch.fg }}
        >
          {channelEmoji[customer.source]} {channelLabel[customer.source]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px border-y border-gray-100 bg-gray-50">
        <div className="bg-white px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            방문
          </p>
          <p className="text-sm font-bold tabular-nums text-gray-900">
            {customer.visitCount}회
          </p>
        </div>
        <div className="bg-white px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            누적
          </p>
          <p className="text-sm font-bold tabular-nums text-gray-900">
            {(customer.totalSpent / 10000).toFixed(0)}만원
          </p>
        </div>
        <div className="bg-white px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            첫 방문
          </p>
          <p className="text-sm font-bold tabular-nums text-gray-900">
            {customer.firstVisit.slice(2)}
          </p>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500">최근 정비</p>
            <p className="text-sm text-gray-900">
              <span className="text-base">{jobTypeEmoji[customer.lastServiceType]}</span>{" "}
              {customer.lastServiceMenu}
            </p>
            <p className="text-[11px] text-gray-500">
              {customer.lastServiceDate} · {formatKRW(customer.totalSpent / customer.visitCount)} 평균
            </p>
          </div>
        </div>

        <div
          className={`flex items-start gap-2 rounded-lg px-2.5 py-2 ${
            customer.isDue ? "bg-orange-50" : "bg-blue-50"
          }`}
        >
          <Bell
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              customer.isDue ? "text-orange-600" : "text-blue-600"
            }`}
          />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: customer.isDue ? "#C2410C" : "#1E40AF" }}>
              다음 정비
            </p>
            <p className="text-sm font-bold" style={{ color: customer.isDue ? "#C2410C" : "#1E40AF" }}>
              {customer.nextDueLabel}
            </p>
          </div>
          {customer.isDue && (
            <button
              type="button"
              onClick={onSendReminder}
              disabled={reminded}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1.5 text-[11px] font-bold text-white transition-opacity disabled:opacity-50"
            >
              <MessageSquare className="h-3 w-3" />
              {reminded ? "발송됨" : "알림톡"}
            </button>
          )}
        </div>

        {video && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px]">
            <PlayCircle className="h-3.5 w-3.5 shrink-0 text-red-600" />
            <span className="font-bold text-red-700">유튜브 유입:</span>
            <span className="truncate text-red-900">{video.title}</span>
          </div>
        )}
      </div>
    </article>
  )
}
