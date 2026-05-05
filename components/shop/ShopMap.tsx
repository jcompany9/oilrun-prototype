"use client"

import { useEffect, useMemo } from "react"
import L from "leaflet"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import type { ShopOrder } from "@/lib/mock-data"
import { shopInfo } from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"
import {
  COMPLETED_ICON,
  HOME_ICON,
  IN_PROGRESS_ICON,
  NEW_ORDER_ICON,
  SCHEDULED_ICON,
} from "./MapPin"

interface ShopMapProps {
  newOrders: ShopOrder[]
  todayOrders: ShopOrder[]
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
  onSelectOrder: (id: string) => void
}

function iconForStatus(status: ShopOrder["status"]) {
  switch (status) {
    case "in_progress":
      return IN_PROGRESS_ICON
    case "completed":
      return COMPLETED_ICON
    case "new":
      return NEW_ORDER_ICON
    default:
      return SCHEDULED_ICON
  }
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length < 2) return
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 14 })
  }, [points, map])
  return null
}

export default function ShopMap({
  newOrders,
  todayOrders,
  onAccept,
  onDismiss,
  onSelectOrder,
}: ShopMapProps) {
  const home = shopInfo.homeLocation

  const allPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [[home.lat, home.lng]]
    newOrders.forEach((o) => pts.push([o.location.lat, o.location.lng]))
    todayOrders.forEach((o) => pts.push([o.location.lat, o.location.lng]))
    return pts
  }, [home, newOrders, todayOrders])

  const stats = useMemo(() => {
    const inProgress = todayOrders.filter((o) => o.status === "in_progress").length
    const scheduled = todayOrders.filter(
      (o) =>
        o.status === "scheduled" ||
        o.status === "departed" ||
        o.status === "arrived"
    ).length
    return { total: todayOrders.length, inProgress, scheduled }
  }, [todayOrders])

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[home.lat, home.lng]}
        zoom={12}
        minZoom={10}
        maxZoom={18}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={allPoints} />

        <Marker position={[home.lat, home.lng]} icon={HOME_ICON}>
          <Popup>
            <div className="font-semibold text-gray-900">{shopInfo.name}</div>
            <div className="text-xs text-gray-500">내 정비소</div>
          </Popup>
        </Marker>

        {newOrders.map((o) => (
          <Marker
            key={o.id}
            position={[o.location.lat, o.location.lng]}
            icon={NEW_ORDER_ICON}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="mb-1 text-xs font-bold text-red-600">새 주문</p>
                <p className="mb-1 text-sm font-semibold text-gray-900">
                  {String(o.scheduledAt.getHours()).padStart(2, "0")}:
                  {String(o.scheduledAt.getMinutes()).padStart(2, "0")} ·{" "}
                  {o.address.replace(/^서울시\s*/, "")}
                </p>
                <p className="mb-1 text-xs text-gray-600">
                  {o.vehicleModel} / {o.menuOilSpec}
                </p>
                <p className="mb-2 text-xs text-gray-600">
                  📏 {o.distance}km ·{" "}
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {formatKRW(o.total)}
                  </span>
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAccept(o.id)}
                    className="flex-1 rounded-md px-2 py-1.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    수락
                  </button>
                  <button
                    type="button"
                    onClick={() => onDismiss(o.id)}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700"
                  >
                    무시
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {todayOrders.map((o) => (
          <Marker
            key={o.id}
            position={[o.location.lat, o.location.lng]}
            icon={iconForStatus(o.status)}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="mb-1 text-sm font-semibold text-gray-900">
                  {String(o.scheduledAt.getHours()).padStart(2, "0")}:
                  {String(o.scheduledAt.getMinutes()).padStart(2, "0")} ·{" "}
                  {o.customerName}
                </p>
                <p className="mb-1 text-xs text-gray-600">
                  {o.vehicleModel} ({o.vehiclePlate})
                </p>
                <p className="mb-2 text-xs text-gray-600">{o.address}</p>
                <button
                  type="button"
                  onClick={() => onSelectOrder(o.id)}
                  className="w-full rounded-md bg-gray-900 px-2 py-1.5 text-xs font-semibold text-white"
                >
                  상세 보기
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 rounded-lg bg-white/95 p-3 text-[11px] shadow-md backdrop-blur">
        <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          범례
        </div>
        <LegendRow color="#15803D" label="내 정비소" />
        <LegendRow color="#DC2626" label="새 주문" pulse />
        <LegendRow color="#1E40AF" label="오늘 일정" />
        <LegendRow color="#F97316" label="진행 중" blink />
      </div>

      <div className="pointer-events-none absolute right-3 bottom-6 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-[11px] shadow-md backdrop-blur">
        <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          오늘 통계
        </div>
        <div className="font-semibold text-gray-900">
          오늘 {stats.total}건 · 진행 {stats.inProgress}건 · 예정{" "}
          {stats.scheduled}건
        </div>
      </div>
    </div>
  )
}

function LegendRow({
  color,
  label,
  pulse,
  blink,
}: {
  color: string
  label: string
  pulse?: boolean
  blink?: boolean
}) {
  const animClass = pulse
    ? "shop-pin-new"
    : blink
      ? "shop-pin-in-progress"
      : ""
  return (
    <div className="flex items-center gap-2">
      <span
        className={`block h-3 w-3 rounded-full border border-white ${animClass}`}
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-700">{label}</span>
    </div>
  )
}
