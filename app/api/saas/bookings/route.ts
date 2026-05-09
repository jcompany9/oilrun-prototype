import { NextResponse } from "next/server"
import { dbScoped, getTenant, withTenant } from "@/lib/server/tenant"
import { getCurrentTenant } from "@/lib/server/auth-stub"
import {
  encryptPII,
  hashPII,
  maskPlate,
  normalizePhone,
  normalizePlate,
} from "@/lib/crypto"

interface CreateBookingBody {
  channelType:
    | "PHONE"
    | "WALK_IN"
    | "KAKAO"
    | "NAVER"
    | "WEB"
    | "OILRUN"
    | "CREATOR_VIDEO"
    | "REFERRAL"
    | "OTHER"
  intent: "REGULAR" | "WARNING_LIGHT" | "NOISE" | "EMERGENCY" | "HOUSE_CALL"
  customerName: string
  customerPhone: string
  vehiclePlate?: string
  vehicleManufacturer?: string
  vehicleModelName?: string
  vehicleYear?: number
  vehicleFuel?: "GASOLINE" | "DIESEL" | "LPG" | "HYBRID" | "ELECTRIC"
  vehicleCategory?: "COMPACT" | "MIDSIZE" | "SUV" | "LUXURY" | "EV"
  bookingMenuId?: string
  bookingMenuName?: string
  estimatedAmount?: number
  scheduledStart?: string
  isHouseCall?: boolean
  description?: string
}

function genBookingNumber(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `BK-${yyyy}${mm}${dd}-${rand}`
}

// POST /api/saas/bookings — 사장님이 전화·워크인 등 직접 받은 예약 입력
export async function POST(req: Request) {
  const body = (await req.json()) as CreateBookingBody

  if (!body.customerName?.trim()) {
    return NextResponse.json({ error: "customerName 필수" }, { status: 400 })
  }
  if (!body.customerPhone?.trim()) {
    return NextResponse.json({ error: "customerPhone 필수" }, { status: 400 })
  }
  if (!body.channelType) {
    return NextResponse.json({ error: "channelType 필수" }, { status: 400 })
  }

  const tenant = await getCurrentTenant()

  return withTenant(tenant, async () => {
    // 채널 찾기 (없으면 에러 — seed 시 기본 6개 만들어둠)
    const channel = await dbScoped.channel.findFirst({
      where: { type: body.channelType },
    })
    if (!channel) {
      return NextResponse.json(
        { error: `Channel ${body.channelType} 미등록` },
        { status: 400 }
      )
    }

    const phoneNorm = normalizePhone(body.customerPhone)
    const phoneHash = hashPII(phoneNorm)
    const phoneCipher = encryptPII(phoneNorm)

    const plateNorm = body.vehiclePlate
      ? normalizePlate(body.vehiclePlate)
      : null

    // 작업 시간은 항상 30분 단위 (정책)
    const scheduledStart = body.scheduledStart ? new Date(body.scheduledStart) : null
    const rawDurationMin = 60 // TODO: 메뉴에서 derive
    const durationMin = Math.max(30, Math.round(rawDurationMin / 30) * 30)
    const scheduledEnd = scheduledStart
      ? new Date(scheduledStart.getTime() + durationMin * 60 * 1000)
      : null

    const ctx = getTenant()
    const booking = await dbScoped.booking.create({
      data: {
        // tenant middleware가 자동 주입하지만 TS 타입 만족시키려면 명시 필요
        shopId: ctx.shopId,
        bookingNumber: genBookingNumber(new Date()),
        channelId: channel.id,
        customerName: body.customerName.trim(),
        customerPhoneCipher: phoneCipher,
        customerPhoneHash: phoneHash,
        vehiclePlateMasked: plateNorm ? maskPlate(plateNorm) : null,
        vehicleManufacturer: body.vehicleManufacturer ?? null,
        vehicleModelName: body.vehicleModelName ?? null,
        vehicleYear: body.vehicleYear ?? null,
        vehicleFuel: body.vehicleFuel ?? null,
        vehicleCategory: body.vehicleCategory ?? null,
        intent: body.intent,
        bookingMenuId: body.bookingMenuId ?? null,
        bookingMenuName: body.bookingMenuName ?? null,
        estimatedAmount: body.estimatedAmount ?? null,
        scheduledStart,
        scheduledEnd,
        isHouseCall: body.isHouseCall ?? false,
        description: body.description ?? null,
        status: "NEW",
      },
    })

    return NextResponse.json({ id: booking.id, bookingNumber: booking.bookingNumber }, { status: 201 })
  })
}
