// Supabase Realtime 활성화 + 부킹 read 정책 (프로토타입용)
//
// 실행: node --env-file=.env.local scripts/enable-realtime.mjs
//
// 주의 (운영 시 변경 필요):
//   - 현재는 anon 역할에 Booking 전체 SELECT 허용 → cross-tenant 누설 가능
//   - 운영 단계엔 JWT의 shopId claim으로 RLS 필터링 필요 (Auth.js 통합 후)

import pg from "pg"

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
})
await client.connect()

async function tryRun(sql, ignorePatterns = []) {
  try {
    await client.query(sql)
    console.log(`✓ ${sql.slice(0, 80)}...`)
  } catch (e) {
    const msg = String(e.message || e)
    if (ignorePatterns.some((p) => msg.includes(p))) {
      console.log(`⚠ ${sql.slice(0, 80)}... (이미 존재 — skip)`)
    } else {
      throw e
    }
  }
}

console.log("📡 Supabase Realtime 셋업 시작...")

// 1) Booking 테이블을 supabase_realtime publication에 추가
await tryRun(
  `ALTER PUBLICATION supabase_realtime ADD TABLE "Booking"`,
  ["already member of publication"]
)

// 2) RLS 활성화
await tryRun(`ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY`)

// 3) anon SELECT 정책 (프로토타입 용. 운영 시 JWT shopId 필터로 교체)
await tryRun(`DROP POLICY IF EXISTS "anon_read_all_bookings" ON "Booking"`)
await tryRun(
  `CREATE POLICY "anon_read_all_bookings" ON "Booking" FOR SELECT TO anon USING (true)`
)

// 4) authenticated 역할도 읽을 수 있게 (Auth.js 통합 시)
await tryRun(`DROP POLICY IF EXISTS "authenticated_read_all_bookings" ON "Booking"`)
await tryRun(
  `CREATE POLICY "authenticated_read_all_bookings" ON "Booking" FOR SELECT TO authenticated USING (true)`
)

console.log("\n✅ Realtime 셋업 완료")
console.log("  - Booking 변경 시 supabase_realtime publication으로 push")
console.log("  - 클라이언트가 supabase.channel().on('postgres_changes')로 구독 가능")

await client.end()
