"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { MapPin, Search } from "lucide-react"

const MOCK_CURRENT_ADDRESS = "서울시 강남구 역삼동 123-45"

const MOCK_SEARCH_RESULTS = [
  "서울시 강남구 역삼동 123-45",
  "서울시 강남구 삼성동 88-2",
  "서울시 강남구 청담동 45-1",
  "서울시 서초구 반포동 67-8",
  "서울시 송파구 잠실동 200-12",
]

function LocationPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [address, setAddress] = useState("")
  const [detail, setDetail] = useState("")
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)

  const useCurrentLocation = () => {
    setAddress(MOCK_CURRENT_ADDRESS)
    setQuery("")
    setShowResults(false)
  }

  const onSearch = () => {
    if (!query.trim()) return
    setShowResults(true)
  }

  const selectResult = (a: string) => {
    setAddress(a)
    setShowResults(false)
    setQuery("")
  }

  const onNext = () => {
    if (!address) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("location", address)
    if (detail.trim()) params.set("locationDetail", detail.trim())
    router.push(`/order/time?${params.toString()}`)
  }

  const filteredResults = query.trim()
    ? MOCK_SEARCH_RESULTS.filter((a) => a.includes(query.trim()))
    : MOCK_SEARCH_RESULTS

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-1 flex-col px-6 pt-8 pb-36"
    >
      <h1 className="mb-2 text-2xl font-bold text-gray-900">어디로 갈까요?</h1>
      <p className="mb-6 text-sm text-gray-600">
        정비사가 방문할 위치를 알려주세요
      </p>

      <div
        className="relative mb-5 flex h-64 items-center justify-center overflow-hidden rounded-xl bg-gray-100"
        style={{
          backgroundImage:
            "linear-gradient(to right, #E5E7EB 1px, transparent 1px), linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <MapPin
              className="h-7 w-7"
              style={{ color: "#1E40AF" }}
              strokeWidth={2}
              fill="#DBEAFE"
            />
          </div>
          <p className="text-sm font-medium text-gray-500">
            지도 영역 (카카오맵 연동 예정)
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        className="mb-5 flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 bg-white text-base font-semibold transition-colors hover:bg-blue-50"
        style={{ borderColor: "#1E40AF", color: "#1E40AF" }}
      >
        <MapPin className="h-5 w-5" />현 위치 사용하기
      </button>

      <div className="mb-3 flex items-center gap-2">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                onSearch()
              }
            }}
            placeholder="도로명 주소를 입력하세요"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onSearch}
          disabled={!query.trim()}
          className="flex h-12 items-center justify-center gap-1 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          <Search className="h-4 w-4" />
          검색
        </button>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex flex-col gap-1 overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            {filteredResults.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">
                검색 결과가 없어요
              </li>
            ) : (
              filteredResults.map((a) => (
                <li key={a}>
                  <button
                    type="button"
                    onClick={() => selectResult(a)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-800 transition-colors hover:bg-gray-50"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                    {a}
                  </button>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {address && (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl bg-gray-50 p-4"
          >
            <div className="mb-3 flex items-start gap-2">
              <MapPin
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: "#1E40AF" }}
              />
              <p className="text-base font-semibold text-gray-900">{address}</p>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-500">
                상세 위치 (선택)
              </span>
              <input
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="지하 주차장 B2 23번 자리"
                className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-gray-100 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onNext}
          disabled={!address}
          className="h-12 w-full rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: "#F97316" }}
        >
          다음
        </button>
      </div>
    </motion.div>
  )
}

export default function LocationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          불러오는 중…
        </div>
      }
    >
      <LocationPageInner />
    </Suspense>
  )
}
