"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChevronLeft, Download, TrendingUp } from "lucide-react"
import { shopInfo, shopOrders, weeklyRevenue } from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

type Period = "week" | "month"

const MONTHLY_REVENUE = [
  { date: "1주차", revenue: 9420000, orders: 84 },
  { date: "2주차", revenue: 10840000, orders: 96 },
  { date: "3주차", revenue: 12150000, orders: 108 },
  { date: "4주차", revenue: 11380000, orders: 102 },
]

const MENU_BREAKDOWN = [
  { name: "기본형 합성유 5W-30", count: 38, revenue: 3382000 },
  { name: "프리미엄 합성유 0W-20", count: 22, revenue: 2838000 },
  { name: "터보 전용 5W-40", count: 9, revenue: 1341000 },
]

const RECENT_PAYMENTS = [
  { time: "16:32", customer: "박지호", menu: "프리미엄 0W-20 +옵션", amount: 144000 },
  { time: "13:30", customer: "김선우", menu: "기본형 5W-30", amount: 89000 },
  { time: "12:00", customer: "이서영", menu: "프리미엄 0W-20", amount: 129000 },
  { time: "11:00", customer: "윤재민", menu: "프리미엄 0W-20", amount: 129000 },
  { time: "10:30", customer: "조하늘", menu: "기본형 5W-30", amount: 89000 },
  { time: "10:00", customer: "강민준", menu: "터보 5W-40", amount: 149000 },
  { time: "09:30", customer: "송지유", menu: "기본형 5W-30", amount: 89000 },
]

