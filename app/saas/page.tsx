"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import {
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Settings,
  Phone,
  MessageCircle,
  Globe,
  Smartphone,
  Truck,
  Package,
  Droplet,
  Camera,
  CircleDot,
  BatteryFull,
  ClipboardCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { NewBookingDialog } from "@/components/saas/NewBookingDialog"
import { JobDetailDialog } from "@/components/saas/JobDetailDialog"
import {
  CalendarSettingsDialog,
  DEFAULT_CALENDAR_SETTINGS,
  FIXED_ROW_HEIGHT,
  type CalendarSettings,
} from "@/components/saas/CalendarSettingsDialog"
import { useInbox } from "@/lib/contexts/saas-inbox"
import {
  saasJobs,
  saasStaff,
  channelLabel,
  jobTypeLabel,
  type SaasChannel,
  type SaasJob,
  type SaasJobType,
  type SaasStaff as StaffT,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

// ─── 흑백 SVG 아이콘 매핑 (색상 의존도 제거) ─────────────
const CHANNEL_ICON: Record<SaasChannel, LucideIcon> = {
  phone: Phone,
  kakao: MessageCircle,
  naver: Globe,
  self: Smartphone,
  oilrun: Package,
  youtube: PlayCircle,
}
const JOB_TYPE_ICON: Record<SaasJobType, LucideIcon> = {
  oil: Droplet,
  tire: CircleDot,
  blackbox: Camera,
  inspection: ClipboardCheck,
  battery: BatteryFull,
  general: Wrench,
  house_call: Truck,
}

// 시간 그리드는 settings에서 동적으로 (영업 시작/종료, 행 크기)
const HOUR_WIDTH = 112
const LABEL_WIDTH = 132
const SLOT_SNAP_MIN = 30 // 빈 슬롯 클릭 시 30분 단위로 스냅

function buildHours(start: number, end: number): number[] {
  const out: number[] = []
  for (let h = start; h <= end; h++) out.push(h)
  return out
}

// 같은 정비사에 겹치는 작업이 있을 때 lane(세로 레인) 배정
//   - 그리디 컬럼 할당 → lane 인덱스
//   - 클러스터(전이적으로 겹치는 그룹)별 max lane 수 → laneCount
type LaidJob = SaasJob & { _lane: number; _laneCount: number; _startMin: number; _endMin: number }

function layoutLanes(jobs: SaasJob[]): LaidJob[] {
  if (jobs.length === 0) return []

  const items = jobs
    .map((j) => ({
      ...j,
      _startMin: j.startHour * 60 + j.startMinute,
      _endMin: j.startHour * 60 + j.startMinute + j.durationMin,
    }))
    .sort((a, b) => a._startMin - b._startMin || a._endMin - b._endMin)

  // 1) lane 그리디 배정
  const laneEnds: number[] = []
  const withLane = items.map((e) => {
    let lane = laneEnds.findIndex((end) => end <= e._startMin)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(e._endMin)
    } else {
      laneEnds[lane] = e._endMin
    }
    return { ...e, _lane: lane }
  })

  // 2) 전이적으로 겹치는 클러스터 → union-find
  const parent = withLane.map((_, i) => i)
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]]
      i = parent[i]
    }
    return i
  }
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b)
  }
  for (let i = 0; i < withLane.length; i++) {
    for (let j = i + 1; j < withLane.length; j++) {
      const a = withLane[i]
      const b = withLane[j]
      if (a._endMin > b._startMin && b._endMin > a._startMin) union(i, j)
    }
  }

  const clusterMax = new Map<number, number>()
  for (let i = 0; i < withLane.length; i++) {
    const r = find(i)
    clusterMax.set(r, Math.max(clusterMax.get(r) ?? 0, withLane[i]._lane + 1))
  }

  return withLane.map((e, i) => ({
    ...e,
    _laneCount: clusterMax.get(find(i)) ?? 1,
  }))
}

const KO_DAY = ["일", "월", "화", "수", "목", "금", "토"]

