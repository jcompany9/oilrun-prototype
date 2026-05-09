"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Inbox,
  Sparkles,
  PlayCircle,
  ExternalLink,
  CalendarPlus,
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

// 헤더 🔔 bell 아래에 뜨는 알림 popover
export function InboxDrawer({
  open,
  onClose,
  incoming,
  loading,
  onAutoAssign,
  onStartPlacement,
}: {
  open: boolean
  onClose: () => void
  incoming: SaasIncomingBooking[]
  loading: boolean
  onAutoAssign: () => void
  onStartPlacement: (b: SaasIncomingBooking) => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 외부 클릭으로 닫기 (투명, 배경 dim 없음) */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            // bell은 헤더(64px) 우측 ~16px. 그 바로 아래.
            className="fixed right-4 top-[60px] z-50 flex max-h-[70vh] w-[min(380px,calc(100vw-2rem))] origin-top-right flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            role="dialog"
            aria-label="들어오는 예약 알림"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                <Inbox className="h-3.5 w-3.5" />
                들어오는 예약
                {!loading && incoming.length > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    {incoming.length}
                  </span>
                )}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              {loading ? (
                <div className="rounded-lg bg-gray-50 px-3 py-6 text-center text-xs text-gray-500">
                  로드 중…
                </div>
              ) : incoming.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-6 text-center text-xs text-gray-700">
                  ✓ 새 예약이 없어요
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  <AnimatePresence>
                    {incoming.map((b) => (
                      <motion.li
                        key={b.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <IncomingCard
                          booking={b}
                          onPlace={() => onStartPlacement(b)}
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {!loading && incoming.length > 0 && (
              <div className="shrink-0 border-t border-gray-100 bg-white p-2">
                <button
                  type="button"
                  onClick={onAutoAssign}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#F97316" }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {incoming.length}건 자동 배정
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function IncomingCard({
  booking,
  onPlace,
}: {
  booking: SaasIncomingBooking
  onPlace: () => void
}) {
  const ChannelIcon = CHANNEL_ICON[booking.channel]
  const TypeIcon = JOB_TYPE_ICON[booking.jobType]
  const video = findVideoById(booking.videoRef)

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-2.5 py-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700">
          <ChannelIcon className="h-3 w-3" strokeWidth={2.25} />
          <span>{channelLabel[booking.channel]}</span>
        </span>
        <span className="text-[10px] text-gray-500">{booking.preferredTime}</span>
      </div>
      <div className="flex flex-col gap-1 px-2.5 py-2">
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
        {video && (
          <Link
            href="/saas/creator"
            className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-100"
          >
            <PlayCircle className="h-3 w-3" strokeWidth={2.25} />
            <span className="truncate">{video.title}</span>
            <ExternalLink className="ml-auto h-3 w-3" />
          </Link>
        )}
        <button
          type="button"
          onClick={onPlace}
          className="mt-0.5 inline-flex items-center justify-center gap-1 rounded border border-blue-700 px-2 py-1 text-[10px] font-bold text-blue-700 transition-colors hover:bg-blue-50"
        >
          <CalendarPlus className="h-3 w-3" strokeWidth={2.25} />
          캘린더에 배치
        </button>
      </div>
    </article>
  )
}