export default function ShopRevenuePage() {
  const [period, setPeriod] = useState<Period>("week")

  const data = period === "week" ? weeklyRevenue : MONTHLY_REVENUE

  const stats = useMemo(() => {
    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
    const totalOrders = data.reduce((s, d) => s + d.orders, 0)
    const avg = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    return { totalRevenue, totalOrders, avg }
  }, [data])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-gray-200 bg-white px-4 sm:px-6">
        <Link
          href="/shop"
          className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          aria-label="뒤로"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 truncate text-base font-bold text-gray-900">
          매출 상세
        </h1>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-3.5 w-3.5" />
          엑셀
        </button>
      </header>

      <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            label="오늘 매출"
            value={shopInfo.todayRevenue}
            sub="주문 5건 · 객단가 85,000원"
            tone="primary"
          />
          <SummaryCard
            label="이번 주 매출"
            value={11770000}
            sub="주문 104건 · 전주 대비 +12%"
            tone="default"
          />
          <SummaryCard
            label="이번 달 매출"
            value={43790000}
            sub="주문 390건 · 전월 대비 +8%"
            tone="default"
          />
        </section>

        <section className="mb-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">매출 추이</h2>
              <p className="text-xs text-gray-500">
                {period === "week" ? "최근 7일" : "이번 달 4주"}
              </p>
            </div>
            <div className="inline-flex rounded-full bg-gray-100 p-0.5">
              {(
                [
                  ["week", "주간"],
                  ["month", "월간"],
                ] as const
              ).map(([v, label]) => {
                const active = period === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPeriod(v)}
                    className="h-8 rounded-full px-4 text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: active ? "#FFFFFF" : "transparent",
                      color: active ? "#1E40AF" : "#6B7280",
                      boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
              <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatKRW(value), "매출"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1E40AF"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#1E40AF" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <ul className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
            <li>
              <p className="text-[11px] text-gray-500">총 매출</p>
              <p className="text-sm font-bold tabular-nums text-gray-900">
                {formatKRW(stats.totalRevenue)}
              </p>
            </li>
            <li>
              <p className="text-[11px] text-gray-500">총 주문</p>
              <p className="text-sm font-bold tabular-nums text-gray-900">
                {stats.totalOrders}건
              </p>
            </li>
            <li>
              <p className="text-[11px] text-gray-500">평균 객단가</p>
              <p className="text-sm font-bold tabular-nums text-gray-900">
                {formatKRW(stats.avg)}
              </p>
            </li>
          </ul>
        </section>

        <div className="mb-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-1 text-base font-bold text-gray-900">
              메뉴별 매출
            </h2>
            <p className="mb-4 text-xs text-gray-500">이번 달 누적</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MENU_BREAKDOWN} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#374151"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [formatKRW(value), "매출"]}
                />
                <Bar dataKey="revenue" fill="#1E40AF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
              {MENU_BREAKDOWN.map((m) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-700">{m.name}</span>
                  <span className="tabular-nums text-gray-500">
                    {m.count}건
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">정산 요약</h2>
                <p className="text-xs text-gray-500">2026.05 회차</p>
              </div>
              <Link
                href="/shop/settlement"
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                정산 흐름 보기 →
              </Link>
            </div>

            <ul className="space-y-2.5">
              <RowDetail label="이번 주 매출" value={11770000} />
              <RowDetail
                label="플랫폼 수수료 (15%)"
                value={-1765500}
                tone="deduct"
              />
              <RowDetail label="PG 수수료 (3%)" value={-353100} tone="deduct" />
              <RowDetail label="VAT 별도" value={0} tone="muted" />
              <li className="mt-3 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    예상 정산액
                  </p>
                  <p className="text-[10px] text-blue-600">
                    2026.05.08 (월) 입금 예정
                  </p>
                </div>
                <p className="text-lg font-bold tabular-nums text-blue-900">
                  {formatKRW(9651400)}
                </p>
              </li>
            </ul>

            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-[11px] text-orange-800">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              지난주 대비 매출 +12% 상승했어요
            </div>
          </section>
        </div>

        <section className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">최근 결제</h2>
              <p className="text-xs text-gray-500">오늘</p>
            </div>
            <span className="text-xs text-gray-500">
              총 {RECENT_PAYMENTS.length}건
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {RECENT_PAYMENTS.map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-12 font-mono text-xs tabular-nums text-gray-500">
                    {p.time}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {p.customer}
                    </p>
                    <p className="text-xs text-gray-500">{p.menu}</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums text-gray-900">
                  +{formatKRW(p.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 text-center text-[11px] text-gray-400">
          정산 1주 단위 · 매주 월요일 입금 · 시연용 데이터
        </p>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: number
  sub: string
  tone: "primary" | "default"
}) {
  const isPrimary = tone === "primary"
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5 shadow-sm ring-1"
      style={{
        backgroundColor: isPrimary ? "#1E40AF" : "#FFFFFF",
        boxShadow: isPrimary
          ? "0 4px 18px rgba(30,64,175,0.18)"
          : "0 1px 2px rgba(0,0,0,0.04)",
        ["--tw-ring-color" as string]: isPrimary ? "transparent" : "#E5E7EB",
      }}
    >
      <p
        className="mb-2 text-xs font-semibold"
        style={{ color: isPrimary ? "#BFDBFE" : "#6B7280" }}
      >
        {label}
      </p>
      <p
        className="mb-1 text-2xl font-bold tabular-nums"
        style={{ color: isPrimary ? "#FFFFFF" : "#111827" }}
      >
        {formatKRW(value)}
      </p>
      <p
        className="text-[11px]"
        style={{ color: isPrimary ? "#BFDBFE" : "#9CA3AF" }}
      >
        {sub}
      </p>
    </motion.div>
  )
}

function RowDetail({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: number
  tone?: "default" | "deduct" | "muted"
}) {
  const color =
    tone === "deduct" ? "#B91C1C" : tone === "muted" ? "#9CA3AF" : "#111827"
  return (
    <li className="flex items-baseline justify-between border-b border-gray-100 pb-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color }}
      >
        {tone === "muted" ? "별도 정산" : formatKRW(value)}
      </span>
    </li>
  )
}
