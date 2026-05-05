"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  adminDistrictDistribution,
  adminRatingDistribution,
  adminVehicleAvg,
  monthlyGmv,
} from "@/lib/admin-mock"
import { adminHourlyDistribution } from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

const WEEKDAY_HEAT: { day: string; values: number[] }[] = [
  { day: "월", values: [0, 1, 2, 3, 2, 1] },
  { day: "화", values: [1, 2, 3, 4, 3, 2] },
  { day: "수", values: [1, 2, 3, 5, 3, 1] },
  { day: "목", values: [2, 3, 4, 5, 4, 2] },
  { day: "금", values: [2, 4, 5, 6, 5, 3] },
  { day: "토", values: [3, 5, 6, 7, 6, 4] },
  { day: "일", values: [1, 2, 3, 4, 3, 2] },
]
const HEAT_LABELS = ["09–11", "11–13", "14–16", "16–18", "18–20", "20–22"]

const REPURCHASE = [
  { label: "단일 구매", value: 36 },
  { label: "2회", value: 14 },
  { label: "3회 이상", value: 26 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="월별 GMV 추이" subtitle="최근 5개월">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyGmv}>
                <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
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
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  formatter={(value) => [formatKRW(Number(value) || 0), "GMV"]}
                />
                <Line
                  type="monotone"
                  dataKey="gmv"
                  stroke="#1E40AF"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#1E40AF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="시간대별 주문" subtitle="오늘">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={adminHourlyDistribution}>
                <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
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
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="#F97316"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="요일·시간대 히트맵" subtitle="최근 4주 평균 주문 수">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead>
                <tr>
                  <th className="w-10 py-2"></th>
                  {HEAT_LABELS.map((h) => (
                    <th
                      key={h}
                      className="py-2 text-center font-medium text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEKDAY_HEAT.map((row) => (
                  <tr key={row.day}>
                    <td className="py-1 pr-2 text-right font-semibold text-gray-700">
                      {row.day}
                    </td>
                    {row.values.map((v, i) => (
                      <td key={i} className="p-0.5">
                        <div
                          className="flex h-9 items-center justify-center rounded-md text-[11px] font-semibold"
                          style={{
                            backgroundColor: `rgba(30, 64, 175, ${v / 7})`,
                            color: v >= 4 ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {v}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="차종별 객단가 TOP 10">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={adminVehicleAvg}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}천`}
                />
                <YAxis
                  type="category"
                  dataKey="model"
                  stroke="#374151"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  formatter={(value) => [formatKRW(Number(value) || 0), "객단가"]}
                />
                <Bar dataKey="avgPrice" fill="#1E40AF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="지역별 주문 분포">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={adminDistrictDistribution}>
                <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis
                  dataKey="district"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {adminDistrictDistribution.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"][i]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="평점 분포">
            <ul className="flex flex-col gap-2.5">
              {adminRatingDistribution.map((r) => {
                const total = adminRatingDistribution.reduce(
                  (s, x) => s + x.count,
                  0
                )
                const pct = total > 0 ? (r.count / total) * 100 : 0
                return (
                  <li key={r.rating} className="flex items-center gap-3">
                    <span className="w-12 text-sm tabular-nums text-gray-700">
                      ⭐ {r.rating}
                    </span>
                    <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "#FACC15",
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums text-gray-600">
                      {r.count}건
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card title="재구매 전환">
            <ul className="flex flex-col gap-3">
              {REPURCHASE.map((r) => (
                <li
                  key={r.label}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <span className="text-sm text-gray-700">{r.label}</span>
                  <span className="text-base font-bold tabular-nums text-gray-900">
                    {r.value}명
                  </span>
                </li>
              ))}
              <li className="rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-900">
                전체 76건 중 재구매(2회 이상)는 40명 ·{" "}
                <span className="font-bold">52.6%</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
