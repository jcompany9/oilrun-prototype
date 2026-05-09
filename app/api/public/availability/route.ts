import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { BookingStatus } from "@prisma/client"

// GET /api/public/availability?shop=hyungje&date=2026-05-09&durationMin=30
//
// 응답: {
//   date, durationMin, mechanics,
//   slots: [{ time:"09:00", available:true, capacity:3 }, ...]
// }
//
// 가용 규칙:
//   - 영업시간(09-19), 점심(12-13), 30분 슬롯
//   - 오늘 날짜의 과거 시간은 closed
//   - 슬롯 [start, start+durationMin]과 겹치는 활성 부킹 수 < 정비사 수 → 가능
//   - 정비사 N명 → 동시에 N개까지 가능 (네이버 예약과 동일)

const BUSINESS_START = 9
const BUSINESS_END = 19 // 슬롯 종료가 이 시간을 넘기면 안 됨
const LUNCH_START = 12
const LUNCH_END = 13
const SLOT_INTERVAL = 30 // 분

const NON_BLOCKING_STATUSES: BookingStatus[] = [
  "CANCELED_BY_CUSTOMER",
  "CANCELED_BY_SHOP",
  "NO_SHOW",
]

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("shop")
  const dateStr = searchParams.get("date")
  const durationMin = Math.max(
    30,
    Math.round((Number(searchParams.get("durationMin")) || 30) / 30) * 30
  )

  if (!slug || !dateStr) {
    return NextResponse.json({ error: "shop, date 필수" }, { status: 400 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "date는 YYYY-MM-DD" }, { status: 400 })
  }

  const shop = await prisma.shop.findUnique({ where: { slug } })
  if (!shop || shop.state !== "ACTIVE") {
    return NextResponse.json({ error: "정비소 없음" }, { status: 404 })
  }

  // 활성 정비사 수
  const mechanicCount = await prisma.staff.count({
    where: { shopId: shop.id, role: "MECHANIC", active: true },
  })

  // 그 날의 모든 활성 부킹
  const dayStart = new Date(`${dateStr}T00:00:00`)
  const dayEnd = new Date(`${dateStr}T23:59:59`)
  const bookings = await prisma.booking.findMany({
    where: {
      shopId: shop.id,
      status: { notIn: NON_BLOCKING_STATUSES },
      scheduledStart: { gte: dayStart, lte: dayEnd },
    },
    select: { scheduledStart: true, scheduledEnd: true },
  })

  const now = new Date()
  const isToday =
    dayStart.getFullYear() === now.getFullYear() &&
    dayStart.getMonth() === now.getMonth() &&
    dayStart.getDate() === now.getDate()
  const isPastDay = dayStart < new Date(new Date().setHours(0, 0, 0, 0))

  const slots: Array<{
    time: string
    available: boolean
    capacity: number
    reason?: string
  }> = []

  for (let h = BUSINESS_START; h < BUSINESS_END; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL) {
      const slotStart = new Date(
        `${dateStr}T${pad(h)}:${pad(m)}:00`
      )
      const slotEnd = new Date(slotStart.getTime() + durationMin * 60_000)
      const slotEndHourFloat = slotEnd.getHours() + slotEnd.getMinutes() / 60

      // 영업 종료 시간 초과
      if (slotEndHourFloat > BUSINESS_END) continue

      // 점심시간과 겹침
      const lunchOverlap =
        slotStart.getHours() < LUNCH_END &&
        slotEndHourFloat > LUNCH_START
      if (lunchOverlap) {
        slots.push({
          time: `${pad(h)}:${pad(m)}`,
          available: false,
          capacity: 0,
          reason: "lunch",
        })
        continue
      }

      // 과거 날짜 또는 오늘의 과거 시간
      if (isPastDay || (isToday && slotStart < now)) {
        slots.push({
          time: `${pad(h)}:${pad(m)}`,
          available: false,
          capacity: 0,
          reason: "past",
        })
        continue
      }

      // 충돌 부킹 수
      const conflicts = bookings.filter(
        (b) =>
          b.scheduledStart &&
          b.scheduledEnd &&
          b.scheduledStart < slotEnd &&
          b.scheduledEnd > slotStart
      ).length

      const capacity = Math.max(0, mechanicCount - conflicts)
      slots.push({
        time: `${pad(h)}:${pad(m)}`,
        available: capacity > 0,
        capacity,
      })
    }
  }

  return NextResponse.json({
    date: dateStr,
    durationMin,
    mechanics: mechanicCount,
    slots,
  })
}
