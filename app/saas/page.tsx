"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { Sparkles, PlayCircle, ExternalLink } from "lucide-react"
import {
  saasJobs,
  saasStaff,
  saasIncomingBookings,
  channelLabel,
  channelEmoji,
  channelColor,
  jobTypeLabel,
  jobTypeEmoji,
  jobTypeColor,
  findVideoById,
  type SaasJob,
  type SaasStaff as StaffT,
  type SaasIncomingBooking,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const HOUR_WIDTH = 96
const ROW_HEIGHT = 64

const ROLE_COLOR: Record<string, { bg: string; fg: string }> = {
  senior: { bg: "#DBEAFE", fg: "#1E40AF" },
  junior: { bg: "#DCFCE7", fg: "#15803D" },
  intern: { bg: "#FEF3C7", fg: "#A16207" },
}

export default function SaasCalendarPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<SaasJob[]>(saasJobs)
  const [incoming, setIncoming] = useState<SaasIncomingBooking[]>(saasIncomingBookings)
  const [highlighted, setHighlighted] = useState<string[]>([])

  const activeStaff = useMemo(
    () => saasStaff.filter((s) => !s.isOff && s.role !== "owner" && s.role !== "desk"),
    []
  )

  const autoAssign = () => {
    if (incoming.length === 0) return

    // 시연용: 18:00, 18:30, 19:00 슬롯에 자동 배정
    const newJobs: SaasJob[] = incoming.map((b, i) => {
      const startHour = 18
      const startMinute = i * 30
      const durationMin = b.jobType === "blackbox" ? 90 : 60
      // staff 배정 라운드 로빈
      const staff = activeStaff[i % activeStaff.length]
      return {
        id: `J-NEW-${b.id}`,
        channel: b.channel,
        jobType: b.jobType,
        title: jobTypeLabel[b.jobType],
        customerName: b.customerName,
        customerPhone: "010-1234-5678",
        vehiclePlate: b.vehiclePlate,
        vehicleModel: b.vehicleModel,
        startHour,
        startMinute,
        durationMin,
        staffId: staff.id,
        locationId: staff.locationId,
        status: "scheduled",
        total: b.total,
        videoRef: b.videoRef,
      }
    })

    setJobs((prev) => [...prev, ...newJobs])
    setHighlighted(newJobs.map((j) => j.id))
    setIncoming([])
    toast.success(`${newJobs.length}개 예약을 자동 배정했어요`, {
      description: `채널: ${saasIncomingBookings
        .map((b) => `${channelEmoji[b.channel]} ${channelLabel[b.channel]}`)
        .join(" · ")}`,
    })
    window.setTimeout(() => setHighlighted([]), 3500)
  }

  return (
    <div className="flex h-full flex-col">
      <KpiStrip jobs={jobs} />

      <div className="flex flex-1 overflow-hidden">
        <section className="flex flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">통합 예약 캘린더</h1>
              <p className="text-xs text-gray-500">2026년 5월 5일 (화) · 모든 채널 한 곳에서</p>
            </div>
            <ChannelLegend />
          </div>

          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <Timeline jobs={jobs} staff={activeStaff} highlighted={highlighted} onSelect={(id) => router.push(`/saas/jobs/${id}`)} />
          </div>
        </section>

        <aside className="hidden w-80 shrink-0 flex-col border-l border-gray-200 bg-white xl:flex">
          <IncomingPanel incoming={incoming} onAutoAssign={autoAssign} />
        </aside>
      </div>

      <div className="border-t border-gray-200 bg-white p-3 xl:hidden">
        <IncomingPanel incoming={incoming} onAutoAssign={autoAssign} compact />
      </div>
    </div>
  )
}

function ChannelLegend() {
  const channels: Array<keyof typeof channelLabel> = [
    "kakao",
    "phone",
    "naver",
    "self",
    "oilrun",
    "youtube",
  ]
  return (
    <div className="hidden items-center gap-1.5 md:flex">
      {channels.map((c) => (
        <span
          key={c}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{
            backgroundColor: channelColor[c].bg,
            color: channelColor[c].fg,
          }}
        >
          <span>{channelEmoji[c]}</span>
          <span>{channelLabel[c]}</span>
        </span>
      ))}
    </div>
  )
}

