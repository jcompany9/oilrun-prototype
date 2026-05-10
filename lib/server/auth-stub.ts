import { prisma } from "../db"
import type { TenantContext } from "./tenant"

// ⚠️ 임시 stub — Auth.js 통합 전까지만 사용
// 실 운영에서는 NextAuth 세션에서 shopId 추출
//
// 사용:
//   const tenant = await getCurrentTenant()
//   return withTenant(tenant, async () => { ... })

const DEV_SHOP_SLUG = "hyungje"

export async function getCurrentTenant(): Promise<TenantContext> {
  // TODO: Auth.js 통합 후 NextAuth 세션에서 shopId 추출
  // 프로토타입 단계는 production에서도 stub 사용 (단일 정비소 시연용)
  const shop = await prisma.shop.findUniqueOrThrow({
    where: { slug: DEV_SHOP_SLUG },
  })

  return {
    shopId: shop.id,
    userId: shop.ownerUserId,
    role: "OWNER",
  }
}
