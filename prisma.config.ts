import path from "node:path"
import { config as loadEnv } from "dotenv"
import { defineConfig } from "prisma/config"

// Next.js convention: .env.local 우선, .env fallback
loadEnv({ path: ".env.local" })
loadEnv({ path: ".env" })

// Prisma 7: connection URL은 schema가 아니라 여기서 설정
// - DATABASE_URL: Supabase pooler (transaction mode, 6543 포트) — 런타임용 (lib/db.ts)
// - DIRECT_URL  : Supabase direct connection (5432 포트) — prisma migrate 전용
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
})
