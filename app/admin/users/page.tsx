"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Search } from "lucide-react"
import { adminUsers, type AdminUserRow } from "@/lib/admin-mock"
import { formatKRW } from "@/lib/utils"

const STATUS_BADGE: Record<
  AdminUserRow["status"],
  { label: string; bg: string; fg: string }
> = {
  active: { label: "활성", bg: "#DCFCE7", fg: "#15803D" },
  dormant: { label: "휴면", bg: "#F3F4F6", fg: "#6B7280" },
  blocked: { label: "차단", bg: "#FEE2E2", fg: "#B91C1C" },
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdminUserRow["status"] | "all">(
    "all"
  )

  const filtered = useMemo(() => {
    return adminUsers.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false
      if (query.trim()) {
        const q = query.trim()
        if (!u.name.includes(q) && !u.phone.includes(q)) return false
      }
      return true
    })
  }, [query, statusFilter])

  const stats = useMemo(() => {
    const total = adminUsers.length
    const newThisMonth = 18
    const active = adminUsers.filter((u) => u.status === "active").length
    const repurchaseRate = 64
    return { total, newThisMonth, active, repurchaseRate }
  }, [])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <UserStat label="총 회원" value={`${stats.total}명`} />
          <UserStat
            label="이번 달 신규"
            value={`+${stats.newThisMonth}명`}
            tone="positive"
          />
          <UserStat label="활성 사용자" value={`${stats.active}명`} />
          <UserStat label="재구매율" value={`${stats.repurchaseRate}%`} />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-gray-200">
          {(
            [
              ["all", "전체"],
              ["active", "활성"],
              ["dormant", "휴면"],
              ["blocked", "차단"],
            ] as const
          ).map(([v, label]) => {
            const active = statusFilter === v
            return (
              <button
                key={v}
                type="button"
                onClick={() => setStatusFilter(v as typeof statusFilter)}
                className="h-8 rounded-full px-3 text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: active ? "#1E40AF" : "#F3F4F6",
                  color: active ? "#FFFFFF" : "#374151",
                }}
              >
                {label}
              </button>
            )
          })}
          <div className="relative ml-auto flex-1 min-w-[200px] max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름 / 전화번호 검색"
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-semibold text-gray-500">
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">이름</th>
                  <th className="px-4 py-2.5">전화</th>
                  <th className="px-4 py-2.5">가입일</th>
                  <th className="px-4 py-2.5 text-right">누적 주문</th>
                  <th className="px-4 py-2.5 text-right">누적 결제</th>
                  <th className="px-4 py-2.5 text-right">평균 평점</th>
                  <th className="px-4 py-2.5">상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 30).map((u) => {
                  const badge = STATUS_BADGE[u.status]
                  return (
                    <tr
                      key={u.id}
                      onClick={() =>
                        toast(`${u.name} 상세 (시연용)`, {
                          description: `${u.totalOrders}건 / ${formatKRW(u.totalPaid)}`,
                        })
                      }
                      className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono text-[11px] tabular-nums text-gray-700">
                        {u.id}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums text-gray-700">
                        {u.phone}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums text-gray-600">
                        {u.joinedAt}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-900">
                        {u.totalOrders}건
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-gray-900">
                        {formatKRW(u.totalPaid)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-700">
                        {u.averageRating > 0 ? `⭐ ${u.averageRating}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold"
                          style={{ backgroundColor: badge.bg, color: badge.fg }}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            <span>총 {filtered.length}명</span>
          </div>
        </section>
      </div>
    </div>
  )
}

function UserStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "positive"
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
        style={{ color: tone === "positive" ? "#15803D" : "#111827" }}
      >
        {value}
      </p>
    </motion.div>
  )
}
