// 1호 정비소 (성수자동차정비) 시드 데이터
// 실행: node prisma/seed.mjs
//
// 멱등성: 모든 upsert 사용. 여러 번 돌려도 안전.

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import crypto from "node:crypto"

config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ─── PII 헬퍼 (lib/crypto.ts와 동일 로직, ESM 한정 인라인)
const RAW_KEY = process.env.PII_ENCRYPTION_KEY ?? "dev-only-please-rotate-in-production-32b!"
const KEY = crypto.createHash("sha256").update(RAW_KEY).digest()
function encryptPII(plaintext) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv)
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), enc])
}
function hashPII(v) {
  return crypto.createHash("sha256").update(v).digest("hex")
}
function normalizePhone(p) { return p.replace(/[^\d]/g, "") }
function normalizePlate(p) { return p.replace(/\s/g, "") }
function maskPlate(p) {
  const n = normalizePlate(p)
  if (n.length <= 3) return n
  return n.slice(0, 3) + "*".repeat(Math.max(n.length - 3, 4))
}

console.log("🌱 Seeding...")

// ============================================================
// 1) Plans (B2B 구독)
// ============================================================
await prisma.plan.upsert({
  where: { code: "FREE" },
  create: {
    code: "FREE",
    name: "Free",
    monthlyPrice: 0,
    features: { maxBookings: 30, maxAlimtalk: 20, maxLocations: 1, maxUsers: -1 },
  },
  update: {},
})
await prisma.plan.upsert({
  where: { code: "STANDARD" },
  create: {
    code: "STANDARD",
    name: "Standard",
    monthlyPrice: 49000,
    features: { maxBookings: -1, maxAlimtalk: 100, maxLocations: 1, maxUsers: -1 },
  },
  update: {},
})
await prisma.plan.upsert({
  where: { code: "MULTI" },
  create: {
    code: "MULTI",
    name: "Multi",
    monthlyPrice: 89000,
    features: { maxBookings: -1, maxAlimtalk: 300, maxLocations: 2, maxUsers: -1 },
  },
  update: {},
})
console.log("  ✓ Plans (3)")

// ============================================================
// 2) Owner User + Shop (성수자동차정비)
// ============================================================
const ownerPhone = normalizePhone("010-1111-2222")
const ownerUser = await prisma.user.upsert({
  where: { phoneHash: hashPII(ownerPhone) },
  create: {
    name: "박정비",
    email: "owner@seongsu-auto.example",
    emailVerified: new Date(),
    phoneCipher: encryptPII(ownerPhone),
    phoneHash: hashPII(ownerPhone),
    status: "ACTIVE",
  },
  update: {},
})

const shop = await prisma.shop.upsert({
  where: { businessNumber: "123-45-67890" },
  create: {
    slug: "hyungje",
    name: "형제자동차정비",
    ownerUserId: ownerUser.id,
    businessNumber: "123-45-67890",
    representative: "김형제",
    contactPhone: normalizePhone("010-1111-2222"),
    state: "ACTIVE",
    approvedAt: new Date(),
  },
  update: {
    slug: "hyungje",
    name: "형제자동차정비",
    representative: "김형제",
    state: "ACTIVE",
  },
})
console.log(`  ✓ Shop: ${shop.name} (${shop.id})`)

