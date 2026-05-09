"use client"

import { useMemo, useState, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowLeft,
  MapPin,
  Phone,
  Car,
  User,
  Truck,
  Send,
  Check,
  Clock,
  Wrench,
  MessageSquare,
  PlayCircle,
} from "lucide-react"
import {
  saasJobs,
  saasStaff,
  channelLabel,
  channelEmoji,
  channelColor,
  jobTypeLabel,
  jobTypeEmoji,
  jobTypeColor,
  findVideoById,
  type OrderStatus,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

const STATUS_FLOW: OrderStatus[] = [
  "scheduled",
  "departed",
  "arrived",
  "in_progress",
  "completed",
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "신규",
  scheduled: "예정",
  departed: "출발",
  arrived: "도착",
  in_progress: "작업 중",
  completed: "완료",
}

const NEXT_BUTTON_LABEL: Record<OrderStatus, string> = {
  new: "수락",
  scheduled: "출발",
  departed: "도착 알림",
  arrived: "작업 시작",
  in_progress: "작업 완료",
  completed: "완료됨",
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const initialJob = useMemo(() => saasJobs.find((j) => j.id === id), [id])
  const [status, setStatus] = useState<OrderStatus>(initialJob?.status ?? "scheduled")

  if (!initialJob) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">예약을 찾을 수 없어요</p>
          <button
            type="button"
            onClick={() => router.push("/saas")}
            className="mt-3 text-sm font-bold text-blue-700 hover:underline"
          >
            캘린더로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const job = initialJob
  const staff = saasStaff.find((s) => s.id === job.staffId)
  const video = findVideoById(job.videoRef)

  const advance = () => {
    const idx = STATUS_FLOW.indexOf(status)
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return
    const next = STATUS_FLOW[idx + 1]
    setStatus(next)

    const messages: Record<OrderStatus, { title: string; desc: string }> = {
      new: { title: "수락됨", desc: "고객에게 알림톡 발송" },
      scheduled: { title: "출발 알림 발송", desc: `${job.customerName}님께 카카오 알림톡` },
      departed: { title: "도착", desc: "고객에게 도착 알림 자동 발송" },
      arrived: { title: "작업 시작", desc: "" },
      in_progress: {
        title: "작업 완료",
        desc: `${formatKRW(job.total)} 결제 알림 발송`,
      },
      completed: { title: "완료됨", desc: "" },
    }
    const msg = messages[next]
    toast.success(msg.title, msg.desc ? { description: msg.desc } : undefined)
  }

  const channel = channelColor[job.channel]
  const isHouseCall = job.isHouseCall

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 sm:py-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        캘린더
      </button>

      <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: channel.bg, color: channel.fg }}
              >
                <span>{channelEmoji[job.channel]}</span>
                <span>{channelLabel[job.channel]}</span>
              </span>
              {isHouseCall && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
                >
                  🚐 출장
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {job.id}
              </span>
            </div>
            <h1 className="mt-1.5 flex items-center gap-2 text-xl font-extrabold text-gray-900">
              <span>{jobTypeEmoji[job.jobType]}</span>
              {jobTypeLabel[job.jobType]}
            </h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {String(job.startHour).padStart(2, "0")}:
              {String(job.startMinute).padStart(2, "0")} · 약 {job.durationMin}분
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-extrabold tabular-nums"
              style={{ color: jobTypeColor[job.jobType] }}
            >
              {formatKRW(job.total)}
            </p>
          </div>
        </div>

        {video && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5">
            <PlayCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="text-[11px] font-bold text-red-700">유튜브 추적:</span>
            <span className="truncate text-[11px] text-red-900">{video.title}</span>
          </div>
        )}
      </header>

      <section className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">고객</h2>
        <Row icon={User} label="이름" value={job.customerName} />
        <Row icon={Phone} label="연락처" value={job.customerPhone} action="전화" />
        <Row icon={Car} label="차량" value={`${job.vehicleModel} · ${job.vehiclePlate}`} />
        {isHouseCall && job.address && (
          <Row icon={MapPin} label="출장 주소" value={job.address} action="지도" multiline />
        )}
        {staff && (
          <Row
            icon={Wrench}
            label="배정 정비사"
            value={`${staff.name} (${staff.roleLabel})`}
          />
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          진행 상태
        </h2>
        <StatusTimeline status={status} isHouseCall={!!isHouseCall} />
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          <MessageSquare className="h-3 w-3" />
          알림톡 발송 이력
        </h2>
        <ul className="mt-3 space-y-2 text-xs">
          <NotificationItem
            label="예약 확정 안내"
            time="14:23"
            status="sent"
          />
          {STATUS_FLOW.indexOf(status) >= 1 && (
            <NotificationItem label="기사 출발" time="방금" status="sent" />
          )}
          {STATUS_FLOW.indexOf(status) >= 2 && (
            <NotificationItem label="도착 안내" time="방금" status="sent" />
          )}
          {STATUS_FLOW.indexOf(status) >= 4 && (
            <NotificationItem label="작업 완료 + 결제 안내" time="방금" status="sent" />
          )}
          {status !== "completed" && (
            <NotificationItem label={`${STATUS_LABEL[status]} 진행 중`} time="—" status="pending" />
          )}
        </ul>
      </section>

      <div className="sticky bottom-0 mt-5 -mx-4 border-t border-gray-200 bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-3 sm:relative sm:bottom-auto sm:mx-0 sm:rounded-2xl sm:border sm:p-4">
        {status !== "completed" ? (
          <motion.button
            type="button"
            onClick={advance}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-extrabold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#F97316" }}
          >
            <Send className="h-5 w-5" />
            {NEXT_BUTTON_LABEL[status]}
          </motion.button>
        ) : (
          <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-50 text-base font-extrabold text-green-700">
            <Check className="h-5 w-5" />
            작업 완료
          </div>
        )}
      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  action,
  multiline,
}: {
  icon: typeof User
  label: string
  value: string
  action?: string
  multiline?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className={`text-sm text-gray-900 ${multiline ? "" : "truncate"}`}>{value}</p>
      </div>
      {action && (
        <button
          type="button"
          className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
          onClick={() => toast(`${action} 시뮬레이션`)}
        >
          {action}
        </button>
      )}
    </div>
  )
}

