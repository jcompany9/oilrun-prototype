"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  saasLocations,
  channelRevenueShare,
  channelLabel,
  channelColor,
  menuRevenueByMonth,
  jobTypeColor,
  locationDailyRevenue,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

export default function RevenuePage() {
  const monthTotal = saasLocations.reduce((s, l) => s + l.monthRevenue, 0)
  const todayTotal = saasLocations.reduce((s, l) => s + l.todayRevenue, 0)
  const channelMonthTotal = channelRevenueShare.reduce((s, c) => s + c.monthRevenue, 0)
  const totalBookings = channelRevenueShare.reduce((s, c) => s + c.bookings, 0)
  const avgPerBooking = Math.round(channelMonthTotal / totalBookings)

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-xl font-extrabold text-gray-900">매출 대시보드</h1>
        <p className="mt-0.5 text-xs text-gray-500">2026년 5월 · 본점 + 2호점 통합</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="이번 달 매출"
            value={formatKRW(monthTotal)}
            change="+18%"
            up
          />
          <KpiCard label="오늘 매출" value={formatKRW(todayTotal)} change="+5%" up />
          <KpiCard
            label="이번 달 예약"
            value={`${totalBookings}건`}
            change="+12%"
            up
          />
          <KpiCard
            label="예약당 평균"
            value={formatKRW(avgPerBooking)}
            change="-2%"
            up={false}
          />
        </div>

        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-bold text-gray-900">지점별 일 매출 추이 (지난 7일)</h2>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={locationDailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9CA3AF"
                    tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => formatKRW(Number(v))}
                  />
                  <Line
                    type="monotone"
                    dataKey="main"
                    name="본점"
                    stroke="#1E40AF"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="branch1"
                    name="2호점"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-center gap-5 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-700" />
                본점
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                2호점
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900">채널별 비중</h2>
            <div className="mt-3 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelRevenueShare}
                    dataKey="share"
                    nameKey="channel"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {channelRevenueShare.map((entry) => (
                      <Cell key={entry.channel} fill={channelColor[entry.channel].fg} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, _, p) => {
                      const channel = (p as { payload?: { channel?: string } })?.payload?.channel
                      return [
                        `${v}%`,
                        channel ? channelLabel[channel as keyof typeof channelLabel] : "",
                      ]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-1.5">
              {channelRevenueShare.map((c) => (
                <li key={c.channel} className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: channelColor[c.channel].fg }}
                  />
                  <span className="font-medium text-gray-700">{channelLabel[c.channel]}</span>
                  <span className="ml-auto font-bold tabular-nums text-gray-900">{c.share}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">메뉴별 매출 (이번 달)</h2>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={menuRevenueByMonth} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  stroke="#9CA3AF"
                  tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                />
                <YAxis
                  type="category"
                  dataKey="menuName"
                  width={170}
                  tick={{ fontSize: 11 }}
                  stroke="#6B7280"
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => formatKRW(Number(v))}
                />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {menuRevenueByMonth.map((m) => (
                    <Cell key={m.menuName} fill={jobTypeColor[m.jobType]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  change,
  up,
}: {
  label: string
  value: string
  change: string
  up: boolean
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold tabular-nums text-gray-900 sm:text-2xl">
        {value}
      </p>
      <p
        className={`mt-1 inline-flex items-center gap-0.5 text-[11px] font-bold ${
          up ? "text-green-700" : "text-red-700"
        }`}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {change} 전월 대비
      </p>
    </div>
  )
}
