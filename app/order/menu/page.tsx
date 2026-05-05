"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Car, Check } from "lucide-react"
import {
  addOptions,
  menus,
  resolveVehicleFromParams,
  vehicles,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

function MenuPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicle = useMemo(
    () => resolveVehicleFromParams(searchParams) ?? vehicles[0],
    [searchParams]
  )
  const vehicleQuery = useMemo(() => {
    const params = new URLSearchParams()
    if (vehicle.id === "custom") {
      params.set("vehicleId", "custom")
      params.set("model", vehicle.model)
      params.set("year", String(vehicle.year))
      params.set("fuel", vehicle.fuel)
      params.set("oilSpec", vehicle.oilSpec)
      if (vehicle.plate) params.set("plate", vehicle.plate)
    } else {
      params.set("vehicleId", vehicle.id)
    }
    return params
  }, [vehicle])

  const [selectedMenu, setSelectedMenu] = useState<string>(menus[0].id)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    )
  }

  const total = useMemo(() => {
    const menuPrice = menus.find((m) => m.id === selectedMenu)?.price ?? 0
    const optsPrice = addOptions
      .filter((o) => selectedOptions.includes(o.id))
      .reduce((sum, o) => sum + o.price, 0)
    return menuPrice + optsPrice
  }, [selectedMenu, selectedOptions])

  const onNext = () => {
    const params = new URLSearchParams(vehicleQuery)
    params.set("menuId", selectedMenu)
    if (selectedOptions.length > 0) {
      params.set("options", selectedOptions.join(","))
    }
    router.push(`/order/location?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-1 flex-col pb-36"
    >
      <div className="px-6 pt-6">
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
          <Car
            className="h-5 w-5 shrink-0"
            style={{ color: "#1E40AF" }}
            strokeWidth={1.75}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {vehicle.model}
              <span className="ml-1 text-xs font-normal text-gray-500">
                · {vehicle.year}년 · {vehicle.fuel}
              </span>
            </p>
            <p className="truncate text-xs text-gray-500">
              {vehicle.plate ? `${vehicle.plate} · ` : ""}권장{" "}
              {vehicle.oilSpec}
            </p>
          </div>
        </div>

        <h1 className="mb-5 text-2xl font-bold text-gray-900">
          어떤 오일로 교환할까요?
        </h1>

        <div className="mb-8 flex flex-col gap-3">
          {menus.map((m) => {
            const selected = selectedMenu === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMenu(m.id)}
                className="relative w-full rounded-xl border-2 p-4 text-left transition-all"
                style={{
                  borderColor: selected ? "#1E40AF" : "#E5E7EB",
                  backgroundColor: selected ? "#F5F8FF" : "#FFFFFF",
                }}
              >
                {m.recommended && (
                  <span
                    className="absolute -top-2 left-3 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    추천
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-base font-bold text-gray-900">
                      {m.name}
                    </p>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {m.description}
                    </p>
                  </div>
                  <p className="shrink-0 text-xl font-bold text-gray-900">
                    {formatKRW(m.price)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <h2 className="mb-3 text-lg font-bold text-gray-900">
          추가로 필요한 게 있으신가요?
        </h2>
        <div className="flex flex-col gap-2">
          {addOptions.map((o) => {
            const checked = selectedOptions.includes(o.id)
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleOption(o.id)}
                aria-pressed={checked}
                className="flex w-full items-center justify-between rounded-xl border p-4 transition-all"
                style={{
                  borderColor: checked ? "#1E40AF" : "#E5E7EB",
                  backgroundColor: checked ? "#F5F8FF" : "#FFFFFF",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded border-2"
                    style={{
                      borderColor: checked ? "#1E40AF" : "#D1D5DB",
                      backgroundColor: checked ? "#1E40AF" : "#FFFFFF",
                    }}
                  >
                    {checked && (
                      <Check
                        className="h-3.5 w-3.5 text-white"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    {o.name}
                  </span>
                </div>
                <span className="text-base font-semibold text-gray-700">
                  + {formatKRW(o.price)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-gray-100 bg-white px-4 pt-3 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">합계</span>
          <span className="text-xl font-bold text-gray-900 tabular-nums">
            {formatKRW(total)}
          </span>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="h-12 w-full rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F97316" }}
        >
          다음
        </button>
      </div>
    </motion.div>
  )
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          불러오는 중…
        </div>
      }
    >
      <MenuPageInner />
    </Suspense>
  )
}
