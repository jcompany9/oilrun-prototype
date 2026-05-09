import { AsyncLocalStorage } from "node:async_hooks"
import { prisma } from "../db"

// ============================================================
// Tenant 격리 (멀티테넌트 핵심)
//
// 사용 패턴:
//   1. API 핸들러: 세션에서 shopId 꺼내서 withTenant(ctx, async () => { ... })
//   2. 핸들러 내부: dbScoped.booking.findMany() — 자동으로 shopId 필터됨
//   3. 플랫폼 레벨 (admin/seed/cron): raw `prisma` 사용
//
// 이중 안전장치:
//   - 1차: 이 미들웨어가 모든 query에 shopId 주입
//   - 2차: Supabase RLS (보조 방어 — auth.jwt() 의존 X)
// ============================================================

export interface TenantContext {
  shopId: string
  userId: string
  role: string
}

export const tenantStore = new AsyncLocalStorage<TenantContext>()

export function getTenant(): TenantContext {
  const ctx = tenantStore.getStore()
  if (!ctx) {
    throw new Error(
      "No tenant context. Wrap handler with withTenant() or use raw `prisma` for platform operations."
    )
  }
  return ctx
}

export function getTenantOrNull(): TenantContext | null {
  return tenantStore.getStore() ?? null
}

export async function withTenant<R>(
  ctx: TenantContext,
  fn: () => R | Promise<R>
): Promise<R> {
  return tenantStore.run(ctx, fn) as R | Promise<R>
}

// ─── Tenant-scoped 모델 (직접 shopId 컬럼 보유) ────────────
const TENANT_MODELS = new Set([
  "ShopDocument",
  "Location",
  "Staff",
  "Customer",
  "Vehicle",
  "Channel",
  "Booking",
  "Job",
  "BookingMenu",
  "AddOnMenu",
  "Estimate",
  "Invoice",
  "TaxInvoice",
  "Payment",
  "Refund",
  "NotificationTemplate",
  "NotificationLog",
  "ReminderRule",
  "ShopSubscription",
  "CreatorVideo",
  "AuditLog",
])

const READ_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
])

const FILTERED_WRITE_OPS = new Set([
  "update",
  "updateMany",
  "delete",
  "deleteMany",
])

// ─── 확장된 Prisma 클라이언트 (tenant scope 자동 적용) ─────
//
// findUnique / findUniqueOrThrow는 unique 제약 위반 우려 때문에
// 후처리(post-fetch validation)로 처리.
export const dbScoped = prisma.$extends({
  name: "tenant-scope",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !TENANT_MODELS.has(model)) return query(args)

        const ctx = getTenantOrNull()
        if (!ctx) {
          throw new Error(
            `No tenant context for ${model}.${operation}. Use raw 'prisma' for platform-level operations.`
          )
        }

        const a = args as Record<string, unknown>

        // 1) findUnique: unique 키와 shopId 결합 불가 → 후처리
        if (operation === "findUnique" || operation === "findUniqueOrThrow") {
          const result = await query(args)
          if (
            result &&
            typeof result === "object" &&
            "shopId" in result &&
            (result as { shopId: string }).shopId !== ctx.shopId
          ) {
            if (operation === "findUniqueOrThrow") {
              throw new Error("No record found.")
            }
            return null
          }
          return result
        }

        // 2) read 계열 → where에 shopId 주입
        if (READ_OPS.has(operation)) {
          a.where = { ...((a.where as object) ?? {}), shopId: ctx.shopId }
          return query(a)
        }

        // 3) 필터형 write → where + 필요 시 create/data에도 주입
        if (FILTERED_WRITE_OPS.has(operation)) {
          a.where = { ...((a.where as object) ?? {}), shopId: ctx.shopId }
          return query(a)
        }

        // 4) upsert → where + create 양쪽
        if (operation === "upsert") {
          a.where = { ...((a.where as object) ?? {}), shopId: ctx.shopId }
          a.create = { ...((a.create as object) ?? {}), shopId: ctx.shopId }
          return query(a)
        }

        // 5) create
        if (operation === "create") {
          a.data = { ...((a.data as object) ?? {}), shopId: ctx.shopId }
          return query(a)
        }

        // 6) createMany / createManyAndReturn
        if (operation === "createMany" || operation === "createManyAndReturn") {
          const data = a.data
          if (Array.isArray(data)) {
            a.data = data.map((d) => ({ ...(d as object), shopId: ctx.shopId }))
          } else if (data && typeof data === "object") {
            a.data = { ...(data as object), shopId: ctx.shopId }
          }
          return query(a)
        }

        return query(a)
      },
    },
  },
})

export type DbScoped = typeof dbScoped
