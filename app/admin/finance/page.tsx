"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  financeSettlements,
  financeSummary,
  type FinanceSettlementStatus,
} from "@/lib/admin-mock"
import { formatKRW } from "@/lib/utils"

const SUMMARY_ROWS: {
  label: string
  key: keyof typeof financeSummary
  tone: "default" | "deduct" | "highlight"
}[] = [
  { label: "총 GMV", key: "totalGmv", tone: "default" },
  { label: "회사 수수료 수입", key: "fee", tone: "highlight" },
  { label: "정비소 정산 예정", key: "payouts", tone: "deduct" },
  { label: "PG 수수료", key: "pgFee", tone: "deduct" },
  { label: "알림톡 비용", key: "alimtalkFee", tone: "deduct" },
  { label: "순수익", key: "netRevenue", tone: "highlight" },
]

type Tab = "all" | FinanceSettlementStatus

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: "정산 대기" },
  { value: "processing", label: "정산 진행중" },
  { value: "paid", label: "정산 완료" },
]

const STATUS_BADGE: Record<
  FinanceSettlementStatus,
  { label: string; bg: string; fg: string }
> = {
  pending: { label: "정산 대기", bg: "#FEF3C7", fg: "#A16207" },
  processing: { label: "정산 진행중", bg: "#DBEAFE", fg: "#1E40AF" },
  paid: { label: "정산 완료", bg: "#DCFCE7", fg: "#15803D" },
}

export default function AdminFinancePage() {
  const [tab, setTab] = useState<Tab>("all")

  const counts = useMemo(() => {
    const c: Record<FinanceSettlementStatus, number> = {
      pending: 0,
      processing: 0,
      paid: 0,
    }
    financeSettlements.forEach((s) => {
      c[s.status]++
    })
    return c
  }, [])

  const filtered = useMemo(() => {
    if (tab === "all") return financeSettlements
    return financeSettlements.filter((s) => s.status === tab)
  }, [tab])

  const tabTotals = useMemo(() => {
    const sum = filtered.reduce(
      (acc, s) => {
        acc.gmv += s.gmv
        acc.payout += s.payout
        return acc
      },
      { gmv: 0, payout: 0 }
    )
    return sum
  }, [filtered])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-1 text-base font-bold text-gray-900">
            이번 달 수익 요약
          </h2>
          <p className="mb-5 text-xs text-gray-500">2026년 5월</p>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {SUMMARY_ROWS.map((r) => (
              <SummaryStat
                key={r.key}
                label={r.label}
                value={financeSummary[r.key]}
                tone={r.tone}
              />
            ))}
          </ul>
        </section>

        <section className="mb-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                정비소별 정산 내역
              </h2>
              <p className="text-xs text-gray-500">
                선택 {filtered.length}건 · GMV {formatKRW(tabTotals.gmv)} ·
                정산액 {formatKRW(tabTotals.payout)}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                tab === "pending"
                  ? toast.success("대기 중인 정산을 진행 처리했어요")
                  : tab === "processing"
                    ? toast.success("진행 중인 정산을 완료 처리했어요")
                    : toast("이미 처리된 정산입니다")
              }
              disabled={tab === "paid" || tab === "all"}
              className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-bold text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#1E40AF" }}
            >
              {tab === "pending"
                ? "대기 → 진행"
                : tab === "processing"
                  ? "진행 → 완료"
                  : "일괄 처리"}
            </button>
          </div>

          <div className="flex items-center gap-1.5 border-b border-gray-100 px-5 py-3">
            {TABS.map((t) => {
              const active = tab === t.value
              const count =
                t.value === "all"
                  ? financeSettlements.length
                  : counts[t.value]
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTab(t.value)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: active ? "#1E40AF" : "#F3F4F6",
                    color: active ? "#FFFFFF" : "#374151",
                  }}
                >
                  {t.label}
                  <span
                    className="rounded-full px-1.5 text-[10px] font-bold tabular-nums"
                    style={{
                      backgroundColor: active
                        ? "rgba(255,255,255,0.2)"
                        : "#FFFFFF",
                      color: active ? "#FFFFFF" : "#6B7280",
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-semibold text-gray-500">
                  <th className="px-5 py-2.5">정비소</th>
                  <th className="px-5 py-2.5">기간</th>
                  <th className="px-5 py-2.5 text-right">GMV</th>
                  <th className="px-5 py-2.5 text-right">수수료</th>
                  <th className="px-5 py-2.5 text-right">정산액</th>
                  <th className="px-5 py-2.5">상태</th>
                  <th className="px-5 py-2.5">예정·완료일</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const badge = STATUS_BADGE[s.status]
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">
                        {s.shopName}
                      </td>
                      <td className="px-5 py-3 text-xs tabular-nums text-gray-600">
                        {s.period}
                      </td>
                      <td className="px-5 py-3 text-right text-sm tabular-nums text-gray-900">
                        {formatKRW(s.gmv)}
                      </td>
                      <td className="px-5 py-3 text-right text-sm tabular-nums text-gray-700">
                        {formatKRW(s.fee)}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-gray-900">
                        {formatKRW(s.payout)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.fg,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs tabular-nums text-gray-500">
                        {s.paidAt ?? s.scheduledAt ?? "—"}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-gray-500"
                    >
                      해당 상태의 정산 내역이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-1 text-base font-bold text-gray-900">
            세금계산서 발행 내역
          </h2>
          <p className="mb-4 text-xs text-gray-500">최근 6개월</p>
          <ul className="space-y-2 text-sm">
            <ReceiptLine date="2026.04.30" customer="성수자동차정비" amount={918000} />
            <ReceiptLine date="2026.03.31" customer="성수자동차정비" amount={782000} />
            <ReceiptLine date="2026.02.28" customer="성수자동차정비" amount={648000} />
          </ul>
        </section>
      </div>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "default" | "deduct" | "highlight"
}) {
  const color =
    tone === "highlight" ? "#1E40AF" : tone === "deduct" ? "#B91C1C" : "#111827"
  const prefix = tone === "deduct" ? "-" : tone === "highlight" ? "+" : ""
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gray-50 p-4"
    >
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>
        {prefix}
        {formatKRW(value)}
      </p>
    </motion.li>
  )
}

function ReceiptLine({
  date,
  customer,
  amount,
}: {
  date: string
  customer: string
  amount: number
}) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
      <span className="tabular-nums text-gray-600">{date}</span>
      <span className="text-gray-900">{customer}</span>
      <span className="font-semibold tabular-nums text-gray-900">
        {formatKRW(amount)}
      </span>
    </li>
  )
}
