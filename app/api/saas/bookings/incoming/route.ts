import { NextResponse } from "next/server"
import { dbScoped, withTenant } from "@/lib/server/tenant"
import { getCurrentTenant } from "@/lib/server/auth-stub"
import { bookingToIncoming } from "@/lib/server/mappers/booking"

// GET /api/saas/bookings/incoming
// 들어오는 예약 (status=NEW) 인박스
//
// TODO: getCurrentTenant() → Auth.js session으로 교체
export async function GET() {
  const tenant = await getCurrentTenant()

  return withTenant(tenant, async () => {
    const bookings = await dbScoped.booking.findMany({
      where: { status: "NEW" },
      include: { channel: true },
      orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(bookings.map(bookingToIncoming))
  })
}
