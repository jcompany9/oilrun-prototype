import type { Booking, Channel } from "@prisma/client"
import type {
  SaasChannel,
  SaasIncomingBooking,
  SaasJobType,
} from "@/lib/mock-data"

// ─── 채널 enum 매핑 (DB ChannelType → UI SaasChannel)
const CHANNEL_MAP: Record<string, SaasChannel> = {
  PHONE: "phone",
  KAKAO: "kakao",
  NAVER: "naver",
  WEB: "self",
  OILRUN: "oilrun",
  CREATOR_VIDEO: "youtube",
  WALK_IN: "phone",
  REFERRAL: "phone",
  OTHER: "phone",
}

function inferJobType(menuName: string | null, intent: string): SaasJobType {
  if (menuName) {
    const lower = menuName.toLowerCase()
    if (lower.includes("블랙박스")) return "blackbox"
    if (lower.includes("타이어")) return "tire"
    if (lower.includes("배터리")) return "battery"
    if (lower.includes("점검")) return "inspection"
    if (lower.includes("오일")) return "oil"
  }
  if (intent === "WARNING_LIGHT" || intent === "EMERGENCY" || intent === "NOISE") {
    return "inspection"
  }
  return "oil"
}

function formatScheduledTime(d: Date | null): string {
  if (!d) return "시간 미정"

  const now = new Date()
  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  const isTomorrow = (() => {
    const tmr = new Date(now)
    tmr.setDate(now.getDate() + 1)
    return (
      d.getFullYear() === tmr.getFullYear() &&
      d.getMonth() === tmr.getMonth() &&
      d.getDate() === tmr.getDate()
    )
  })()

  const hh = d.getHours()
  const period = hh < 12 ? "오전" : "오후"
  const hour12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
  const timeStr = `${period} ${hour12}시`

  if (isSameDay) return `오늘 ${timeStr}`
  if (isTomorrow) return `내일 ${timeStr}`
  return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`
}

export function bookingToIncoming(
  b: Booking & { channel: Channel }
): SaasIncomingBooking {
  return {
    id: b.id,
    channel: CHANNEL_MAP[b.channel.type] ?? "phone",
    jobType: inferJobType(b.bookingMenuName, b.intent),
    customerName: b.customerName,
    vehiclePlate: b.vehiclePlateMasked ?? "",
    vehicleModel: b.vehicleModelName ?? "",
    preferredTime: formatScheduledTime(b.scheduledStart),
    total: b.estimatedAmount ?? 0,
    message: b.description ?? undefined,
    videoRef: b.sourceRef ?? undefined,
  }
}