function ymd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
function formatKoreanDay(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${KO_DAY[d.getDay()]})`
}

// 정비사 아바타는 단일 회색 (직급 색상 구분 제거)
const ROLE_AVATAR_BG = "#F3F4F6"
const ROLE_AVATAR_FG = "#374151"

export default function SaasCalendarPage() {
  const inbox = useInbox()
  const {
    incoming,
    refresh: fetchIncoming,
    registerAutoAssign,
    placementBooking,
    cancelPlacement,
    getBookingDuration,
  } = inbox

  // ESC로 배치 모드 취소
  useEffect(() => {
    if (!placementBooking) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelPlacement()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [placementBooking, cancelPlacement])

  // 모든 mock job에 오늘 날짜 부여 (date 필드 없으면)
  const [jobs, setJobs] = useState<SaasJob[]>(() => {
    const todayStr = ymd(new Date())
    return saasJobs.map((j) => ({ ...j, date: j.date ?? todayStr }))
  })

  const updateJob = useCallback(
    (id: string, updates: Partial<SaasJob>) => {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)))
    },
    []
  )

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => {
      const removed = prev.find((j) => j.id === id)
      if (!removed) return prev
      const next = prev.filter((j) => j.id !== id)
      toast.success("작업 삭제됨", {
        description: `${removed.customerName} · ${removed.title}`,
        action: {
          label: "되돌리기",
          onClick: () => setJobs((cur) => [...cur, removed]),
        },
      })
      return next
    })
  }, [])
  const [newBookingOpen, setNewBookingOpen] = useState(false)
  const [newBookingDefault, setNewBookingDefault] = useState<Date | null>(null)
  const [highlighted, setHighlighted] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [now, setNow] = useState<Date>(new Date())
  const [selectedJob, setSelectedJob] = useState<SaasJob | null>(null)

  // SSR(UTC) vs 클라이언트(KST) 시간 불일치 hydration error 방지 — 클라이언트 mount 후에만 렌더
  const [clientReady, setClientReady] = useState(false)
  useEffect(() => {
    setClientReady(true)
  }, [])
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>(
    DEFAULT_CALENDAR_SETTINGS
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

  // 매분 갱신 (now-line)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const isToday = isSameDay(selectedDate, now)

  // 선택된 날짜의 작업만 표시
  const selectedDateKey = ymd(selectedDate)
  const visibleJobs = useMemo(
    () => jobs.filter((j) => (j.date ?? selectedDateKey) === selectedDateKey),
    [jobs, selectedDateKey]
  )

  // 1 Shop = 1 호점. mock data엔 main + branch2 섞여 있어서 본점만 필터.
  const activeStaff = useMemo(
    () =>
      saasStaff.filter(
        (s) =>
          !s.isOff &&
          s.role !== "owner" &&
          s.role !== "desk" &&
          s.locationId === "main"
      ),
    []
  )

  // 자동 배정 (mock animation): incoming → 캘린더 새 카드들
  const autoAssign = useCallback(() => {
    if (incoming.length === 0) return
    const dateStr = ymd(selectedDate)
    const newJobs: SaasJob[] = incoming.map((b, i) => {
      const startHour = 18
      const startMinute = i * 30
      const durationMin = b.jobType === "blackbox" ? 90 : 60
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
        date: dateStr,
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
    const channelDesc = incoming.map((b) => channelLabel[b.channel]).join(" · ")
    toast.success(`${newJobs.length}개 예약을 자동 배정했어요`, {
      description: `채널: ${channelDesc}`,
    })
    window.setTimeout(() => setHighlighted([]), 3500)
    // TODO: 실 DB 연결되면 API로 status=CONFIRMED로 업데이트
    fetchIncoming()
  }, [incoming, activeStaff, fetchIncoming, selectedDate])

  // Drawer가 호출할 핸들러를 컨텍스트에 등록
  useEffect(() => {
    registerAutoAssign(autoAssign)
    return () => registerAutoAssign(null)
  }, [autoAssign, registerAutoAssign])

  // SSR/CSR 시간 불일치 방지 — 첫 mount 전엔 skeleton만
  if (!clientReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">캘린더 로드 중…</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <KpiStrip jobs={visibleJobs} />

      <section className="flex flex-1 flex-col overflow-hidden">
        {placementBooking && (
          <div
            className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2 text-xs"
            style={{ backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }}
          >
            <p className="text-gray-800">
              <span className="font-bold" style={{ color: "#C2410C" }}>📌 드래그 중</span>
              {" — "}
              <span className="font-semibold">
                {placementBooking.customerName} · {placementBooking.vehicleModel}
              </span>
              {" "}
              <span className="text-gray-500">원하는 시간 위에서 마우스를 놓으세요</span>
            </p>
            <button
              type="button"
              onClick={cancelPlacement}
              className="rounded-md px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-orange-100"
            >
              취소
            </button>
          </div>
        )}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">통합 예약 캘린더</h1>
            <DateNav
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              isToday={isToday}
            />
          </div>
          <div className="flex items-center gap-2">
            <ChannelLegend />
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="캘린더 설정"
              title="영업시간·점심시간 설정"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <Timeline
            jobs={visibleJobs}
            staff={activeStaff}
            highlighted={highlighted}
            onSelect={(id) => {
              const j = jobs.find((x) => x.id === id)
              if (j) setSelectedJob(j)
            }}
            now={now}
            isToday={isToday}
            selectedDate={selectedDate}
            settings={calendarSettings}
            onSlotClick={(slotDate, staffId) => {
              // 배치 모드: 인박스에서 가져온 부킹을 그 슬롯에 배치
              if (placementBooking) {
                // 사용자가 사이드바에서 설정한 작업 시간 (없으면 30분 fallback)
                const dur = getBookingDuration(placementBooking.id) ?? 30
                const newJob: SaasJob = {
                  id: `J-PLACE-${placementBooking.id}`,
                  channel: placementBooking.channel,
                  jobType: placementBooking.jobType,
                  title: jobTypeLabel[placementBooking.jobType],
                  customerName: placementBooking.customerName,
                  customerPhone: "010-1234-5678",
                  vehiclePlate: placementBooking.vehiclePlate,
                  vehicleModel: placementBooking.vehicleModel,
                  date: ymd(slotDate),
                  startHour: slotDate.getHours(),
                  startMinute: slotDate.getMinutes(),
                  durationMin: dur,
                  staffId: staffId ?? activeStaff[0]?.id,
                  locationId: "main",
                  status: "scheduled",
                  total: placementBooking.total,
                  videoRef: placementBooking.videoRef,
                }
                setJobs((prev) => [...prev, newJob])
                setHighlighted([newJob.id])
                window.setTimeout(() => setHighlighted([]), 3000)
                cancelPlacement()
                fetchIncoming()
                toast.success(`${placementBooking.customerName} 배치됨`, {
                  description: `${slotDate.getHours()}:${String(slotDate.getMinutes()).padStart(2, "0")} · ${dur}분`,
                })
                return
              }
              setNewBookingDefault(slotDate)
              setNewBookingOpen(true)
            }}
            onJobUpdate={updateJob}
            placementBookingHint={
              placementBooking
                ? `${placementBooking.customerName} (${placementBooking.vehicleModel})`
                : null
            }
          />
        </div>
      </section>

      <NewBookingDialog
        open={newBookingOpen}
        onClose={() => setNewBookingOpen(false)}
        defaultScheduledStart={newBookingDefault}
        onCreated={() => {
          fetchIncoming()
          inbox.openDrawer()
        }}
      />

      <JobDetailDialog
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onDelete={deleteJob}
      />

      <CalendarSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={calendarSettings}
        onSave={setCalendarSettings}
      />
    </div>
  )
}

function ChannelLegend() {
  const channels: SaasChannel[] = ["kakao", "phone", "naver", "self", "oilrun", "youtube"]
  return (
    <div className="hidden items-center gap-3 md:flex">
      {channels.map((c) => {
        const Icon = CHANNEL_ICON[c]
        return (
          <span
            key={c}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600"
            title={channelLabel[c]}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{channelLabel[c]}</span>
          </span>
        )
      })}
    </div>
  )
}

function KpiStrip({ jobs }: { jobs: SaasJob[] }) {
  const total = jobs.length
  const inProgress = jobs.filter((j) => j.status === "in_progress").length
  const completed = jobs.filter((j) => j.status === "completed").length
  const houseCalls = jobs.filter((j) => j.isHouseCall).length
  const fromYoutube = jobs.filter((j) => j.channel === "youtube").length

  return (
    <div className="flex shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 py-2 text-sm">
      <KpiInline label="오늘 예약" value={total} />
      <span className="h-4 w-px bg-gray-200" />
      <KpiInline label="진행 중" value={inProgress} pulse />
      <span className="h-4 w-px bg-gray-200" />
      <KpiInline label="완료" value={completed} />
      <span className="h-4 w-px bg-gray-200" />
      <KpiInline label="출장" value={houseCalls} icon={Truck} />
      <span className="h-4 w-px bg-gray-200" />
      <KpiInline label="유튜브" value={fromYoutube} icon={PlayCircle} />
    </div>
  )
}

function KpiInline({
  label,
  value,
  pulse,
  icon: Icon,
}: {
  label: string
  value: number
  pulse?: boolean
  icon?: LucideIcon
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-500" strokeWidth={2} />}
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm font-bold tabular-nums text-gray-900">{value}</span>
      {pulse && value > 0 && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: "#3B82F6" }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#1E40AF" }}
          />
        </span>
      )}
    </span>
  )
}

interface DragState {
  jobId: string
  startMouseX: number
  startMouseY: number
  initialStartMin: number
  initialStaffId: string
  currentMouseX: number
  currentMouseY: number
  moved: boolean
}

function Timeline({
  jobs,
  staff,
  highlighted,
  onSelect,
  now,
  isToday,
  selectedDate,
  settings,
  onSlotClick,
  onJobUpdate,
  placementBookingHint,
}: {
  jobs: SaasJob[]
  staff: StaffT[]
  highlighted: string[]
  onSelect: (id: string) => void
  now: Date
  isToday: boolean
  selectedDate: Date
  settings: CalendarSettings
  onSlotClick: (slotDate: Date, staffId?: string) => void
  onJobUpdate: (id: string, updates: Partial<SaasJob>) => void
  placementBookingHint?: string | null
}) {
  const HOURS = useMemo(
    () => buildHours(settings.openHour, settings.closeHour - 1),
    [settings.openHour, settings.closeHour]
  )
  const totalWidth = HOURS.length * HOUR_WIDTH

  // 정비사별 lane 배치 (겹치는 작업 처리)
  const laidByStaff = useMemo(() => {
    const map = new Map<string, LaidJob[]>()
    for (const s of staff) {
      const list = jobs.filter((j) => j.staffId === s.id)
      map.set(s.id, layoutLanes(list))
    }
    return map
  }, [jobs, staff])

  // 카드 크기 고정, 행만 동적으로 커짐 (lane 수만큼 카드를 쌓음)
  //   - CARD_H: 76px 고정 행에서 8px padding 빼고 = 68px
  //   - 행 높이 = 8 + (CARD_H × N) + (GAP × (N-1))
  const ROW_BASE = FIXED_ROW_HEIGHT
  const CARD_H = ROW_BASE - 8 // 68px
  const CARD_GAP = 2
  const rowHeights = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of staff) {
      const list = laidByStaff.get(s.id) ?? []
      const maxLane = list.reduce((m, j) => Math.max(m, j._laneCount), 1)
      map.set(s.id, 8 + maxLane * CARD_H + (maxLane - 1) * CARD_GAP)
    }
    return map
  }, [staff, laidByStaff, CARD_H, CARD_GAP])
  // 호환용 (드래그 fallback)
  const ROW_HEIGHT = ROW_BASE

  // ─── 드래그 상태 (시간·정비사 변경) ─────────────
  const [drag, setDrag] = useState<DragState | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const HEADER_ROW_HEIGHT = 36

  function handleCardMouseDown(e: React.MouseEvent, job: SaasJob) {
    e.preventDefault()
    setDrag({
      jobId: job.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      initialStartMin: job.startHour * 60 + job.startMinute,
      initialStaffId: job.staffId ?? "",
      currentMouseX: e.clientX,
      currentMouseY: e.clientY,
      moved: false,
    })
  }

  useEffect(() => {
    if (!drag) return

    function handleMove(e: MouseEvent) {
      setDrag((d) => {
        if (!d) return d
        const moved =
          d.moved || Math.hypot(e.clientX - d.startMouseX, e.clientY - d.startMouseY) > 5
        return { ...d, currentMouseX: e.clientX, currentMouseY: e.clientY, moved }
      })
    }

    function handleUp(e: MouseEvent) {
      const d = drag
      if (!d) return
      if (d.moved) {
        // 시간 델타 계산 (30분 스냅)
        const dx = e.clientX - d.startMouseX
        const dyMinDelta =
          Math.round((dx / HOUR_WIDTH) * 60 / SLOT_SNAP_MIN) * SLOT_SNAP_MIN
        let newStartMin = d.initialStartMin + dyMinDelta
        // 영업시간 안에 clamp
        const minStart = settings.openHour * 60
        const maxStart = settings.closeHour * 60 - 30
        newStartMin = Math.max(minStart, Math.min(maxStart, newStartMin))

        // 정비사 변경 (행 높이가 가변이므로 누적 합산으로 찾기)
        let newStaffId = d.initialStaffId
        const bodyRect = bodyRef.current?.getBoundingClientRect()
        if (bodyRect) {
          const yInBody = e.clientY - bodyRect.top - HEADER_ROW_HEIGHT
          let cumY = 0
          for (let i = 0; i < staff.length; i++) {
            const h = rowHeights.get(staff[i].id) ?? ROW_HEIGHT
            if (yInBody >= cumY && yInBody < cumY + h) {
              newStaffId = staff[i].id
              break
            }
            cumY += h
          }
        }

        onJobUpdate(d.jobId, {
          startHour: Math.floor(newStartMin / 60),
          startMinute: newStartMin % 60,
          staffId: newStaffId,
        })

        // 드래그 종료 직후 brwoser가 synthesize하는 click 이벤트 차단
        // (mousedown + mouseup이 같은 element에서 일어나면 click이 자동 fire되어
        //  카드 onClick → onSelect(상세 팝업) 트리거됨)
        const blockClick = (ev: MouseEvent) => {
          ev.preventDefault()
          ev.stopPropagation()
        }
        window.addEventListener("click", blockClick, {
          capture: true,
          once: true,
        })
      }
      setDrag(null)
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [drag, settings.openHour, settings.closeHour, staff, rowHeights, onJobUpdate])

  // 드래그 중이면 본문에 grabbing 커서
  const cursorClass = drag?.moved ? "cursor-grabbing" : ""
  const stickyShadow = "2px 0 6px -3px rgba(0,0,0,0.12)"

  // now-line 위치
  const nowHour = now.getHours()
  const nowMinute = now.getMinutes()
  const showNowLine =
    isToday && nowHour >= HOURS[0] && nowHour < HOURS[HOURS.length - 1] + 1
  const nowLeft =
    (nowHour - HOURS[0]) * HOUR_WIDTH + (nowMinute / 60) * HOUR_WIDTH

  // 점심시간 위치
  const lunchLeft = (settings.lunchStartHour - HOURS[0]) * HOUR_WIDTH
  const lunchWidth = (settings.lunchEndHour - settings.lunchStartHour) * HOUR_WIDTH

  // 빗금 패턴 (점심시간)
  const lunchStripes = `repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0 4px, transparent 4px 12px)`

  // 지난 시간 영역 폭 — 어포던스 표시 안 함
  const pastWidthPx = (() => {
    const dayStart = new Date(selectedDate)
    dayStart.setHours(0, 0, 0, 0)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    if (dayStart.getTime() < todayStart.getTime()) return totalWidth // 과거 날짜
    if (dayStart.getTime() > todayStart.getTime()) return 0 // 미래 날짜
    // 오늘
    const nowFloat = nowHour + nowMinute / 60
    const lastVisible = HOURS[HOURS.length - 1] + 1
    if (nowFloat <= HOURS[0]) return 0
    if (nowFloat >= lastVisible) return totalWidth
    return (nowFloat - HOURS[0]) * HOUR_WIDTH
  })()

  function handleSlotClick(
    e: React.MouseEvent<HTMLButtonElement> | React.DragEvent<HTMLButtonElement>,
    staffId: string
  ) {
    const rect = e.currentTarget.getBoundingClientRect()
    // 버튼이 미래 영역만 차지 → 행 좌측부터의 x = 버튼 내 x + pastWidthPx
    const x = e.clientX - rect.left + pastWidthPx
    const hourFloat = HOURS[0] + x / HOUR_WIDTH
    const totalMin = Math.round((hourFloat * 60) / SLOT_SNAP_MIN) * SLOT_SNAP_MIN
    const hour = Math.floor(totalMin / 60)
    const minute = totalMin % 60
    if (hour < HOURS[0] || hour > HOURS[HOURS.length - 1]) return
    const d = new Date(selectedDate)
    d.setHours(hour, minute, 0, 0)
    onSlotClick(d, staffId)
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ${cursorClass}`}>
      <div ref={bodyRef} style={{ minWidth: LABEL_WIDTH + totalWidth }}>
        {/* hour header — sticky top */}
        <div className="sticky top-0 z-20 flex border-b border-gray-200 bg-gray-50">
          {/* corner: sticky top + left */}
          <div
            className="sticky left-0 z-30 shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500"
            style={{ width: LABEL_WIDTH, boxShadow: stickyShadow }}
          >
            정비사
          </div>
          <div className="relative flex" style={{ width: totalWidth }}>
            {/* 점심시간 빗금 (헤더에도) */}
            <div
              className="pointer-events-none absolute top-0 bottom-0"
              style={{ left: lunchLeft, width: lunchWidth, backgroundImage: lunchStripes }}
            />
            {HOURS.map((h) => {
              const isLunch = h >= settings.lunchStartHour && h < settings.lunchEndHour
              return (
                <div
                  key={h}
                  className={`relative border-l border-gray-100 px-2 py-2 text-[11px] font-semibold first:border-l-0 ${
                    isLunch ? "text-gray-400" : "text-gray-500"
                  }`}
                  style={{ width: HOUR_WIDTH }}
                >
                  {h}:00
                  {isLunch && h === settings.lunchStartHour && (
                    <span className="ml-1 text-[10px] font-medium">점심</span>
                  )}
                </div>
              )
            })}
            {/* now-line label in header */}
            {showNowLine && (
              <div
                className="pointer-events-none absolute -top-0.5 z-10"
                style={{ left: nowLeft, transform: "translateX(-50%)" }}
              >
                <div
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {String(nowHour).padStart(2, "0")}:{String(nowMinute).padStart(2, "0")}
                </div>
              </div>
            )}
          </div>
        </div>

        {staff.map((s, rowIdx) => {
          const rowH = rowHeights.get(s.id) ?? ROW_HEIGHT
          return (
          <div
            key={s.id}
            className="flex border-b border-gray-100 last:border-b-0"
            style={{ height: rowH }}
          >
            {/* staff label — sticky left */}
            <div
              className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r border-gray-200 bg-white px-3 py-2"
              style={{ width: LABEL_WIDTH, boxShadow: stickyShadow }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ backgroundColor: ROLE_AVATAR_BG, color: ROLE_AVATAR_FG }}
              >
                {s.avatar}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-gray-900">{s.name}</p>
                <p className="truncate text-[10px] text-gray-500">{s.roleLabel}</p>
              </div>
            </div>
            <div className="relative" style={{ width: totalWidth }}>
              {/* 지난 시간 영역 — 살짝 dim, 클릭 불가 */}
              {pastWidthPx > 0 && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-0 bg-gray-50/40"
                  style={{ width: pastWidthPx }}
                />
              )}
              {/* 미래 슬롯 click/drop target — hover 시 점선 + "+" 어포던스 */}
              {pastWidthPx < totalWidth && (
                <button
                  type="button"
                  onClick={(e) => handleSlotClick(e, s.id)}
                  onDragOver={(e) => {
                    if (placementBookingHint) {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = "copy"
                    }
                  }}
                  onDrop={(e) => {
                    if (!placementBookingHint) return
                    e.preventDefault()
                    handleSlotClick(e, s.id)
                  }}
                  aria-label="빈 시간 클릭으로 새 예약 또는 드롭으로 배치"
                  title={placementBookingHint ? `여기 놓으면 ${placementBookingHint} 배치` : "클릭하면 이 시간에 새 예약 입력"}
                  className="group/slot absolute top-0 bottom-0 cursor-cell"
                  style={{ left: pastWidthPx, right: 0 }}
                >
                  <span
                    className={`pointer-events-none absolute inset-1 rounded-md border-2 border-dashed transition-opacity ${
                      placementBookingHint
                        ? "border-orange-300 opacity-100"
                        : "border-transparent opacity-0 group-hover/slot:border-gray-300 group-hover/slot:opacity-100"
                    }`}
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-gray-500 opacity-0 transition-opacity group-hover/slot:opacity-100">
                    {placementBookingHint ? (
                      <span className="text-orange-700">📌 여기에 놓기</span>
                    ) : (
                      <>
                        <Plus className="mr-0.5 h-3 w-3" /> 새 예약
                      </>
                    )}
                  </span>
                </button>
              )}
              {/* 점심시간 빗금 */}
              <div
                className="pointer-events-none absolute top-0 bottom-0"
                style={{ left: lunchLeft, width: lunchWidth, backgroundImage: lunchStripes }}
              />
              {/* 30-min grid lines (lighter) */}
              {HOURS.map((h, i) => (
                <div
                  key={`half-${h}`}
                  className="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-gray-100"
                  style={{ left: i * HOUR_WIDTH + HOUR_WIDTH / 2 }}
                />
              ))}
              {/* hour grid lines */}
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="pointer-events-none absolute top-0 bottom-0 border-l border-gray-100"
                  style={{ left: i * HOUR_WIDTH }}
                />
              ))}
              {/* now-line vertical */}
              {showNowLine && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10"
                  style={{ left: nowLeft, width: 2, backgroundColor: "#F97316" }}
                />
              )}
              <AnimatePresence>
                {(laidByStaff.get(s.id) ?? []).map((j) => (
                  <EventCard
                    key={j.id}
                    job={j}
                    highlighted={highlighted.includes(j.id)}
                    onSelect={onSelect}
                    firstHour={HOURS[0]}
                    lane={j._lane}
                    laneCount={j._laneCount}
                    cardHeight={CARD_H}
                    cardGap={CARD_GAP}
                    onMouseDown={handleCardMouseDown}
                    isDragging={drag?.jobId === j.id && drag.moved}
                    dragOffsetX={
                      drag?.jobId === j.id && drag.moved
                        ? drag.currentMouseX - drag.startMouseX
                        : 0
                    }
                    dragOffsetY={
                      drag?.jobId === j.id && drag.moved
                        ? drag.currentMouseY - drag.startMouseY
                        : 0
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

// ─── 날짜 네비게이션 (이전 / 날짜 / 다음 + date picker)
function DateNav({
  selectedDate,
  onChange,
}: {
  selectedDate: Date
  onChange: (d: Date) => void
  isToday: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(addDays(selectedDate, -1))}
        aria-label="이전 날"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[140px] px-1 text-center text-xs font-semibold text-gray-800 tabular-nums">
        {formatKoreanDay(selectedDate)}
      </span>
      <button
        type="button"
        onClick={() => onChange(addDays(selectedDate, 1))}
        aria-label="다음 날"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <label className="relative ml-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
        <CalendarDays className="h-4 w-4" />
        <input
          type="date"
          value={ymd(selectedDate)}
          onChange={(e) => {
            if (!e.target.value) return
            const [y, m, d] = e.target.value.split("-").map(Number)
            onChange(new Date(y, m - 1, d))
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  )
}

function EventCard({
  job,
  highlighted,
  onSelect,
  firstHour,
  lane,
  cardHeight,
  cardGap,
  onMouseDown,
  isDragging,
  dragOffsetX,
  dragOffsetY,
}: {
  job: SaasJob
  highlighted: boolean
  onSelect: (id: string) => void
  firstHour: number
  lane: number
  laneCount: number
  cardHeight: number
  cardGap: number
  onMouseDown: (e: React.MouseEvent, job: SaasJob) => void
  isDragging: boolean
  dragOffsetX: number
  dragOffsetY: number
}) {
  const left = (job.startHour - firstHour) * HOUR_WIDTH + (job.startMinute / 60) * HOUR_WIDTH
  // 작업 시간은 항상 30분 단위로 스냅 (정책)
  const snappedDuration = Math.max(30, Math.round(job.durationMin / 30) * 30)
  const width = (snappedDuration / 60) * HOUR_WIDTH - 4
  const isCompleted = job.status === "completed"
  const isInProgress = job.status === "in_progress"
  const ChannelIcon = CHANNEL_ICON[job.channel]
  const TypeIcon = job.isHouseCall ? Truck : JOB_TYPE_ICON[job.jobType]

  // 카드 크기는 고정 (lane 수와 무관)
  // 위치만 lane 인덱스에 따라 아래로 쌓음
  const top = 4 + lane * (cardHeight + cardGap)
  const height = cardHeight
  const compact = cardHeight < 36 // settings.rowSize=compact일 때만 축약


  // 진행 중 = 브랜드 블루 / 완료 = 회색 dim / 예정 = 흰색
  const cardStyle = isInProgress
    ? { backgroundColor: "#1E40AF", color: "#FFFFFF", borderColor: "#1E40AF" }
    : isCompleted
      ? { backgroundColor: "#F9FAFB", color: "#6B7280", borderColor: "#E5E7EB" }
      : { backgroundColor: "#FFFFFF", color: "#111827", borderColor: "#D1D5DB" }

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        if (isDragging) {
          e.preventDefault()
          return
        }
        onSelect(job.id)
      }}
      onMouseDown={(e) => onMouseDown(e, job)}
      layout={!isDragging}
      initial={highlighted ? { scale: 0.6, opacity: 0 } : false}
      animate={{
        x: isDragging ? dragOffsetX : 0,
        y: isDragging ? dragOffsetY : 0,
        scale: isDragging ? 1.04 : 1,
        rotate: isDragging ? 1.2 : 0,
        opacity: isDragging ? 0.95 : 1,
      }}
      transition={
        isDragging
          ? { duration: 0 } // 커서에 즉시 붙음
          : { type: "spring", stiffness: 500, damping: 30 } // 놓을 때 부드럽게
      }
      title="클릭으로 상세 · 드래그로 이동"
      className={`group absolute overflow-hidden rounded-md border px-1.5 py-0.5 text-left select-none ${
        isDragging
          ? "z-50 cursor-grabbing"
          : "cursor-grab transition-shadow hover:shadow-md"
      }`}
      style={{
        left,
        top,
        width: Math.max(width, 56),
        height,
        borderLeftWidth: 3,
        borderLeftStyle: job.isHouseCall ? "dashed" : "solid",
        boxShadow: isDragging
          ? "0 16px 32px -8px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.1)"
          : highlighted
            ? "0 0 0 2px #F97316, 0 4px 14px rgba(249,115,22,0.30)"
            : undefined,
        ...cardStyle,
      }}
    >
      {compact ? (
        // 축약: 한 줄, 아이콘 + 차주명만
        <div className="flex h-full items-center gap-1 text-[10px] font-bold leading-tight">
          <ChannelIcon className="h-3 w-3 shrink-0" strokeWidth={2.25} />
          <TypeIcon className="h-3 w-3 shrink-0" strokeWidth={2.25} />
          <span className="truncate">{job.customerName}</span>
          {isInProgress && (
            <span className="ml-auto inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1 text-[10px] font-bold leading-tight">
            <ChannelIcon className="h-3 w-3 shrink-0" strokeWidth={2.25} />
            <TypeIcon className="h-3 w-3 shrink-0" strokeWidth={2.25} />
            {job.videoRef && <PlayCircle className="h-3 w-3 shrink-0" strokeWidth={2.25} />}
            {isCompleted && (
              <span className="ml-auto text-[10px] font-bold opacity-70">✓</span>
            )}
            {isInProgress && (
              <span className="ml-auto inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            )}
          </div>
          <p className="mt-0.5 truncate text-[11px] font-bold leading-tight">
            {job.customerName} · {job.vehicleModel}
          </p>
          <p
            className={`truncate text-[10px] leading-tight ${
              isInProgress ? "text-blue-100" : isCompleted ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {job.title} · {formatKRW(job.total)}
          </p>
        </>
      )}
    </motion.button>
  )
}
