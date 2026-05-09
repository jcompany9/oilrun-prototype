import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  encryptPII,
  hashPII,
  maskPlate,
  normalizePhone,
  normalizePlate,
} from "@/lib/crypto"

// POST /api/public/bookings
// 차주 부킹 페이지(/book/[shopSlug])에서 호출 — 인증 없음, shopSlug로 정비소 식별
//
// rate limit·spam 방지는 Phase 2 (Cloudflare Turnstile or reCAPTCHA)

interface CreatePublicBookingBody {
  shopSlug: string
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
  scheduledStart?: string // ISO — 차주가 슬롯 선택했을 때
  durationMin?: number
  description?: string
  sourceRef?: string // ?ref=video123 attribution
  sourceManual?: string
}

function genBookingNumber(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `BK-${yyyy}${mm}${dd}-${rand}`
}

export async function POST(req: Request) {
  let body: CreatePublicBookingBody
  try {
    body = (await req.json()) as CreatePublicBookingBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.shopSlug?.trim()) {
    return NextResponse.json({ error: "shopSlug 필수" }, { status: 400 })
  }
  if (!body.customerName?.trim()) {
    return NextResponse.json({ error: "이름 필수" }, { status: 400 })
  }
  if (!body.customerPhone?.trim()) {
    return NextResponse.json({ error: "휴대폰 필수" }, { status: 400 })
  }
  if (!body.intent) {
    return NextResponse.json({ error: "intent 필수" }, { status: 400 })
  }

  const shop = await prisma.shop.findUnique({
    where: { slug: body.shopSlug.trim() },
  })
  if (!shop || shop.state !== "ACTIVE") {
    return NextResponse.json({ error: "정비소를 찾을 수 없거나 운영 중지" }, { status: 404 })
  }

  // 차주 부킹은 채널 = WEB 또는 CREATOR_VIDEO (sourceRef 있을 시)
  const channelType = body.sourceRef ? "CREATOR_VIDEO" : "WEB"
  let channel = await prisma.channel.findFirst({
    where: { shopId: shop.id, type: channelType },
  })
  if (!channel) {
    // 채널 자동 생성
    channel = await prisma.channel.create({
      data: {
        shopId: shop.id,
        type: channelType,
        label: channelType === "WEB" ? "자체 부킹 페이지" : "Creator 영상",
      },
    })
  }

  const phoneNorm = normalizePhone(body.customerPhone)
  const phoneHash = hashPII(phoneNorm)
  const phoneCipher = encryptPII(phoneNorm)
  const plateNorm = body.vehiclePlate ? normalizePlate(body.vehiclePlate) : null

  // 작업 시간 30분 단위 정책
  const durationMin = Math.max(
    30,
    Math.round((body.durationMin ?? 60) / 30) * 30
  )
  const scheduledStart = body.scheduledStart ? new Date(body.scheduledStart) : null
  const scheduledEnd = scheduledStart
    ? new Date(scheduledStart.getTime() + durationMin * 60_000)
    : null

  const booking = await prisma.booking.create({
    data: {
      shopId: shop.id,
      bookingNumber: genBookingNumber(new Date()),
      channelId: channel.id,
      sourceRef: body.sourceRef ?? null,
      sourceManual: body.sourceManual ?? null,
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
      isHouseCall: body.intent === "HOUSE_CALL",
      description: body.description ?? null,
      status: "NEW",
    },
  })

  return NextResponse.json(
    { id: booking.id, bookingNumber: booking.bookingNumber },
    { status: 201 }
  )
}
