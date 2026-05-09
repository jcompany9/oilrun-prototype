// Tenant 격리 동작 검증
//
// 실행: npx tsx scripts/test-tenant.ts

import { config } from "dotenv"
config({ path: ".env.local" })

import { randomBytes } from "node:crypto"
import { prisma } from "../lib/db"
import { dbScoped, withTenant } from "../lib/server/tenant"
import { encryptPII, hashPII, normalizePhone } from "../lib/crypto"

async function main() {
  // ─── 1. 두 번째 정비소(테스트용) 임시 생성 ──────────
  const testBizNumber = `TEST-${randomBytes(3).toString("hex")}`
  const testOwnerPhone = normalizePhone(`010${randomBytes(4).toString("hex").slice(0, 8)}`)

  console.log("\n[1] 테스트용 두 번째 정비소 생성")
  const testOwner = await prisma.user.create({
    data: {
      name: "테스트사장",
      phoneCipher: encryptPII(testOwnerPhone),
      phoneHash: hashPII(testOwnerPhone),
      status: "ACTIVE",
    },
  })
  const shopB = await prisma.shop.create({
    data: {
      slug: `test-shop-${randomBytes(3).toString("hex")}`,
      name: "테스트정비소(임시)",
      ownerUserId: testOwner.id,
      businessNumber: testBizNumber,
      representative: "테스트사장",
      contactPhone: testOwnerPhone,
      state: "ACTIVE",
    },
  })
  console.log(`  shop B 생성: ${shopB.id}`)

  const shopA = await prisma.shop.findUniqueOrThrow({
    where: { businessNumber: "123-45-67890" },
  })

  const channelB = await prisma.channel.create({
    data: { shopId: shopB.id, type: "PHONE", label: "B의 전화" },
  })
  const phoneB = normalizePhone("010-9999-9999")
  await prisma.booking.create({
    data: {
      shopId: shopB.id,
      bookingNumber: `BK-TEST-${randomBytes(3).toString("hex")}`,
      channelId: channelB.id,
      customerName: "B의차주",
      customerPhoneCipher: encryptPII(phoneB),
      customerPhoneHash: hashPII(phoneB),
      intent: "REGULAR",
      status: "NEW",
    },
  })
  console.log("  shop B에 부킹 1건 추가")

  // ─── 2. shop A 컨텍스트 → A의 부킹만 ────────────
  console.log("\n[2] withTenant(shopA) — A의 부킹만 보이는지")
  await withTenant(
    { shopId: shopA.id, userId: testOwner.id, role: "OWNER" },
    async () => {
      const bookings = await dbScoped.booking.findMany()
      const wrongTenant = bookings.filter((b) => b.shopId !== shopA.id)
      console.log(`  보이는 부킹: ${bookings.length}건`)
      console.log(`  shop A 외 데이터 누설: ${wrongTenant.length}건`)
      if (wrongTenant.length > 0) {
        console.error("  ❌ 격리 실패!")
        process.exit(1)
      }
      console.log("  ✓ 격리 OK")
    }
  )

  // ─── 3. shop B 컨텍스트 → B의 부킹만 ────────────
  console.log("\n[3] withTenant(shopB) — B의 부킹만")
  await withTenant(
    { shopId: shopB.id, userId: testOwner.id, role: "OWNER" },
    async () => {
      const bookings = await dbScoped.booking.findMany()
      const wrongTenant = bookings.filter((b) => b.shopId !== shopB.id)
      console.log(`  보이는 부킹: ${bookings.length}건`)
      console.log(`  shop B 외 데이터 누설: ${wrongTenant.length}건`)
      if (bookings.length === 0 || wrongTenant.length > 0) {
        console.error("  ❌ 격리 실패!")
        process.exit(1)
      }
      console.log("  ✓ 격리 OK")
    }
  )

  // ─── 4. 컨텍스트 없이 dbScoped → throw ──────────
  console.log("\n[4] 컨텍스트 없이 dbScoped — 에러 발생해야")
  let threw = false
  try {
    await dbScoped.booking.findMany()
  } catch (e) {
    threw = true
    console.log(`  ✓ 에러 발생: ${(e as Error).message.slice(0, 60)}...`)
  }
  if (!threw) {
    console.error("  ❌ 보안 위험!")
    process.exit(1)
  }

  // ─── 5. raw prisma → cross-tenant OK ────────────
  console.log("\n[5] raw prisma — 모든 shop 보임 (admin)")
  const allBookings = await prisma.booking.findMany()
  const distinctShops = new Set(allBookings.map((b) => b.shopId))
  console.log(`  전체 부킹: ${allBookings.length}건 / shop ${distinctShops.size}곳`)
  if (distinctShops.size < 2) {
    console.error("  ❌ raw prisma가 격리됨 — 의도 위반")
    process.exit(1)
  }
  console.log("  ✓ raw prisma는 cross-tenant OK")

  // ─── 6. 정리 ──────────────────────────────────
  console.log("\n[6] 테스트 정비소 정리")
  await prisma.booking.deleteMany({ where: { shopId: shopB.id } })
  await prisma.channel.deleteMany({ where: { shopId: shopB.id } })
  await prisma.shop.delete({ where: { id: shopB.id } })
  await prisma.user.delete({ where: { id: testOwner.id } })
  console.log("  ✓ 정리 완료")

  console.log("\n✅ Tenant 격리 검증 통과")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
