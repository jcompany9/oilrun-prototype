import { NextResponse } from "next/server"
import { dbScoped, withTenant } from "@/lib/server/tenant"
import { getCurrentTenant } from "@/lib/server/auth-stub"

// GET /api/saas/booking-menus
// 새 예약 입력 폼에서 메뉴 선택용
export async function GET() {
  const tenant = await getCurrentTenant()

  return withTenant(tenant, async () => {
    const menus = await dbScoped.bookingMenu.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        prices: {
          where: { effectiveTo: null },
          select: { category: true, price: true },
        },
      },
    })

    return NextResponse.json(
      menus.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        jobType: m.jobType,
        durationMin: m.durationMin,
        isHouseCall: m.isHouseCall,
        recommended: m.recommended,
        prices: Object.fromEntries(m.prices.map((p) => [p.category, p.price])),
      }))
    )
  })
}
