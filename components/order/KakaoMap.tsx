"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

const SDK_BASE = "https://dapi.kakao.com/v2/maps/sdk.js"
const SCRIPT_ID = "kakao-maps-sdk"

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 }

let sdkLoadPromise: Promise<void> | null = null

function loadSdk(jsKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"))
  if (window.kakao?.maps) return Promise.resolve()
  if (sdkLoadPromise) return sdkLoadPromise

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    const onReady = () => {
      window.kakao?.maps.load(() => resolve())
    }
    if (existing) {
      existing.addEventListener("load", onReady, { once: true })
      existing.addEventListener("error", () => reject(new Error("sdk_load_failed")), { once: true })
      return
    }
    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.async = true
    script.src = `${SDK_BASE}?appkey=${jsKey}&autoload=false&libraries=services`
    script.addEventListener("load", onReady, { once: true })
    script.addEventListener("error", () => reject(new Error("sdk_load_failed")), { once: true })
    document.head.appendChild(script)
  })
  return sdkLoadPromise
}

export interface KakaoMapProps {
  lat?: number
  lng?: number
  onPick?: (coords: { lat: number; lng: number }) => void
  className?: string
}

export function KakaoMap({ lat, lng, onPick, className }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<KakaoMap | null>(null)
  const markerRef = useRef<KakaoMarker | null>(null)
  const onPickRef = useRef(onPick)
  const [status, setStatus] = useState<"loading" | "ready" | "no-key" | "error">(
    "loading"
  )

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  useEffect(() => {
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
    if (!jsKey) {
      setStatus("no-key")
      return
    }
    let cancelled = false
    loadSdk(jsKey)
      .then(() => {
        if (cancelled || !containerRef.current || !window.kakao) return
        const center = new window.kakao.maps.LatLng(
          lat ?? SEOUL_CENTER.lat,
          lng ?? SEOUL_CENTER.lng
        )
        const map = new window.kakao.maps.Map(containerRef.current, {
          center,
          level: 4,
        })
        const marker = new window.kakao.maps.Marker({
          position: center,
          map,
          draggable: true,
        })
        mapRef.current = map
        markerRef.current = marker

        window.kakao.maps.event.addListener(map, "click", (e) => {
          if (!e?.latLng || !markerRef.current) return
          markerRef.current.setPosition(e.latLng)
          onPickRef.current?.({
            lat: e.latLng.getLat(),
            lng: e.latLng.getLng(),
          })
        })
        window.kakao.maps.event.addListener(marker, "dragend", () => {
          if (!markerRef.current) return
          const pos = markerRef.current.getPosition()
          onPickRef.current?.({ lat: pos.getLat(), lng: pos.getLng() })
        })
        setStatus("ready")
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (status !== "ready" || !window.kakao || !mapRef.current || !markerRef.current) return
    if (lat === undefined || lng === undefined) return
    const next = new window.kakao.maps.LatLng(lat, lng)
    mapRef.current.panTo(next)
    markerRef.current.setPosition(next)
  }, [lat, lng, status])

  if (status === "no-key" || status === "error") {
    return <PlaceholderMap className={className} note={status === "error" ? "지도 로드 실패" : undefined} />
  }

  return (
    <div className={className} style={{ position: "relative" }}>
      <div ref={containerRef} className="h-full w-full rounded-xl" />
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 text-sm text-gray-500">
          지도 불러오는 중…
        </div>
      )}
    </div>
  )
}

function PlaceholderMap({ className, note }: { className?: string; note?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 ${className ?? ""}`}
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
          {note ?? "지도 영역 (카카오맵 키 미설정)"}
        </p>
      </div>
    </div>
  )
}
