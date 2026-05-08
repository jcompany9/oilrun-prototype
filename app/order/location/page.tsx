"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, MapPin, Search } from "lucide-react"
import { KakaoMap } from "@/components/order/KakaoMap"
import type {
  AddressSearchError,
  AddressSearchHit,
  AddressSearchResponse,
} from "@/app/api/kakao/search-address/route"
import type {
  ReverseGeocodeError,
  ReverseGeocodeResponse,
} from "@/app/api/kakao/reverse-geocode/route"

function LocationPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [address, setAddress] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [detail, setDetail] = useState("")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AddressSearchHit[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setShowResults(false)
      setSearchError(null)
      return
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      runSearch(query.trim())
    }, 250)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [query])

  const runSearch = async (q: string) => {
    setSearching(true)
    setSearchError(null)
    try {
      const res = await fetch(
        `/api/kakao/search-address?q=${encodeURIComponent(q)}`
      )
      const data = (await res.json()) as
        | AddressSearchResponse
        | AddressSearchError
      if (!data.ok) {
        setResults([])
        setSearchError(data.message)
      } else {
        setResults(data.results)
      }
      setShowResults(true)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "검색 실패")
      setResults([])
      setShowResults(true)
    } finally {
      setSearching(false)
    }
  }

  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setSearchError("이 기기에서는 현 위치를 사용할 수 없습니다")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        try {
          const res = await fetch(
            `/api/kakao/reverse-geocode?lat=${latitude}&lng=${longitude}`
          )
          const data = (await res.json()) as
            | ReverseGeocodeResponse
            | ReverseGeocodeError
          if (data.ok) {
            setAddress(data.address)
            setQuery("")
            setShowResults(false)
          } else {
            setSearchError(data.message)
          }
        } catch (err) {
          setSearchError(err instanceof Error ? err.message : "주소 조회 실패")
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        setSearchError(`위치 권한 오류: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  const selectResult = (hit: AddressSearchHit) => {
    setAddress(hit.label)
    setCoords({ lat: hit.lat, lng: hit.lng })
    setShowResults(false)
    setQuery("")
  }

  const onPickFromMap = async (next: { lat: number; lng: number }) => {
    setCoords(next)
    try {
      const res = await fetch(
        `/api/kakao/reverse-geocode?lat=${next.lat}&lng=${next.lng}`
      )
      const data = (await res.json()) as
        | ReverseGeocodeResponse
        | ReverseGeocodeError
      if (data.ok) setAddress(data.address)
    } catch {
      // 주소 조회 실패해도 좌표는 유지
    }
  }

  const onNext = () => {
    if (!address) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("location", address)
    if (detail.trim()) params.set("locationDetail", detail.trim())
    if (coords) {
      params.set("lat", String(coords.lat))
      params.set("lng", String(coords.lng))
    }
    router.push(`/order/time?${params.toString()}`)
  }

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

      <KakaoMap
        lat={coords?.lat}
        lng={coords?.lng}
        onPick={onPickFromMap}
        className="mb-5 h-64 w-full"
      />

      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="mb-5 flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 bg-white text-base font-semibold transition-colors hover:bg-blue-50 disabled:opacity-50"
        style={{ borderColor: "#1E40AF", color: "#1E40AF" }}
      >
        {locating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MapPin className="h-5 w-5" />
        )}
        {locating ? "위치 확인 중…" : "현 위치 사용하기"}
      </button>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도로명 주소나 장소 이름"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-10 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
          />
          {searching && (
            <Loader2 className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
        <button
          type="button"
          onClick={() => query.trim() && runSearch(query.trim())}
          disabled={!query.trim() || searching}
          className="flex h-12 items-center justify-center gap-1 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          <Search className="h-4 w-4" />
          검색
        </button>
      </div>

      <AnimatePresence>
        {searchError && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-900"
          >
            {searchError}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResults && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex flex-col gap-1 overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            {results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">
                검색 결과가 없어요
              </li>
            ) : (
              results.map((hit, i) => (
                <li key={`${hit.label}-${i}`}>
                  <button
                    type="button"
                    onClick={() => selectResult(hit)}
                    className="flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <span className="flex flex-col">
                      <span className="text-sm text-gray-900">{hit.label}</span>
                      {hit.detail && (
                        <span className="text-xs text-gray-500">
                          {hit.detail}
                        </span>
                      )}
                    </span>
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