// ShopSubscription (Standard 플랜 trial)
await prisma.shopSubscription.upsert({
  where: { shopId: shop.id },
  create: {
    shopId: shop.id,
    planCode: "STANDARD",
    status: "TRIALING",
    startedAt: new Date(),
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  update: {},
})
console.log("  ✓ ShopSubscription (Standard, trialing)")

// ============================================================
// 3) Locations (본점)
// ============================================================
const headquarter = await prisma.location.upsert({
  where: { id: `loc-hq-${shop.id}` },
  create: {
    id: `loc-hq-${shop.id}`,
    shopId: shop.id,
    name: "본점",
    isHeadquarter: true,
    address: "서울시 성동구 성수동 1가 123-45",
    district: "성동구",
    lat: 37.5447,
    lng: 127.0557,
    contactPhone: normalizePhone("02-1111-2222"),
    businessHours: {
      mon: { open: "09:00", close: "18:00", closed: false },
      tue: { open: "09:00", close: "18:00", closed: false },
      wed: { open: "09:00", close: "18:00", closed: false },
      thu: { open: "09:00", close: "18:00", closed: false },
      fri: { open: "09:00", close: "18:00", closed: false },
      sat: { open: "09:00", close: "14:00", closed: false },
      sun: { closed: true },
    },
    holidaysJson: ["2026-05-13"],
  },
  update: {},
})
console.log(`  ✓ Location: ${headquarter.name}`)

// ============================================================
// 4) Staff (정비사 3명)
// ============================================================
const staffSeed = [
  { displayName: "김기사", phone: "010-3333-4444", rating: 4.9, skills: ["oil", "blackbox", "tire"] },
  { displayName: "박기사", phone: "010-5555-6666", rating: 4.8, skills: ["oil", "battery"] },
  { displayName: "이기사", phone: "010-7777-8888", rating: 4.7, skills: ["oil", "wiper"] },
]
const staff = []
for (const s of staffSeed) {
  const phoneNorm = normalizePhone(s.phone)
  const user = await prisma.user.upsert({
    where: { phoneHash: hashPII(phoneNorm) },
    create: {
      name: s.displayName,
      phoneCipher: encryptPII(phoneNorm),
      phoneHash: hashPII(phoneNorm),
      status: "ACTIVE",
    },
    update: {},
  })
  const m = await prisma.staff.upsert({
    where: { userId_shopId: { userId: user.id, shopId: shop.id } },
    create: {
      userId: user.id,
      shopId: shop.id,
      primaryLocationId: headquarter.id,
      displayName: s.displayName,
      role: "MECHANIC",
      rating: s.rating,
      skills: s.skills,
      active: true,
      joinedAt: new Date(),
    },
    update: {},
  })
  staff.push(m)
}
console.log(`  ✓ Staff: ${staff.length}명`)

// ============================================================
// 5) Channels
// ============================================================
const channelSeed = [
  { type: "PHONE", label: "전화" },
  { type: "KAKAO", label: "카카오톡" },
  { type: "NAVER", label: "네이버 예약" },
  { type: "WEB", label: "자체 부킹 페이지" },
  { type: "OILRUN", label: "OilRun 마켓" },
  { type: "WALK_IN", label: "매장 워크인" },
]
const channels = {}
for (const c of channelSeed) {
  const ch = await prisma.channel.upsert({
    where: { id: `ch-${shop.id}-${c.type}` },
    create: {
      id: `ch-${shop.id}-${c.type}`,
      shopId: shop.id,
      type: c.type,
      label: c.label,
      active: true,
    },
    update: {},
  })
  channels[c.type] = ch
}
console.log(`  ✓ Channels: ${channelSeed.length}`)

// ============================================================
// 6) BookingMenu (정찰제 — 차종 카테고리별)
// ============================================================
const menuSeed = [
  {
    name: "기본형 합성유 5W-30",
    description: "일반 운전자에게 적합한 표준 합성유. 1만km 주기 권장.",
    jobType: "OIL",
    durationMin: 30,
    isHouseCall: false,
    recommended: false,
    prices: { COMPACT: 79000, MIDSIZE: 89000, SUV: 99000, LUXURY: 119000, EV: null },
  },
  {
    name: "프리미엄 합성유 0W-20",
    description: "연비 향상과 엔진 보호에 유리한 저점도 합성유. 신차 추천.",
    jobType: "OIL",
    durationMin: 30,
    isHouseCall: false,
    recommended: true,
    prices: { COMPACT: 119000, MIDSIZE: 129000, SUV: 149000, LUXURY: 169000, EV: null },
  },
  {
    name: "출장 엔진오일 교환",
    description: "기사가 직접 방문 · 주차장·자택·사무실 어디든 (기본 5W-30)",
    jobType: "OIL",
    durationMin: 60,
    isHouseCall: true,
    recommended: false,
    prices: { COMPACT: 99000, MIDSIZE: 109000, SUV: 119000, LUXURY: 139000, EV: null },
  },
]
const effectiveFrom = new Date("2026-01-01")
const menus = {}
for (let i = 0; i < menuSeed.length; i++) {
  const m = menuSeed[i]
  const menu = await prisma.bookingMenu.upsert({
    where: { id: `menu-${shop.id}-${i}` },
    create: {
      id: `menu-${shop.id}-${i}`,
      shopId: shop.id,
      name: m.name,
      description: m.description,
      jobType: m.jobType,
      durationMin: m.durationMin,
      isHouseCall: m.isHouseCall,
      recommended: m.recommended,
      sortOrder: i,
    },
    update: {},
  })
  for (const [cat, price] of Object.entries(m.prices)) {
    await prisma.bookingMenuPrice.upsert({
      where: {
        menuId_category_effectiveFrom: {
          menuId: menu.id,
          category: cat,
          effectiveFrom,
        },
      },
      create: {
        menuId: menu.id,
        category: cat,
        price,
        effectiveFrom,
      },
      update: {},
    })
  }
  menus[m.name] = menu
}
console.log(`  ✓ BookingMenu: ${menuSeed.length} (각 5개 카테고리 가격)`)

// ============================================================
// 7) AddOn 메뉴
// ============================================================
const addOnSeed = [
  { name: "에어 필터 교체", price: 15000 },
  { name: "에어컨 필터 교체", price: 15000 },
  { name: "와이퍼 교체", price: 20000 },
]
for (let i = 0; i < addOnSeed.length; i++) {
  const a = addOnSeed[i]
  const addOn = await prisma.addOnMenu.upsert({
    where: { id: `addon-${shop.id}-${i}` },
    create: {
      id: `addon-${shop.id}-${i}`,
      shopId: shop.id,
      name: a.name,
      sortOrder: i,
    },
    update: {},
  })
  for (const cat of ["COMPACT", "MIDSIZE", "SUV", "LUXURY", "EV"]) {
    await prisma.addOnMenuPrice.upsert({
      where: {
        addOnId_category_effectiveFrom: {
          addOnId: addOn.id,
          category: cat,
          effectiveFrom,
        },
      },
      create: {
        addOnId: addOn.id,
        category: cat,
        price: a.price,
        effectiveFrom,
      },
      update: {},
    })
  }
}
console.log(`  ✓ AddOn: ${addOnSeed.length}`)

// ============================================================
// 8) Customers + Vehicles (3명)
// ============================================================
const customerSeed = [
  {
    name: "김민수",
    phone: "010-1234-5678",
    plate: "12가3456",
    manufacturer: "기아",
    modelName: "카니발 4세대",
    year: 2022,
    fuel: "DIESEL",
    category: "MINIVAN", // 우리 enum엔 MINIVAN 없음 → SUV
  },
  {
    name: "이서연",
    phone: "010-2345-6789",
    plate: "34나5678",
    manufacturer: "현대",
    modelName: "쏘나타 DN8",
    year: 2021,
    fuel: "GASOLINE",
    category: "MIDSIZE",
  },
  {
    name: "박지호",
    phone: "010-3456-7890",
    plate: "56다7890",
    manufacturer: "현대",
    modelName: "아반떼 CN7",
    year: 2023,
    fuel: "GASOLINE",
    category: "COMPACT",
  },
]

// ⚠️ 위에 MINIVAN은 우리 enum에 없으니 SUV로 매핑
const categoryMap = {
  MINIVAN: "SUV",
  COMPACT: "COMPACT",
  MIDSIZE: "MIDSIZE",
  SUV: "SUV",
  LUXURY: "LUXURY",
  EV: "EV",
}

const customers = []
for (const c of customerSeed) {
  const phoneNorm = normalizePhone(c.phone)
  const customer = await prisma.customer.upsert({
    where: { shopId_phoneHash: { shopId: shop.id, phoneHash: hashPII(phoneNorm) } },
    create: {
      shopId: shop.id,
      name: c.name,
      phoneCipher: encryptPII(phoneNorm),
      phoneHash: hashPII(phoneNorm),
      kakaoOptIn: true,
      kakaoOptInAt: new Date(),
      smsOptIn: true,
    },
    update: {},
  })
  const plateNorm = normalizePlate(c.plate)
  const vehicle = await prisma.vehicle.upsert({
    where: { shopId_plateHash: { shopId: shop.id, plateHash: hashPII(plateNorm) } },
    create: {
      shopId: shop.id,
      customerId: customer.id,
      plateCipher: encryptPII(plateNorm),
      plateHash: hashPII(plateNorm),
      plateMasked: maskPlate(plateNorm),
      manufacturer: c.manufacturer,
      modelName: c.modelName,
      year: c.year,
      fuel: c.fuel,
      category: categoryMap[c.category],
      oilSpec: c.fuel === "DIESEL" ? "5W-30 합성유" : "0W-20 합성유",
      mileage: 30000 + Math.floor(Math.random() * 50000),
      isPrimary: true,
    },
    update: {},
  })
  customers.push({ customer, vehicle })
}
console.log(`  ✓ Customer + Vehicle: ${customers.length}`)

// ============================================================
// 9) Bookings (인박스 샘플 5건)
// ============================================================
const today = new Date()
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

const bookingSeed = [
  { customer: 0, channel: "KAKAO", intent: "REGULAR", menu: "기본형 합성유 5W-30", status: "NEW", scheduledHour: 14 },
  { customer: 1, channel: "WEB", intent: "REGULAR", menu: "프리미엄 합성유 0W-20", status: "CONFIRMED", scheduledHour: 16 },
  { customer: 2, channel: "PHONE", intent: "WARNING_LIGHT", menu: null, status: "NEW", scheduledHour: 11, description: "엔진 경고등 점등" },
  { customer: 0, channel: "OILRUN", intent: "HOUSE_CALL", menu: "출장 엔진오일 교환", status: "CONFIRMED", scheduledHour: 18, isHouseCall: true },
  { customer: 1, channel: "NAVER", intent: "REGULAR", menu: "기본형 합성유 5W-30", status: "NEW", scheduledHour: 10, tomorrow: true },
]

let bookingCount = 0
for (let i = 0; i < bookingSeed.length; i++) {
  const b = bookingSeed[i]
  const c = customers[b.customer]
  const scheduledStart = new Date(b.tomorrow ? tomorrow : today)
  scheduledStart.setHours(b.scheduledHour, 0, 0, 0)
  const menu = b.menu ? menus[b.menu] : null

  const dateStr = scheduledStart.toISOString().slice(0, 10).replaceAll("-", "")
  const bookingNumber = `BK-${dateStr}-${String(i + 1).padStart(4, "0")}`

  await prisma.booking.upsert({
    where: { bookingNumber },
    create: {
      shopId: shop.id,
      bookingNumber,
      channelId: channels[b.channel].id,
      customerId: c.customer.id,
      customerName: c.customer.name,
      customerPhoneCipher: c.customer.phoneCipher,
      customerPhoneHash: c.customer.phoneHash,
      vehicleId: c.vehicle.id,
      vehiclePlateMasked: c.vehicle.plateMasked,
      vehicleManufacturer: c.vehicle.manufacturer,
      vehicleModelName: c.vehicle.modelName,
      vehicleYear: c.vehicle.year,
      vehicleFuel: c.vehicle.fuel,
      vehicleCategory: c.vehicle.category,
      intent: b.intent,
      bookingMenuId: menu?.id,
      bookingMenuName: menu?.name,
      description: b.description,
      scheduledStart,
      scheduledEnd: new Date(scheduledStart.getTime() + 60 * 60 * 1000),
      isHouseCall: b.isHouseCall ?? false,
      locationId: headquarter.id,
      status: b.status,
      confirmedAt: b.status === "CONFIRMED" ? new Date() : null,
    },
    update: {},
  })
  bookingCount++
}
console.log(`  ✓ Bookings: ${bookingCount}`)

// ============================================================
// 10) AppConfig (수수료율, 매칭 정책 등 — 초기값)
// ============================================================
const configs = [
  { key: "feature.dvi", value: false, description: "DVI 디지털 차량점검 활성화" },
  { key: "feature.creator_module", value: true, description: "Creator 모듈 활성화 (1호 정비소 design partner)" },
  { key: "billing.commission_rate_default", value: 0, description: "마켓플레이스 수수료율 (SaaS 모델은 0)" },
  { key: "matching.assignment_timeout_sec", value: 600, description: "정비소가 새 주문에 응답 안 했을 때 timeout" },
]
for (const c of configs) {
  await prisma.appConfig.upsert({
    where: { key: c.key },
    create: { key: c.key, value: c.value, description: c.description },
    update: {},
  })
}
console.log(`  ✓ AppConfig: ${configs.length}`)

console.log("\n🌱 Seed 완료")

await prisma.$disconnect()
