"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Copy, Pencil, Plus, Power, Search } from "lucide-react"
import {
  addOptions,
  menus,
  vehicleManufacturers,
  vehicleModelsByManufacturer,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const DELIVERY_RULES = [
  { range: "0–5km", price: 0 },
  { range: "5–10km", price: 10000 },
  { range: "10–15km", price: 15000 },
  { range: "15–20km", price: 20000 },
  { range: "20km+", price: 30000 },
]

export default function AdminMenuPage() {
  const [tab, setTab] = useState("menus")
  const [vehicleQuery, setVehicleQuery] = useState("")

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <Tabs value={tab} onValueChange={setTab} className="gap-4">
          <TabsList className="h-10 w-fit bg-white shadow-sm ring-1 ring-gray-200">
            <TabsTrigger value="menus" className="h-full px-5 text-sm">
              메뉴
            </TabsTrigger>
            <TabsTrigger value="options" className="h-full px-5 text-sm">
              추가 옵션
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="h-full px-5 text-sm">
              차종 마스터
            </TabsTrigger>
            <TabsTrigger value="delivery" className="h-full px-5 text-sm">
              출장비 정책
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menus" className="flex flex-col gap-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast("새 메뉴 추가 (시연용)")}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white"
                style={{ backgroundColor: "#1E40AF" }}
              >
                <Plus className="h-4 w-4" />새 메뉴 추가
              </button>
            </div>
            {menus.map((m) => (
              <motion.article
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {m.name}
                    </h3>
                    {m.recommended && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: "#F97316" }}
                      >
                        추천
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                      활성
                    </span>
                  </div>
                  <p className="text-xl font-bold tabular-nums text-gray-900">
                    {formatKRW(m.price)}
                  </p>
                </div>
                <p className="mb-1 text-sm text-gray-600">{m.description}</p>
                <p className="mb-4 text-xs text-gray-500">
                  적용 차종: 가솔린 세단·SUV (전 차종)
                </p>
                <div className="flex gap-2">
                  <ActionBtn
                    icon={<Pencil className="h-3.5 w-3.5" />}
                    label="편집"
                    onClick={() => toast(`${m.name} 편집 (시연용)`)}
                  />
                  <ActionBtn
                    icon={<Copy className="h-3.5 w-3.5" />}
                    label="복제"
                    onClick={() => toast(`${m.name} 복제됨`)}
                  />
                  <ActionBtn
                    icon={<Power className="h-3.5 w-3.5" />}
                    label="비활성화"
                    onClick={() => toast(`${m.name} 비활성화됨`)}
                    variant="warn"
                  />
                </div>
              </motion.article>
            ))}
          </TabsContent>

          <TabsContent value="options" className="flex flex-col gap-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast("새 옵션 추가 (시연용)")}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white"
                style={{ backgroundColor: "#1E40AF" }}
              >
                <Plus className="h-4 w-4" />새 옵션 추가
              </button>
            </div>
            {addOptions.map((o) => (
              <article
                key={o.id}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
              >
                <div>
                  <p className="text-base font-bold text-gray-900">{o.name}</p>
                  <p className="text-xs text-gray-500">활성</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold tabular-nums text-gray-900">
                    {formatKRW(o.price)}
                  </p>
                  <ActionBtn
                    icon={<Pencil className="h-3.5 w-3.5" />}
                    label="편집"
                    onClick={() => toast(`${o.name} 편집`)}
                  />
                </div>
              </article>
            ))}
          </TabsContent>

          <TabsContent value="vehicles" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  value={vehicleQuery}
                  onChange={(e) => setVehicleQuery(e.target.value)}
                  placeholder="모델 검색"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => toast("차종 추가 (시연용)")}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white"
                style={{ backgroundColor: "#1E40AF" }}
              >
                <Plus className="h-4 w-4" />차종 추가
              </button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {vehicleManufacturers.map((m) => {
                const models = vehicleModelsByManufacturer[m.id] ?? []
                const filtered = vehicleQuery
                  ? models.filter((mod) =>
                      mod.toLowerCase().includes(vehicleQuery.toLowerCase())
                    )
                  : models
                if (vehicleQuery && filtered.length === 0) return null
                return (
                  <article
                    key={m.id}
                    className="rounded-xl bg-white p-4 ring-1 ring-gray-200"
                  >
                    <p className="mb-2 text-sm font-bold text-gray-900">
                      {m.name}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        ({m.nameEn})
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {filtered.map((mod) => (
                        <span
                          key={mod}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="flex flex-col gap-3">
            <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">
                  거리별 출장비
                </h3>
                <button
                  type="button"
                  onClick={() => toast("출장비 정책 편집 (시연용)")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  편집
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500">
                    <th className="py-2">거리</th>
                    <th className="py-2 text-right">출장비</th>
                  </tr>
                </thead>
                <tbody>
                  {DELIVERY_RULES.map((r) => (
                    <tr key={r.range} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-sm text-gray-900">
                        {r.range}
                      </td>
                      <td className="py-2.5 text-right text-sm font-semibold tabular-nums text-gray-900">
                        {r.price === 0 ? "무료" : formatKRW(r.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ActionBtn({
  icon,
  label,
  onClick,
  variant,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: "warn"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1 rounded-lg border bg-white px-3 text-xs font-semibold transition-colors"
      style={{
        borderColor: variant === "warn" ? "#FECACA" : "#D1D5DB",
        color: variant === "warn" ? "#B91C1C" : "#374151",
      }}
    >
      {icon}
      {label}
    </button>
  )
}