function KpiStrip({ jobs }: { jobs: SaasJob[] }) {
  const total = jobs.length
  const inProgress = jobs.filter((j) => j.status === "in_progress").length
  const completed = jobs.filter((j) => j.status === "completed").length
  const houseCalls = jobs.filter((j) => j.isHouseCall).length
  const fromPlayCircle = jobs.filter((j) => j.channel === "youtube").length

  return (
    <div className="grid shrink-0 grid-cols-2 gap-px border-b border-gray-200 bg-gray-200 sm:grid-cols-5">
      <KpiCell label="오늘 예약" value={total} unit="건" tone="blue" />
      <KpiCell label="진행 중" value={inProgress} unit="건" tone="green" pulse />
      <KpiCell label="완료" value={completed} unit="건" tone="gray" />
      <KpiCell label="출장 🚐" value={houseCalls} unit="건" tone="orange" />
      <KpiCell label="유튜브 ▶️" value={fromPlayCircle} unit="건" tone="red" />
    </div>
  )
}

function KpiCell({
  label,
  value,
  unit,
  tone,
  pulse,
}: {
  label: string
  value: number
  unit: string
  tone: "blue" | "green" | "gray" | "orange" | "red"
  pulse?: boolean
}) {
  const colors: Record<typeof tone, { fg: string }> = {
    blue: { fg: "#1E40AF" },
    green: { fg: "#15803D" },
    gray: { fg: "#374151" },
    orange: { fg: "#C2410C" },
    red: { fg: "#B91C1C" },
  }
  return (
    <div className="bg-white px-4 py-3">
      <p className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
        {label}
        {pulse && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
        )}
      </p>
      <p className="mt-0.5 flex items-baseline gap-0.5">
        <span className="text-2xl font-bold tabular-nums" style={{ color: colors[tone].fg }}>
          {value}
        </span>
        <span className="text-xs font-semibold text-gray-500">{unit}</span>
      </p>
    </div>
  )
}

