"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Inbox,
  Sparkles,
  PlayCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Globe,
  Smartphone,
  Package,
  Droplet,
  Camera,
  CircleDot,
  BatteryFull,
  ClipboardCheck,
  Wrench,
  Truck,
  GripVertical,
  type LucideIcon,
} from "lucide-react"
import {
  channelLabel,
  jobTypeLabel,
  findVideoById,
  type SaasChannel,
  type SaasJobType,
  type SaasIncomingBooking,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"
import { useInbox } from "@/lib/contexts/saas-inbox"

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

// 우측 인박스 사이드바 — 좌측 nav와 같은 collapsible 패턴
export function InboxSidebar() {
  const inbox = useInbox()
  const collapsed = inbox.inboxCollapsed
  const hasItems = !inbox.loading && inbox.incoming.length > 0

  return (
    <aside
      className={`relative hidden shrink-0 flex-col border-l border-gray-200 bg-white transition-[width] duration-200 lg:flex ${
        collapsed ? "w-12" : "w-72"
      }`}
    >
      {/* 좌측 가장자리 떠있는 토글 — 항상 보임 */}
      <button
        type="button"
        onClick={inbox.toggleInboxCollapsed}
        aria-label={collapsed ? "인박스 펼치기" : "인박스 접기"}
        title={collapsed ? "인박스 펼치기" : "인박스 접기"}
        className="absolute -left-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
      >
        {collapsed ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>

      {collapsed ? (
        <CollapsedView count={inbox.incoming.length} loading={inbox.loading} hasItems={hasItems} />
      ) : (
        <ExpandedView />
      )}
    </aside>
  )
}

function CollapsedView({
  count,
  loading,
  hasItems,
}: {
  count: number
  loading: boolean
  hasItems: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 py-4">
      <div className="relative">
        <Inbox className="h-5 w-5 text-gray-700" strokeWidth={2} />
        {hasItems && (
          <>
            <span
              className="absolute -right-1.5 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: "#F97316" }}
            >
              {count}
            </span>
            <span className="absolute -right-1.5 -top-1 flex h-4 w-4">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                style={{ backgroundColor: "#FB923C" }}
              />
            </span>
          </>
        )}
      </div>
      {!loading && !hasItems && (
        <span className="rotate-180 text-[10px] font-medium text-gray-400 [writing-mode:vertical-rl]">
          새 예약 없음
        </span>
      )}
    </div>
  )
}

function ExpandedView() {
  const inbox = useInbox()

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
          <Inbox className="h-3.5 w-3.5" />
          들어오는 예약
          {!inbox.loading && inbox.incoming.length > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: "#F97316" }}
            >
              {inbox.incoming.length}
            </span>
          )}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {inbox.loading ? (
          <div className="rounded-lg bg-gray-50 px-3 py-6 text-center text-xs text-gray-500">
            로드 중…
          </div>
        ) : inbox.incoming.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-6 text-center text-xs text-gray-700">
            ✓ 새 예약이 없어요
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            <AnimatePresence>
              {inbox.incoming.map((b) => (
                <motion.li
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <DraggableBookingCard booking={b} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {!inbox.loading && inbox.incoming.length > 0 && (
        <div className="shrink-0 border-t border-gray-100 bg-white p-2">
          <button
            type="button"
            onClick={() => inbox.runAutoAssign()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#F97316" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {inbox.incoming.length}건 자동 배정
          </button>
        </div>
      )}
    </div>
  )
}

const DURATION_OPTIONS = [30, 60, 90, 120] as const

// 1x1 투명 이미지 — 네이티브 drag image 숨기고 커스텀 ghost 사용
const TRANSPARENT_IMG_SRC =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

function DraggableBookingCard({ booking }: { booking: SaasIncomingBooking }) {
  const inbox = useInbox()
  const ChannelIcon = CHANNEL_ICON[booking.channel]
  const TypeIcon = JOB_TYPE_ICON[booking.jobType]
  const video = findVideoById(booking.videoRef)
  const duration = inbox.getBookingDuration(booking.id)
  const armed = duration !== undefined

  function handleDragStart(e: React.DragEvent) {
    if (!armed) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("text/plain", booking.id)
    // 네이티브 ghost 숨김 → 커스텀 DragGhost 사용
    const img = new Image()
    img.src = TRANSPARENT_IMG_SRC
    e.dataTransfer.setDragImage(img, 0, 0)
    inbox.startPlacement(booking)
  }

  function handleDragEnd() {
    // drop이 슬롯에서 처리됐으면 placementBooking은 이미 null
    // 아니면 (외부 release) → 취소
    setTimeout(() => {
      if (inbox.placementBooking) inbox.cancelPlacement()
    }, 30)
  }

  return (
    <article
      draggable={armed}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`overflow-hidden rounded-lg border bg-white select-none transition-colors ${
        armed
          ? "cursor-grab border-orange-300 hover:shadow-md active:cursor-grabbing"
          : "cursor-default border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-2.5 py-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700">
          <ChannelIcon className="h-3 w-3" strokeWidth={2.25} />
          <span>{channelLabel[booking.channel]}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
          {booking.preferredTime}
          {armed && <GripVertical className="h-3 w-3 text-orange-500" />}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 px-2.5 py-2">
        <p className="text-[13px] font-bold text-gray-900">
          {booking.customerName} · {booking.vehicleModel}
        </p>
        <p className="flex items-center gap-1 text-[11px] text-gray-700">
          <TypeIcon className="h-3 w-3" strokeWidth={2.25} />
          <span>{jobTypeLabel[booking.jobType]}</span>
          <span className="ml-auto font-bold tabular-nums text-gray-900">
            {formatKRW(booking.total)}
          </span>
        </p>
        {booking.message && (
          <p className="rounded bg-gray-50 px-2 py-1 text-[10px] text-gray-600">
            &ldquo;{booking.message}&rdquo;
          </p>
        )}

        {/* 작업 시간 선택 — 선택 시 카드 테두리 주황으로 변경 */}
        <div onMouseDown={(e) => e.stopPropagation()}>
          <p className="mb-1 text-[10px] font-semibold text-gray-500">작업 시간</p>
          <div className="grid grid-cols-4 gap-1">
            {DURATION_OPTIONS.map((d) => {
              const active = duration === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => inbox.setBookingDuration(booking.id, d)}
                  className={`rounded border px-1 py-0.5 text-[10px] font-bold transition-colors ${
                    active
                      ? "text-white"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  style={
                    active
                      ? { backgroundColor: "#1E40AF", borderColor: "#1E40AF" }
                      : undefined
                  }
                >
                  {d}분
                </button>
              )
            })}
          </div>
        </div>

        {video && (
          <Link
            href="/saas/creator"
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-100"
          >
            <PlayCircle className="h-3 w-3" strokeWidth={2.25} />
            <span className="truncate">{video.title}</span>
            <ExternalLink className="ml-auto h-3 w-3" />
          </Link>
        )}
      </div>
    </article>
  )
}
