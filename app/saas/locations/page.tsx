"use client"

import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  MapPin,
  Phone,
  Plus,
} from "lucide-react"
import {
  saasLocations,
  saasStaff,
  saasJobs,
  type SaasLocation,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

export default function LocationsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">지점 운영</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              {saasLocations.length}개 지점 · 본점 vs 2호점 비교
            </p>
          </div>
          <button
            type="button"
            className="hidden h-9 items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:inline-flex"
          >
            <Plus className="h-3.5 w-3.5" />
            지점 추가 (+29,000원/월)
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {saasLocations.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </section>

        <CompareTable />
      </div>
    </div>
  )
}

function LocationCard({ location }: { location: SaasLocation }) {
  const staff = saasStaff.filter((s) => s.locationId === location.id)
  const jobs = saasJobs.filter((j) => j.locationId === location.id)
  const inProgress = jobs.filter((j) => j.status === "in_progress").length
  const completed = jobs.filter((j) => j.status === "completed").length
  const upcoming = jobs.filter((j) => j.status === "scheduled").length
  const houseCalls = jobs.filter((j) => j.isHouseCall).length

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        className="px-5 py-4"
        style={{
          backgroundColor: location.isMain ? "#DBEAFE" : "#FED7AA",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2
                className="h-5 w-5"
                style={{ color: location.isMain ? "#1E40AF" : "#C2410C" }}
              />
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: location.isMain ? "#1E40AF" : "#C2410C" }}
              >
                {location.isMain ? "본점" : "2호점"}
              </p>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900">
              {location.name}
            </h2>
          </div>
          <div className="text-right">
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: location.isMain ? "#1E40AF" : "#C2410C" }}
            >
              오늘
            </p>
            <p
              className="text-xl font-extrabold tabular-nums"
              style={{ color: location.isMain ? "#1E40AF" : "#C2410C" }}
            >
              {formatKRW(location.todayRevenue)}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs text-gray-700">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            {location.address}
          </p>
          <p className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0" />
            {location.phone}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px border-y border-gray-100 bg-gray-50">
        <Stat label="이번 달" value={formatKRW(location.monthRevenue)} compact />
        <Stat label="직원" value={`${location.staffCount}명`} icon={Users} />
        <Stat label="오늘 일정" value={`${jobs.length}건`} icon={Calendar} />
        <Stat label="출장 🚐" value={`${houseCalls}건`} />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          작업 상태
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <StatusPill label="진행 중" count={inProgress} color="#15803D" bg="#DCFCE7" />
          <StatusPill label="예정" count={upcoming} color="#1E40AF" bg="#DBEAFE" />
          <StatusPill label="완료" count={completed} color="#374151" bg="#E5E7EB" />
        </div>

        <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          직원 ({staff.length}명)
        </h3>
        <ul className="flex flex-wrap gap-1.5">
          {staff.map((s) => (
            <li
              key={s.id}
              className={`inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] ${
                s.isOff ? "opacity-50" : ""
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-700">
                {s.avatar}
              </span>
              <span className="font-medium text-gray-700">{s.name}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{s.roleLabel}</span>
              {s.isOff && <span className="text-orange-600">(휴무)</span>}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
  compact,
}: {
  label: string
  value: string
  icon?: typeof Users
  compact?: boolean
}) {
  return (
    <div className="bg-white px-2 py-2 sm:px-3">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {Icon && <Icon className="h-2.5 w-2.5" />}
        {label}
      </p>
      <p
        className={`tabular-nums font-bold text-gray-900 ${
          compact ? "text-[11px]" : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function StatusPill({
  label,
  count,
  color,
  bg,
}: {
  label: string
  count: number
  color: string
  bg: string
}) {
  return (
    <div className="rounded-lg px-3 py-2 text-center" style={{ backgroundColor: bg }}>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
        {label}
      </p>
      <p className="mt-0.5 text-lg font-extrabold tabular-nums" style={{ color }}>
        {count}
      </p>
    </div>
  )
}

function CompareTable() {
  const [main, branch] = saasLocations
  const mainStaff = saasStaff.filter((s) => s.locationId === main.id).length
  const branchStaff = saasStaff.filter((s) => s.locationId === branch.id).length
  const mainPerStaff = main.monthRevenue / mainStaff
  const branchPerStaff = branch.monthRevenue / branchStaff

  const rows = [
    {
      label: "이번 달 매출",
      main: formatKRW(main.monthRevenue),
      branch: formatKRW(branch.monthRevenue),
      winner: main.monthRevenue > branch.monthRevenue ? "main" : "branch",
    },
    {
      label: "오늘 매출",
      main: formatKRW(main.todayRevenue),
      branch: formatKRW(branch.todayRevenue),
      winner: main.todayRevenue > branch.todayRevenue ? "main" : "branch",
    },
    {
      label: "오늘 일정",
      main: `${main.todayJobs}건`,
      branch: `${branch.todayJobs}건`,
      winner: main.todayJobs > branch.todayJobs ? "main" : "branch",
    },
    {
      label: "직원당 매출",
      main: formatKRW(Math.round(mainPerStaff)),
      branch: formatKRW(Math.round(branchPerStaff)),
      winner: mainPerStaff > branchPerStaff ? "main" : "branch",
    },
  ]

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3">
        <TrendingUp className="h-4 w-4 text-gray-700" />
        <h2 className="text-sm font-bold text-gray-900">본점 vs 2호점 비교</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
            <th className="px-5 py-2.5 text-left font-semibold">지표</th>
            <th className="px-5 py-2.5 text-right font-semibold">본점</th>
            <th className="px-5 py-2.5 text-right font-semibold">2호점</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-gray-100 last:border-b-0">
              <td className="px-5 py-3 text-gray-700">{r.label}</td>
              <td
                className={`px-5 py-3 text-right tabular-nums font-bold ${
                  r.winner === "main" ? "text-blue-700" : "text-gray-900"
                }`}
              >
                {r.main}
                {r.winner === "main" && <span className="ml-1 text-[10px]">👑</span>}
              </td>
              <td
                className={`px-5 py-3 text-right tabular-nums font-bold ${
                  r.winner === "branch" ? "text-orange-700" : "text-gray-900"
                }`}
              >
                {r.branch}
                {r.winner === "branch" && <span className="ml-1 text-[10px]">👑</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