function StatusTimeline({
  status,
  isHouseCall,
}: {
  status: OrderStatus
  isHouseCall: boolean
}) {
  const steps: Array<{ id: OrderStatus; label: string; emoji: string }> = isHouseCall
    ? [
        { id: "scheduled", label: "예정", emoji: "📅" },
        { id: "departed", label: "출발", emoji: "🚐" },
        { id: "arrived", label: "도착", emoji: "📍" },
        { id: "in_progress", label: "작업", emoji: "🔧" },
        { id: "completed", label: "완료", emoji: "✅" },
      ]
    : [
        { id: "scheduled", label: "예정", emoji: "📅" },
        { id: "arrived", label: "고객 입고", emoji: "🚗" },
        { id: "in_progress", label: "작업", emoji: "🔧" },
        { id: "completed", label: "완료", emoji: "✅" },
      ]

  const currentIdx = steps.findIndex((s) => s.id === status)

  return (
    <div className="mt-3">
      <div className="flex items-center">
        {steps.map((s, i) => {
          const done = i <= currentIdx
          const isCurrent = i === currentIdx
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-colors ${
                    done ? "shadow-sm" : ""
                  }`}
                  style={{
                    backgroundColor: done ? "#1E40AF" : "#F3F4F6",
                    color: done ? "white" : "#9CA3AF",
                  }}
                >
                  {isCurrent && status !== "completed" ? (
                    <span className="animate-pulse">{s.emoji}</span>
                  ) : done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="opacity-60">{s.emoji}</span>
                  )}
                </div>
                <p
                  className={`mt-1 text-[10px] font-semibold ${
                    done ? "text-blue-700" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="-mt-4 mx-1 h-0.5 flex-1" style={{ backgroundColor: i < currentIdx ? "#1E40AF" : "#E5E7EB" }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NotificationItem({
  label,
  time,
  status,
}: {
  label: string
  time: string
  status: "sent" | "pending"
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          status === "sent" ? "bg-green-100" : "bg-gray-100"
        }`}
      >
        {status === "sent" ? (
          <Check className="h-3 w-3 text-green-700" />
        ) : (
          <Clock className="h-3 w-3 text-gray-400" />
        )}
      </span>
      <span className="text-gray-900">{label}</span>
      <span className="ml-auto text-gray-400">{time}</span>
    </li>
  )
}