function Timeline({
  jobs,
  staff,
  highlighted,
  onSelect,
}: {
  jobs: SaasJob[]
  staff: StaffT[]
  highlighted: string[]
  onSelect: (id: string) => void
}) {
  const totalWidth = HOURS.length * HOUR_WIDTH

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <div style={{ minWidth: 160 + totalWidth }}>
        {/* hour header */}
        <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-gray-50">
          <div className="w-40 shrink-0 border-r border-gray-200 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            정비사
          </div>
          <div className="flex" style={{ width: totalWidth }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-l border-gray-100 px-2 py-2.5 text-[11px] font-semibold text-gray-500 first:border-l-0"
                style={{ width: HOUR_WIDTH }}
              >
                {h}:00
              </div>
            ))}
          </div>
        </div>

        {staff.map((s) => (
          <div
            key={s.id}
            className="flex border-b border-gray-100 last:border-b-0"
            style={{ height: ROW_HEIGHT }}
          >
            <div className="flex w-40 shrink-0 items-center gap-2 border-r border-gray-200 px-3 py-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: ROLE_COLOR[s.role]?.bg ?? "#E5E7EB",
                  color: ROLE_COLOR[s.role]?.fg ?? "#374151",
                }}
              >
                {s.avatar}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">{s.name}</p>
                <p className="truncate text-[10px] text-gray-500">
                  {s.locationId === "main" ? "본점" : "2호점"} · {s.roleLabel}
                </p>
              </div>
            </div>
            <div className="relative" style={{ width: totalWidth }}>
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="absolute top-0 bottom-0 border-l border-gray-100"
                  style={{ left: i * HOUR_WIDTH }}
                />
              ))}
              <AnimatePresence>
                {jobs
                  .filter((j) => j.staffId === s.id)
                  .map((j) => (
                    <EventCard
                      key={j.id}
                      job={j}
                      highlighted={highlighted.includes(j.id)}
                      onSelect={onSelect}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventCard({
  job,
  highlighted,
  onSelect,
}: {
  job: SaasJob
  highlighted: boolean
  onSelect: (id: string) => void
}) {
  const left = (job.startHour - HOURS[0]) * HOUR_WIDTH + (job.startMinute / 60) * HOUR_WIDTH
  const width = (job.durationMin / 60) * HOUR_WIDTH - 4
  const ch = channelColor[job.channel]
  const isCompleted = job.status === "completed"
  const isInProgress = job.status === "in_progress"
  const ringColor = job.isHouseCall ? "#F97316" : jobTypeColor[job.jobType]
  const opacity = isCompleted ? 0.55 : 1

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(job.id)}
      layout
      initial={highlighted ? { scale: 0.6, opacity: 0 } : false}
      animate={{
        scale: 1,
        opacity,
        boxShadow: highlighted
          ? "0 0 0 3px rgba(249,115,22,0.55), 0 4px 14px rgba(249,115,22,0.25)"
          : "none",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group absolute top-1 cursor-pointer overflow-hidden rounded-md border-l-4 px-2 py-1 text-left transition-shadow hover:shadow-md"
      style={{
        left,
        width: Math.max(width, 60),
        height: ROW_HEIGHT - 8,
        backgroundColor: ch.bg,
        color: ch.fg,
        borderLeftColor: ringColor,
      }}
    >
      <div className="flex items-center gap-1 text-[10px] font-bold leading-tight">
        <span>{channelEmoji[job.channel]}</span>
        <span>{jobTypeEmoji[job.jobType]}</span>
        {job.isHouseCall && <span title="출장">🚐</span>}
        {job.videoRef && <span title="유튜브 추적">▶️</span>}
        {isCompleted && <span className="ml-auto opacity-70">✓</span>}
        {isInProgress && (
          <span className="ml-auto inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-green-600" />
        )}
      </div>
      <p className="mt-0.5 truncate text-[11px] font-bold leading-tight">
        {job.customerName} · {job.vehicleModel}
      </p>
      <p className="truncate text-[10px] leading-tight opacity-80">
        {job.title} · {formatKRW(job.total)}
      </p>
    </motion.button>
  )
}

function IncomingPanel({
  incoming,
  onAutoAssign,
  compact,
}: {
  incoming: SaasIncomingBooking[]
  onAutoAssign: () => void
  compact?: boolean
}) {
  return (
    <div className={compact ? "" : "flex h-full flex-col"}>
      <div className={`flex items-start justify-between gap-2 ${compact ? "" : "border-b border-gray-200 px-4 py-3"}`}>
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            들어오는 예약 ({incoming.length})
          </h3>
          {!compact && <p className="mt-0.5 text-xs text-gray-500">모든 채널 → 한 인박스</p>}
        </div>
        {incoming.length > 0 && (
          <button
            type="button"
            onClick={onAutoAssign}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#F97316" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            자동 배정
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto ${compact ? "mt-2" : "p-3"}`}>
        {incoming.length === 0 ? (
          <div className="rounded-xl bg-green-50 px-4 py-6 text-center text-sm text-green-700">
            ✓ 모두 배정 완료
            <p className="mt-1 text-[11px] font-medium text-green-600">
              캘린더에 추가됐어요
            </p>
          </div>
        ) : (
          <ul className={`flex ${compact ? "flex-row gap-2 overflow-x-auto" : "flex-col gap-2"}`}>
            <AnimatePresence>
              {incoming.map((b) => (
                <motion.li
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className={compact ? "min-w-[260px] shrink-0" : ""}
                >
                  <IncomingCard booking={b} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}

function IncomingCard({ booking }: { booking: SaasIncomingBooking }) {
  const ch = channelColor[booking.channel]
  const video = findVideoById(booking.videoRef)

  return (
    <article className="overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">
      <div
        className="flex items-center justify-between gap-2 px-3 py-1.5"
        style={{ backgroundColor: ch.bg, color: ch.fg }}
      >
        <span className="inline-flex items-center gap-1 text-[11px] font-bold">
          <span>{channelEmoji[booking.channel]}</span>
          <span>{channelLabel[booking.channel]}</span>
        </span>
        <span className="text-[10px] opacity-80">{booking.preferredTime}</span>
      </div>
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        <p className="text-sm font-bold text-gray-900">
          {booking.customerName} · {booking.vehicleModel}
        </p>
        <p className="flex items-center gap-1 text-xs text-gray-700">
          <span>{jobTypeEmoji[booking.jobType]}</span>
          <span>{jobTypeLabel[booking.jobType]}</span>
          <span className="ml-auto font-bold tabular-nums text-gray-900">
            {formatKRW(booking.total)}
          </span>
        </p>
        {booking.message && (
          <p className="rounded-md bg-gray-50 px-2 py-1.5 text-[11px] text-gray-600">
            "{booking.message}"
          </p>
        )}
        {video && (
          <Link
            href="/saas/creator"
            className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
          >
            <PlayCircle className="h-3 w-3" />
            <span className="truncate">{video.title}</span>
            <ExternalLink className="ml-auto h-3 w-3" />
          </Link>
        )}
      </div>
    </article>
  )
}
