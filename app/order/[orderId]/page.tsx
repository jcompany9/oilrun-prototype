"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  ListChecks,
  MapPin,
  Phone,
  Star,
  Truck,
  Wrench,
} from "lucide-react"
import {
  addOptions,
  getAccessOption,
  mechanics,
  menus,
  resolveVehicleFromParams,
  vehicles,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

const SHOW_DEMO_PANEL = true

type DemoStatus =
  | "assigned"
  | "dispatched"
  | "arrived"
  | "working"
  | "completed"

const STATUS_OPTIONS: { value: DemoStatus; label: string }[] = [
  { value: "assigned", label: "배정완료" },
  { value: "dispatched", label: "출발" },
  { value: "arrived", label: "도착" },
  { value: "working", label: "작업중" },
  { value: "completed", label: "완료" },
]

const PAYMENT_LABEL: Record<string, string> = {
  toss: "토스페이",
  kakao: "카카오페이",
  card: "카드",
}

interface TimelineItem {
  label: string
  detail: string
}

const TIMELINE_ITEMS: TimelineItem[] = [
  { label: "결제 완료", detail: "오후 2:15" },
  { label: "정비소 배정 완료", detail: "오후 2:18" },
  { label: "정비사 출발", detail: "곧 출발해요" },
  { label: "정비사 도착", detail: "예정: 오후 4:30" },
  { label: "작업 진행", detail: "" },
  { label: "작업 완료", detail: "" },
]

function statusToTimelineIdx(status: DemoStatus): number {
  switch (status) {
    case "assigned":
      return 2
    case "dispatched":
      return 3
    case "arrived":
      return 3
    case "working":
      return 4
    case "completed":
      return 6
  }
}

function OrderDetailPageInner() {
  const params = useParams<{ orderId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderId = params.orderId

  const vehicle = useMemo(
    () => resolveVehicleFromParams(searchParams) ?? vehicles[0],
    [searchParams]
  )
  const menu = useMemo(() => {
    const id = searchParams.get("menuId")
    return menus.find((m) => m.id === id) ?? menus[0]
  }, [searchParams])
  const selectedOptions = useMemo(() => {
    const raw = searchParams.get("options")
    if (!raw) return []
    const ids = raw.split(",")
    return addOptions.filter((o) => ids.includes(o.id))
  }, [searchParams])
  const location = searchParams.get("location") ?? ""
  const locationDetail = searchParams.get("locationDetail") ?? ""
  const paymentMethod = searchParams.get("paymentMethod") ?? "toss"
  const accessOption = getAccessOption(searchParams.get("access"))
  const accessNote = searchParams.get("accessNote") ?? ""
  const totalAmount =
    menu.price + selectedOptions.reduce((s, o) => s + o.price, 0) + 10000

  const mechanic = mechanics[0]

  const [status, setStatus] = useState<DemoStatus>("assigned")
  const [showOrderInfo, setShowOrderInfo] = useState(false)
  const [rating, setRating] = useState(0)

  const currentIdx = statusToTimelineIdx(status)

  const callMechanic = () => {
    alert(`전화 걸기 (시연용)\n${mechanic.name} ${mechanic.phone}`)
  }
  const cancelOrder = () => {
    if (confirm("정말 취소하시겠어요?")) {
      alert("주문이 취소되었습니다 (시연용)")
    }
  }
  const contactSupport = () => {
    alert("고객센터 1588-0000 (시연용)")
  }
  const finalize = () => {
    alert(
      rating > 0
        ? `${rating}점 평가가 완료되었습니다. 감사합니다!`
        : "확인되었습니다."
    )
    router.push("/")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 pt-5 pb-12">
      {SHOW_DEMO_PANEL && (
        <DemoPanel status={status} onChange={setStatus} />
      )}

      <StatusCard
        status={status}
        vehicleModel={vehicle.model}
        vehiclePlate={vehicle.plate}
        rating={rating}
        onRate={setRating}
        onFinalize={finalize}
      />

      <MechanicCard mechanic={mechanic} onCall={callMechanic} />

      <Timeline currentIdx={currentIdx} status={status} />

      <MapPlaceholder status={status} />

      <CollapsibleOrderInfo
        open={showOrderInfo}
        onToggle={() => setShowOrderInfo((v) => !v)}
        orderId={orderId}
        vehicle={`${vehicle.model}${vehicle.plate ? ` (${vehicle.plate})` : ""}`}
        menuName={menu.name}
        optionNames={selectedOptions.map((o) => o.name)}
        location={location + (locationDetail ? ` (${locationDetail})` : "")}
        amount={totalAmount}
        paymentMethod={PAYMENT_LABEL[paymentMethod] ?? paymentMethod}
        accessLabel={
          accessOption
            ? `${accessOption.emoji} ${accessOption.title}${accessNote ? ` · ${accessNote}` : ""}`
            : null
        }
      />

      <div className="mt-2 flex flex-col gap-2">
        <Link
          href="/order/history"
          className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ListChecks className="h-4 w-4" />내 예약내역
        </Link>
        <button
          type="button"
          onClick={cancelOrder}
          className="h-12 w-full rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          주문 취소
        </button>
        <button
          type="button"
          onClick={contactSupport}
          className="h-12 w-full rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          고객센터 문의
        </button>
      </div>
    </div>
  )
}

function DemoPanel({
  status,
  onChange,
}: {
  status: DemoStatus
  onChange: (s: DemoStatus) => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        시연용
      </span>
      <span className="text-xs text-gray-600">상태:</span>
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as DemoStatus)}
        className="ml-auto h-7 rounded border border-gray-200 bg-white px-2 text-xs font-medium text-gray-800 focus:outline-none"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function StatusCard({
  status,
  vehicleModel,
  vehiclePlate,
  rating,
  onRate,
  onFinalize,
}: {
  status: DemoStatus
  vehicleModel: string
  vehiclePlate: string
  rating: number
  onRate: (n: number) => void
  onFinalize: () => void
}) {
  const isCompleted = status === "completed"
  const bg = isCompleted ? "#15803D" : "#1E40AF"

  return (
    <motion.section
      key={status}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl px-5 py-6 text-white"
      style={{ backgroundColor: bg }}
    >
      <AnimatePresence mode="wait">
        {status === "assigned" && (
          <StatusBlock key="assigned" icon={<Check className="h-7 w-7" strokeWidth={3} />}>
            <h2 className="text-2xl font-bold">배정 완료!</h2>
            <p className="mt-1 text-sm text-blue-100">
              16:30 도착 예정
            </p>
          </StatusBlock>
        )}
        {status === "dispatched" && (
          <StatusBlock
            key="dispatched"
            icon={<Truck className="h-7 w-7" strokeWidth={2} />}
          >
            <h2 className="text-2xl font-bold">정비사가 출발했어요</h2>
            <p className="mt-1 text-sm text-blue-100">
              16:30 도착 예정 · 잠시만 기다려주세요
            </p>
            <RouteProgress />
          </StatusBlock>
        )}
        {status === "arrived" && (
          <StatusBlock
            key="arrived"
            icon={<MapPin className="h-7 w-7" strokeWidth={2} />}
          >
            <h2 className="text-2xl font-bold">정비사가 도착했어요</h2>
            <p className="mt-1 text-sm text-blue-100">
              차량 확인 후 작업을 시작합니다
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
              <Car className="h-4 w-4" />
              {vehicleModel}
              {vehiclePlate && ` · ${vehiclePlate}`}
            </div>
          </StatusBlock>
        )}
        {status === "working" && (
          <StatusBlock
            key="working"
            icon={
              <motion.div
                animate={{ rotate: [0, 12, -12, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <Wrench className="h-7 w-7" strokeWidth={2} />
              </motion.div>
            }
          >
            <h2 className="text-2xl font-bold">작업 진행 중이에요</h2>
            <p className="mt-1 text-sm text-blue-100">
              평균 20–30분 정도 걸려요
            </p>
            <div className="mt-4 flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/5 text-xs text-blue-100">
              <Camera className="mr-2 h-4 w-4" />
              작업 사진 (실시간 공유 예정)
            </div>
          </StatusBlock>
        )}
        {status === "completed" && (
          <StatusBlock
            key="completed"
            icon={<Check className="h-7 w-7" strokeWidth={3} />}
          >
            <h2 className="text-2xl font-bold">작업이 완료되었어요</h2>
            <p className="mt-1 text-sm text-green-100">
              이용해주셔서 감사합니다
            </p>
            <div className="mt-4 rounded-xl bg-white/15 p-3">
              <p className="mb-2 text-xs text-green-50">
                정비사 평가 (선택)
              </p>
              <div className="mb-3 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onRate(n)}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star
                      className="h-7 w-7"
                      strokeWidth={1.5}
                      fill={n <= rating ? "#FACC15" : "transparent"}
                      stroke={n <= rating ? "#FACC15" : "#FFFFFF"}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onFinalize}
                className="h-11 w-full rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#FFFFFF", color: "#15803D" }}
              >
                확인 완료
              </button>
            </div>
          </StatusBlock>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function StatusBlock({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-start"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
        {icon}
      </div>
      {children}
    </motion.div>
  )
}

function RouteProgress() {
  return (
    <div className="mt-4 w-full">
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20">
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          initial={{ width: "10%" }}
          animate={{ width: ["10%", "60%", "85%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-blue-100">
        <span>정비소 출발</span>
        <span>고객 위치 도착</span>
      </div>
    </div>
  )
}

function MechanicCard({
  mechanic,
  onCall,
}: {
  mechanic: { name: string; phone: string; rating: number }
  onCall: () => void
}) {
  const initial = mechanic.name.charAt(0)
  return (
    <section className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-gray-200">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold"
        style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-gray-900">
          {mechanic.name} 정비사
        </p>
        <p className="mt-0.5 text-xs text-gray-600">
          <Star
            className="mr-0.5 inline h-3 w-3 align-[-2px] text-yellow-400"
            fill="#FACC15"
          />
          {mechanic.rating} (123건) · 정비 경력 12년
        </p>
      </div>
      <button
        type="button"
        onClick={onCall}
        aria-label="정비사에게 전화"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#FFEDD5", color: "#F97316" }}
      >
        <Phone className="h-5 w-5" strokeWidth={2} fill="#F97316" />
      </button>
    </section>
  )
}

function Timeline({
  currentIdx,
  status,
}: {
  currentIdx: number
  status: DemoStatus
}) {
  return (
    <section className="rounded-xl bg-white p-5 ring-1 ring-gray-200">
      <h3 className="mb-4 text-sm font-bold text-gray-900">진행 상황</h3>
      <ol className="flex flex-col">
        {TIMELINE_ITEMS.map((item, i) => {
          const done = i < currentIdx
          const current = i === currentIdx
          const isLast = i === TIMELINE_ITEMS.length - 1
          return (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                    done
                      ? "bg-blue-700"
                      : current
                        ? "bg-blue-100 ring-4 ring-blue-100"
                        : "bg-gray-100"
                  }`}
                >
                  {done && (
                    <Check
                      className="h-3.5 w-3.5 text-white"
                      strokeWidth={3}
                    />
                  )}
                  {current && (
                    <motion.span
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-blue-700"
                    />
                  )}
                  {!done && !current && (
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  )}
                </span>
                {!isLast && (
                  <span
                    className={`my-1 w-0.5 flex-1 ${
                      i < currentIdx - 1 ? "bg-blue-700" : "bg-gray-200"
                    }`}
                    style={{ minHeight: 16 }}
                  />
                )}
              </div>
              <div className="flex-1 pb-5">
                <p
                  className={`text-sm font-semibold ${
                    current
                      ? "text-blue-900"
                      : done
                        ? "text-gray-900"
                        : "text-gray-400"
                  }`}
                >
                  {item.label}
                </p>
                {(current || done) && item.detail && (
                  <p className="mt-0.5 text-xs text-gray-500">{item.detail}</p>
                )}
                {current && i === 2 && status === "assigned" && (
                  <p className="mt-0.5 text-xs text-blue-700">곧 출발해요</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function MapPlaceholder({ status }: { status: DemoStatus }) {
  return (
    <section
      className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gray-100"
      style={{
        backgroundImage:
          "linear-gradient(to right, #E5E7EB 1px, transparent 1px), linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-between px-8">
        <motion.div
          animate={
            status === "dispatched"
              ? { x: [0, 60, 0] }
              : { x: 0 }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
        >
          <Truck
            className="h-5 w-5"
            style={{ color: "#1E40AF" }}
            strokeWidth={2}
          />
        </motion.div>
        <svg
          className="absolute left-12 right-12 top-1/2 h-2 -translate-y-1/2"
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="2"
            x2="100"
            y2="2"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
        </svg>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
          <MapPin
            className="h-5 w-5"
            style={{ color: "#F97316" }}
            strokeWidth={2}
            fill="#FED7AA"
          />
        </div>
      </div>
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-gray-600 shadow-sm">
        정비사 위치 (실시간 추적 예정)
      </p>
    </section>
  )
}

function CollapsibleOrderInfo({
  open,
  onToggle,
  orderId,
  vehicle,
  menuName,
  optionNames,
  location,
  amount,
  paymentMethod,
  accessLabel,
}: {
  open: boolean
  onToggle: () => void
  orderId: string
  vehicle: string
  menuName: string
  optionNames: string[]
  location: string
  amount: number
  paymentMethod: string
  accessLabel: string | null
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-12 w-full items-center justify-between px-4 text-sm font-semibold text-gray-900"
      >
        주문 정보 보기
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.dl
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-t border-gray-100 px-4 py-3 text-xs">
              <InfoRow label="주문번호" value={orderId} mono />
              <InfoRow label="차량" value={vehicle} />
              <InfoRow label="작업" value={menuName} />
              {optionNames.length > 0 && (
                <InfoRow label="추가 옵션" value={optionNames.join(", ")} />
              )}
              <InfoRow label="위치" value={location || "-"} />
              {accessLabel && <InfoRow label="차량 접근" value={accessLabel} />}
              <InfoRow label="결제 금액" value={formatKRW(amount)} />
              <InfoRow label="결제 수단" value={paymentMethod} />
            </div>
          </motion.dl>
        )}
      </AnimatePresence>
    </section>
  )
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd
        className={`text-right text-gray-900 ${mono ? "tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          불러오는 중…
        </div>
      }
    >
      <OrderDetailPageInner />
    </Suspense>
  )
}
