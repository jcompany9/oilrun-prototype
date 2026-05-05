"use client"

import { motion } from "framer-motion"
import { toast } from "sonner"
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
import {
  AlertTriangle,
  Calendar,
  ShoppingBag,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react"
import {
  adminClaims,
  adminHourlyDistribution,
  adminKPI,
  adminRecentOrders,
  weeklyRevenue,
  type AdminOrderRow,
  type AdminOrderStatus,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

const STATUS_BADGE: Record<
  AdminOrderStatus,
  { label: string; bg: string; fg: string; pulse?: boolean }
> = {
  completed: { label: "완료", bg: "#E5E7EB", fg: "#374151" },
  in_progress: { label: "진행중", bg: "#FED7AA", fg: "#C2410C", pulse: true },
  scheduled: { label: "예정", bg: "#DBEAFE", fg: "#1E40AF" },
  cancelled: { label: "취소", bg: "#FEE2E2", fg: "#B91C1C" },
}

export default function AdminDashboardPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            tone="blue"
            label="오늘 GMV"
            value={formatKRW(adminKPI.todayGmv)}
            footer={`어제 대비 +${adminKPI.gmvDelta}%`}
            footerTone="positive"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KpiCard
            tone="orange"
            label="오늘 주문"
            value={`${adminKPI.todayOrders}건`}
            footer={`완료 ${adminKPI.ordersCompleted} / 진행 ${adminKPI.ordersInProgress}`}
            icon={<ShoppingBag className="h-5 w-5" />}
          />
          <KpiCard
            tone="purple"
            label="활성 정비소"
            value={`${adminKPI.activeShops}곳`}
            footer="베타 운영 중"
            icon={<Wrench className="h-5 w-5" />}
          />
          <KpiCard
            tone="green"
            label="평균 평점"
            value={`⭐ ${adminKPI.averageRating}`}
            footer={`리뷰 ${adminKPI.reviewCount}건`}
            icon={<Star className="h-5 w-5" />}
          />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="7일 매출 추이" subtitle="지난 7일간의 일 매출">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={weeklyRevenue}
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              >
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
                  tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                />
                <Tooltip
                  cursor={{ stroke: "#DBEAFE", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [formatKRW(value), "매출"]}
                  labelFormatter={(label) => `${label}`}
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
          </ChartCard>

          <ChartCard title="시간대별 주문 분포" subtitle="오늘 시간대별 누적">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={adminHourlyDistribution}
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              >
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
                  cursor={{ fill: "#FFF7ED" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${value}건`, "주문"]}
                />
                <Bar
                  dataKey="orders"
                  fill="#F97316"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <RecentOrdersTable rows={adminRecentOrders} />
          <aside className="hidden flex-col gap-4 lg:flex">
            <SidebarWidget title="🔴 처리 필요">
              <ul className="flex flex-col gap-2">
                {adminClaims.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900">
                        {c.type === "claim" ? "클레임" : "환불 요청"}
                      </p>
                      <p className="text-xs text-gray-600">{c.text}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {c.createdAt}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </SidebarWidget>
            <SidebarWidget title="📊 이번 주 통계">
              <ul className="flex flex-col gap-2 text-xs">
                <StatRow label="이번 주 GMV" value="8,420,000원" />
                <StatRow label="이번 주 주문" value="76건" />
                <StatRow label="신규 차주" value="+18명" />
                <StatRow label="평균 단가" value="110,800원" />
              </ul>
            </SidebarWidget>
            <SidebarWidget title="최근 가입 정비소">
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2.5">
                <Calendar className="h-4 w-4 shrink-0 text-blue-700" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900">
                    성수자동차정비
                  </p>
                  <p className="text-[11px] text-gray-600">
                    1호점 · 베타 파트너
                  </p>
                </div>
              </div>
            </SidebarWidget>
          </aside>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  tone,
  label,
  value,
  footer,
  footerTone,
  icon,
}: {
  tone: "blue" | "orange" | "purple" | "green"
  label: string
  value: string
  footer: string
  footerTone?: "positive"
  icon: React.ReactNode
}) {
  const palette: Record<string, { bg: string; fg: string; ring: string }> = {
    blue: { bg: "#DBEAFE", fg: "#1E40AF", ring: "#BFDBFE" },
    orange: { bg: "#FFEDD5", fg: "#C2410C", ring: "#FED7AA" },
    purple: { bg: "#E9D5FF", fg: "#6B21A8", ring: "#DDD6FE" },
    green: { bg: "#DCFCE7", fg: "#15803D", ring: "#BBF7D0" },
  }
  const c = palette[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-32 flex-col justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-gray-900">
          {value}
        </p>
        {footerTone === "positive" ? (
          <span className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
            {footer}
          </span>
        ) : (
          <p className="mt-1 text-[11px] text-gray-500">{footer}</p>
        )}
      </div>
    </motion.div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function RecentOrdersTable({ rows }: { rows: AdminOrderRow[] }) {
  const onClickRow = (row: AdminOrderRow) => {
    toast(`주문 상세 (관리자 화면)`, {
      description: `${row.id} · ${row.customerName} ${row.vehicle}`,
    })
  }
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-bold text-gray-900">최근 주문</h2>
        <p className="text-xs text-gray-500">최근 10건</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-semibold text-gray-500">
              <th className="px-4 py-2.5">주문번호</th>
              <th className="px-4 py-2.5">차주</th>
              <th className="px-4 py-2.5">차량</th>
              <th className="px-4 py-2.5">메뉴</th>
              <th className="px-4 py-2.5 text-right">금액</th>
              <th className="px-4 py-2.5">정비소</th>
              <th className="px-4 py-2.5">상태</th>
              <th className="px-4 py-2.5 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const badge = STATUS_BADGE[row.status]
              return (
                <tr
                  key={row.id}
                  onClick={() => onClickRow(row)}
                  className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-mono text-[11px] tabular-nums text-gray-700">
                    {row.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.customerName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {row.vehicle}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {row.menuName}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-gray-900">
                    {formatKRW(row.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {row.shopName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.pulse ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: badge.bg, color: badge.fg }}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-gray-600">
                    {row.time}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SidebarWidget({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <h3 className="mb-3 text-sm font-bold text-gray-900">{title}</h3>
      {children}
    </section>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold tabular-nums text-gray-900">{value}</span>
    </li>
  )
}
