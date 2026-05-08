"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Car, ChevronDown, Loader2, Search } from "lucide-react"
import {
  buildCustomVehicle,
  recommendOil,
  vehicleFuelOptions,
  vehicleManufacturers,
  vehicleModelsByManufacturer,
  vehicleYearOptions,
  type FuelType,
} from "@/lib/mock-data"
import { isValidPlate, normalizePlate } from "@/lib/utils"
import type { VehicleLookupResult } from "@/app/api/vehicle/lookup/route"

type Mode = "search" | "matched" | "manual"

interface MatchedVehicle {
  id?: string
  plate: string
  model: string
  year: number
  fuel: FuelType
  oilSpec: string
}

export default function VehiclePage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("search")
  const [plate, setPlate] = useState("")
  const [matched, setMatched] = useState<MatchedVehicle | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [manufacturerId, setManufacturerId] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState<number | "">("")
  const [fuel, setFuel] = useState<FuelType | "">("")

  const trimmedPlate = plate.trim()
  const plateValid = isValidPlate(trimmedPlate)

  const onConfirmPlate = async () => {
    if (!trimmedPlate || loading) return
    if (!plateValid) {
      setErrorMessage("차량번호 형식이 올바르지 않습니다 (예: 12가3456)")
      setNotFound(false)
      return
    }
    setErrorMessage(null)
    setNotFound(false)
    setLoading(true)
    try {
      const res = await fetch("/api/vehicle/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: normalizePlate(trimmedPlate) }),
      })
      const data = (await res.json()) as VehicleLookupResult
      if (data.found) {
        setMatched(data.vehicle)
        setMode("matched")
      } else if (data.reason === "not_found") {
        setNotFound(true)
        setMode("search")
      } else {
        setErrorMessage(data.message)
        setMode("search")
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "조회 중 오류가 발생했습니다"
      )
    } finally {
      setLoading(false)
    }
  }

  const onChangePlate = (value: string) => {
    setPlate(value)
    if (notFound) setNotFound(false)
    if (errorMessage) setErrorMessage(null)
    if (mode === "matched") setMode("search")
  }

  const startManual = () => {
    setMode("manual")
    setNotFound(false)
    setErrorMessage(null)
  }

  const backToSearch = () => {
    setMode("search")
    setManufacturerId("")
    setModel("")
    setYear("")
    setFuel("")
  }

  const resetMatched = () => {
    setMode("search")
    setPlate("")
    setMatched(null)
    setNotFound(false)
  }

  const modelOptions = useMemo(
    () => (manufacturerId ? vehicleModelsByManufacturer[manufacturerId] : []),
    [manufacturerId]
  )

  const customComplete = Boolean(manufacturerId && model && year && fuel)

  const customOilSpec =
    customComplete && model && fuel
      ? recommendOil(model, fuel as FuelType)
      : ""

  const goNextWithMatched = () => {
    if (!matched) return
    if (matched.id) {
      router.push(`/order/menu?vehicleId=${matched.id}`)
      return
    }
    const params = new URLSearchParams({
      vehicleId: "custom",
      model: matched.model,
      year: String(matched.year),
      fuel: matched.fuel,
      oilSpec: matched.oilSpec,
      plate: matched.plate,
    })
    router.push(`/order/menu?${params.toString()}`)
  }

  const goNextWithCustom = () => {
    if (!customComplete) return
    const vehicle = buildCustomVehicle({
      model,
      year: Number(year),
      fuel: fuel as FuelType,
      plate: trimmedPlate,
    })
    const params = new URLSearchParams({
      vehicleId: "custom",
      model: vehicle.model,
      year: String(vehicle.year),
      fuel: vehicle.fuel,
      oilSpec: vehicle.oilSpec,
    })
    if (vehicle.plate) params.set("plate", vehicle.plate)
    router.push(`/order/menu?${params.toString()}`)
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-8 pb-12">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        차량번호를 입력해주세요
      </h1>
      <p className="mb-8 text-sm text-gray-600">
        내 차에 맞는 오일을 찾아드려요
      </p>

      <input
        value={plate}
        onChange={(e) => onChangePlate(e.target.value)}
        placeholder="12가3456"
        disabled={mode === "matched" || mode === "manual" || loading}
        inputMode="text"
        onKeyDown={(e) => {
          if (e.key === "Enter" && plateValid && !loading) {
            onConfirmPlate()
          }
        }}
        className="mb-3 h-16 w-full rounded-xl border-2 border-gray-200 bg-white px-4 text-center text-2xl font-bold tracking-wide text-gray-900 placeholder:font-medium placeholder:text-gray-300 focus:border-blue-800 focus:outline-none disabled:bg-gray-50 disabled:text-gray-700"
      />

      {mode === "search" && !notFound && !errorMessage && (
        <button
          type="button"
          onClick={onConfirmPlate}
          disabled={!plateValid || loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "#1E40AF" }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              조회 중…
            </>
          ) : (
            "확인"
          )}
        </button>
      )}

      <AnimatePresence>
        {errorMessage && mode === "search" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl bg-red-50 p-4 text-sm text-red-900"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notFound && mode === "search" && (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl bg-amber-50 p-4"
          >
            <p className="mb-3 text-sm leading-relaxed text-amber-900">
              등록된 차량 정보가 없어요.
              <br />
              직접 입력해주시면 곧바로 시작할 수 있어요
            </p>
            <button
              type="button"
              onClick={startManual}
              className="h-12 w-full rounded-xl text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#F97316" }}
            >
              직접 입력하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mode === "matched" && matched && (
          <motion.div
            key="matched"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="rounded-xl bg-gray-50 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <Car
                    className="h-6 w-6"
                    style={{ color: "#1E40AF" }}
                    strokeWidth={1.75}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-gray-900">
                    {matched.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    {matched.year}년 · {matched.fuel}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500">권장 오일</p>
                <p className="text-base font-semibold text-gray-900">
                  {matched.oilSpec}
                </p>
              </div>
            </div>

            <p className="mt-6 mb-3 text-center text-base font-medium text-gray-900">
              맞으신가요?
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={goNextWithMatched}
                className="h-12 w-full rounded-xl text-base font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#F97316" }}
              >
                네, 맞아요
              </button>
              <button
                type="button"
                onClick={resetMatched}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                아니요, 다시
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mode === "manual" && (
          <motion.section
            key="manual"
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mb-5 rounded-xl bg-blue-50 p-3 text-center text-sm text-blue-900">
              차량 정보를 직접 입력해주세요
            </div>

            <div className="flex flex-col gap-4">
              <ManualField label="제조사">
                <SelectField
                  value={manufacturerId}
                  onChange={(v) => {
                    setManufacturerId(v)
                    setModel("")
                  }}
                  placeholder="제조사를 선택하세요"
                >
                  {vehicleManufacturers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.nameEn})
                    </option>
                  ))}
                </SelectField>
              </ManualField>

              <ManualField label="모델" disabled={!manufacturerId}>
                <SelectField
                  value={model}
                  onChange={setModel}
                  disabled={!manufacturerId}
                  placeholder={
                    manufacturerId
                      ? "모델을 선택하세요"
                      : "먼저 제조사를 선택해주세요"
                  }
                >
                  {modelOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </SelectField>
              </ManualField>

              <ManualField label="연식" disabled={!model}>
                <SelectField
                  value={year ? String(year) : ""}
                  onChange={(v) => setYear(v ? Number(v) : "")}
                  disabled={!model}
                  placeholder="연식을 선택하세요"
                >
                  {vehicleYearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </SelectField>
              </ManualField>

              <ManualField label="연료타입" disabled={!year}>
                <SelectField
                  value={fuel}
                  onChange={(v) => setFuel(v as FuelType)}
                  disabled={!year}
                  placeholder="연료타입을 선택하세요"
                >
                  {vehicleFuelOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </SelectField>
              </ManualField>
            </div>

            <button
              type="button"
              onClick={backToSearch}
              className="mt-5 inline-flex h-10 items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <Search className="h-4 w-4" />
              차량번호로 다시 검색하기
            </button>

            <AnimatePresence>
              {customComplete && (
                <motion.div
                  key="custom-summary"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mt-6"
                >
                  <div className="rounded-xl bg-gray-50 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                        <Car
                          className="h-6 w-6"
                          style={{ color: "#1E40AF" }}
                          strokeWidth={1.75}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl font-bold text-gray-900">
                          {model}
                        </p>
                        <p className="text-sm text-gray-600">
                          {year}년 · {fuel}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-500">권장 오일</p>
                      <p className="text-base font-semibold text-gray-900">
                        {customOilSpec}
                      </p>
                      {customOilSpec === "오일교환 불필요" && (
                        <p className="mt-1 text-xs text-gray-500">
                          전기차는 엔진오일이 없어요
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-6 mb-3 text-center text-base font-medium text-gray-900">
                    맞으신가요?
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={goNextWithCustom}
                      disabled={customOilSpec === "오일교환 불필요"}
                      className="h-12 w-full rounded-xl text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                      style={{ backgroundColor: "#F97316" }}
                    >
                      네, 맞아요
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManufacturerId("")
                        setModel("")
                        setYear("")
                        setFuel("")
                      }}
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      수정하기
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

function ManualField({
  label,
  disabled,
  children,
}: {
  label: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className={`text-sm font-semibold ${disabled ? "text-gray-400" : "text-gray-800"}`}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

function SelectField({
  value,
  onChange,
  children,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  placeholder: string
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-14 w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 pr-10 text-base font-medium text-gray-900 focus:border-blue-800 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 ${disabled ? "text-gray-300" : "text-gray-500"}`}
      />
    </div>
  )
}
