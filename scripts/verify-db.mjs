import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"

config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const tables = await prisma.$queryRaw`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`

console.log(`\n=== Row counts (${tables.length} tables) ===`)
for (const t of tables) {
  const r = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS n FROM "${t.table_name}"`
  )
  const n = r[0].n
  if (n > 0) console.log(`  ${t.table_name.padEnd(28)} ${n}`)
}

console.log("\n=== Shop ===")
const shops = await prisma.shop.findMany({
  include: {
    locations: { select: { name: true } },
    staff: { select: { displayName: true, role: true } },
    bookingMenus: { select: { name: true, isHouseCall: true } },
    subscription: { select: { planCode: true, status: true } },
    _count: {
      select: { bookings: true, customers: true, vehicles: true, channels: true },
    },
  },
})
for (const s of shops) {
  console.log(`  ${s.name} (${s.slug}) — ${s.state}`)
  console.log(`    구독: ${s.subscription?.planCode} ${s.subscription?.status}`)
  console.log(`    지점: ${s.locations.map((l) => l.name).join(", ")}`)
  console.log(`    직원: ${s.staff.map((m) => `${m.displayName}(${m.role})`).join(", ")}`)
  console.log(`    채널: ${s._count.channels}개 / 메뉴: ${s.bookingMenus.length}개 (출장 ${s.bookingMenus.filter((m) => m.isHouseCall).length})`)
  console.log(`    데이터: 차주 ${s._count.customers}명 / 차량 ${s._count.vehicles}대 / 부킹 ${s._count.bookings}건`)
}

console.log("\n=== Bookings (인박스) ===")
const bookings = await prisma.booking.findMany({
  orderBy: { scheduledStart: "asc" },
  include: { channel: { select: { type: true, label: true } } },
})
for (const b of bookings) {
  const time = b.scheduledStart?.toISOString().slice(0, 16).replace("T", " ")
  console.log(
    `  [${b.status}] ${time} · ${b.channel.label.padEnd(14)} · ${b.customerName} · ${b.bookingMenuName ?? b.description ?? "-"}`
  )
}

await prisma.$disconnect()
