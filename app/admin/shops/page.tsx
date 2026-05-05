"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Check,
  FileCheck,
  FileX,
  MapPin,
  Phone,
  Plus,
  Star,
  X,
} from "lucide-react"
import {
  adminShops,
  type AdminShopRow,
} from "@/lib/admin-mock"
import { formatKRW } from "@/lib/utils"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function AdminShopsPage() {
  const [tab, setTab] = useState<AdminShopRow["state"]>("active")

  const groups = useMemo(() => {
    return {
      active: adminShops.filter((s) => s.state === "active"),
      pending: adminShops.filter((s) => s.state === "pending"),
      suspended: adminShops.filter((s) => s.state === "suspended"),
    }
  }, [])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">가맹 신청 대기</span>
            <span className="inline-flex h-6 items-center rounded-full bg-red-100 px-2.5 text-xs font-bold text-red-700">
              {groups.pending.length}건
            </span>
          </div>
          <button
            type="button"
            onClick={() => toast("정비소 직접 추가 (시연용)")}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white"
            style={{ backgroundColor: "#1E40AF" }}
          >
            <Plus className="h-4 w-4" />
            정비소 직접 추가
          </button>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as AdminShopRow["state"])}
          className="gap-4"
        >
          <TabsList className="h-10 w-fit bg-white shadow-sm ring-1 ring-gray-200">
            <TabsTrigger value="active" className="h-full px-5 text-sm">
              활성 ({groups.active.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="h-full px-5 text-sm">
              신청 대기 ({groups.pending.length})
            </TabsTrigger>
            <TabsTrigger value="suspended" className="h-full px-5 text-sm">
              정지·휴업 ({groups.suspended.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="grid gap-4 lg:grid-cols-2">
            {groups.active.map((s) => (
              <ActiveShopCard key={s.id} shop={s} />
            ))}
          </TabsContent>
          <TabsContent value="pending" className="grid gap-4 lg:grid-cols-2">
            {groups.pending.map((s) => (
              <PendingShopCard key={s.id} shop={s} />
            ))}
          </TabsContent>
          <TabsContent
            value="suspended"
            className="grid gap-4 lg:grid-cols-2"
          >
            {groups.suspended.length === 0 ? (
              <p className="rounded-xl bg-white p-8 text-center text-sm text-gray-500 ring-1 ring-gray-200">
                정지·휴업 정비소가 없습니다
              </p>
            ) : (
              groups.suspended.map((s) => (
                <ActiveShopCard key={s.id} shop={s} suspended />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ActiveShopCard({
  shop,
  suspended,
}: {
  shop: AdminShopRow
  suspended?: boolean
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-base font-bold text-gray-900">{shop.name}</p>
          <p className="text-xs text-gray-600">
            {shop.ownerName} 사장 · {shop.ownerPhone}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {shop.region}
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{
            backgroundColor: suspended ? "#FEE2E2" : "#DCFCE7",
            color: suspended ? "#B91C1C" : "#15803D",
          }}
        >
          {suspended ? "정지" : "활성"}
        </span>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-sm">
        <Stat label="이번 달 매출" value={formatKRW(shop.monthGmv)} />
        <Stat label="누적 주문" value={`${shop.totalOrders}건`} />
        <Stat
          label="평균 평점"
          value={
            shop.averageRating > 0 ? `⭐ ${shop.averageRating}` : "-"
          }
        />
        <Stat
          label="수락률"
          value={shop.acceptanceRate > 0 ? `${shop.acceptanceRate}%` : "-"}
        />
      </dl>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toast(`${shop.name} 상세 (시연용)`)}
          className="h-10 flex-1 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          상세
        </button>
        <button
          type="button"
          onClick={() => toast(`${shop.name} 수수료 조정 (시연용)`)}
          className="h-10 flex-1 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          수수료 조정
        </button>
        <button
          type="button"
          onClick={() => toast(`${shop.name} 정지 (시연용)`)}
          className="h-10 flex-1 rounded-lg border border-red-300 bg-white text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          {suspended ? "활성화" : "정지"}
        </button>
      </div>
    </motion.article>
  )
}

function PendingShopCard({ shop }: { shop: AdminShopRow }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-orange-200 bg-orange-50/40 p-5"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-base font-bold text-gray-900">{shop.name}</p>
          <p className="text-xs text-gray-700">
            {shop.ownerName} · {shop.ownerPhone}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {shop.region}
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800"
        >
          신청 {shop.appliedAt}
        </span>
      </div>

      <ul className="mb-4 flex flex-col gap-2 text-xs">
        <DocItem
          label="사업자등록증"
          ok={shop.pendingDocs?.businessLicense ?? false}
        />
        <DocItem
          label="정비기능사 자격증"
          ok={shop.pendingDocs?.mechanicLicense ?? false}
        />
      </ul>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toast.success(`${shop.name} 승인됨`)}
          className="h-10 flex-1 rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: "#15803D" }}
        >
          승인
        </button>
        <button
          type="button"
          onClick={() => toast(`${shop.name} 추가 정보 요청됨`)}
          className="h-10 flex-1 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          추가 정보 요청
        </button>
        <button
          type="button"
          onClick={() => toast.error(`${shop.name} 반려됨`)}
          className="h-10 flex-1 rounded-lg border border-red-300 bg-white text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          반려
        </button>
      </div>
    </motion.article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-sm font-bold tabular-nums text-gray-900">{value}</p>
    </div>
  )
}

function DocItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? (
        <FileCheck className="h-4 w-4 text-green-600" />
      ) : (
        <FileX className="h-4 w-4 text-red-500" />
      )}
      <span className={ok ? "text-gray-700" : "text-red-700 font-semibold"}>
        {label} {ok ? "확인" : "미제출"}
      </span>
    </li>
  )
}
