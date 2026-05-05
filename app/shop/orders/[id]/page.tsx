"use client"

import { use, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import {
  Camera,
  Check,
  ChevronLeft,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Wrench,
} from "lucide-react"
import {
  addOptions,
  getAccessOption,
  shopOrders,
  type OrderStatus,
} from "@/lib/mock-data"
import { formatKRW, formatPhone } from "@/lib/utils"

const STATUS_BADGE: Record<OrderStatus, { label: string; bg: string; fg: string }> = {
  new: { label: "새 주문", bg: "#FEE2E2", fg: "#B91C1C" },
  scheduled: { label: "예정", bg: "#DBEAFE", fg: "#1E40AF" },
  departed: { label: "출발", bg: "#FEF3C7", fg: "#A16207" },
  arrived: { label: "도착", bg: "#FEF3C7", fg: "#A16207" },
  in_progress: { label: "진행중", bg: "#DCFCE7", fg: "#15803D" },
  completed: { label: "완료", bg: "#E5E7EB", fg: "#374151" },
}

const TIMELINE_STEPS: { key: OrderStatus | "paid" | "assigned"; label: string }[] = [
  { key: "paid", label: "결제 완료" },
  { key: "assigned", label: "정비소 배정" },
  { key: "departed", label: "출발" },
  { key: "arrived", label: "도착" },
  { key: "in_progress", label: "작업 진행" },
  { key: "completed", label: "작업 완료" },
]

function timelineIdx(status: OrderStatus): number {
  switch (status) {
    case "scheduled":
      return 2
    case "departed":
      return 3
    case "arrived":
      return 4
    case "in_progress":
      return 4
    case "completed":
      return 6
    default:
      return 2
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ShopOrderDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const order = useMemo(() => shopOrders.find((o) => o.id === id), [id])
  const [status, setStatus] = useState<OrderStatus>(
    order?.status ?? "scheduled"
  )
  const [photoAdded, setPhotoAdded] = useState(false)
  const [extraNote, setExtraNote] = useState("")
  const [signed, setSigned] = useState(false)

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="mb-2 text-base font-semibold text-gray-900">
          주문을 찾을 수 없어요
        </p>
        <p className="mb-6 text-sm text-gray-600">
          이미 처리되었거나 잘못된 주문번호일 수 있어요
        </p>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    )
  }

  const optionItems = addOptions.filter((a) =>
    order.addOptions.includes(a.name)
  )

  const advance = (next: OrderStatus, message: string) => {
    setStatus(next)
    toast.success(message)
  }

  const finalize = () => {
    if (!signed) {
      toast.error("고객 서명을 받아주세요")
      return
    }
    toast.success("작업이 완료되었습니다")
    setTimeout(() => router.push("/shop"), 800)
  }

  const currentIdx = timelineIdx(status)
  const badge = STATUS_BADGE[status]

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3">
        <Link
          href="/shop"
          aria-label="대시보드로"
          className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <span className="font-mono text-xs text-gray-600 tabular-nums">
          {order.id}
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: badge.bg, color: badge.fg }}
        >
          {badge.label}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-5">
        <CustomerCard order={order} />
        <AccessCard order={order} />
        <VehicleCard order={order} optionNames={optionItems.map((o) => o.name)} />
        <ActionPanel
          status={status}
          onDeparted={() => advance("departed", "출발 처리되었습니다")}
          onArrived={() => advance("arrived", "도착 처리되었습니다")}
          onStartWork={() => advance("in_progress", "작업을 시작합니다")}
          onComplete={() => advance("completed", "작업이 완료 처리되었습니다")}
          onFinalize={finalize}
          photoAdded={photoAdded}
          onTogglePhoto={() => setPhotoAdded((v) => !v)}
          extraNote={extraNote}
          onChangeNote={setExtraNote}
          signed={signed}
          onToggleSign={() => setSigned((v) => !v)}
        />
        <Timeline currentIdx={currentIdx} status={status} />
      </main>
    </div>
  )
}

function CustomerCard({ order }: { order: (typeof shopOrders)[number] }) {
  const fullAddress =
    order.address + (order.addressDetail ? ` (${order.addressDetail})` : "")
  return (
    <section className="rounded-xl bg-white p-5 ring-1 ring-gray-200">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        차주 정보
      </h2>
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold"
          style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
        >
          {order.customerName.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-gray-900">
            {order.customerName}
          </p>
          <p className="text-xs text-gray-500">{formatPhone(order.customerPhone)}</p>
        </div>
        <button
          type="button"
          onClick={() =>
            alert(`전화 걸기 (시연용)\n${order.customerName} ${order.customerPhone}`)
          }
          aria-label="차주에게 전화"
          className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#FFEDD5", color: "#F97316" }}
        >
          <Phone className="h-5 w-5" fill="#F97316" />
        </button>
      </div>
      <div className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: "#1E40AF" }}
          />
          <p className="text-sm text-gray-800">{fullAddress}</p>
        </div>
        <button
          type="button"
          onClick={() => alert("길안내 (시연용)\n카카오내비 / 티맵 연동 예정")}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-semibold text-white"
        >
          <Navigation className="h-3.5 w-3.5" />
          길안내
        </button>
      </div>
    </section>
  )
}

function AccessCard({ order }: { order: (typeof shopOrders)[number] }) {
  const opt = getAccessOption(order.accessMethod)
  if (!opt) return null

  const isKey = opt.id === "key_dropoff"
  const accent = isKey ? "#F97316" : "#1E40AF"
  const bg = isKey ? "#FFF7ED" : "#EFF6FF"

  const description = (() => {
    switch (opt.id) {
      case "with_owner":
        return "차주님이 차량 옆에 계실 예정"
      case "remote_unlock":
        return "원격 잠금 해제 — 도착 알림 후 차주에게 요청"
      case "key_dropoff":
        return "차키 위치를 확인하고 차량으로 이동하세요"
      case "call_on_arrival":
        return `도착 시 차주에게 연락 — ${order.customerPhone}`
    }
  })()

  return (
    <section
      className="rounded-xl p-5 ring-1"
      style={{
        backgroundColor: bg,
        boxShadow: `inset 0 0 0 1px ${accent}40`,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <KeyRound className="h-4 w-4" style={{ color: accent }} />
        <h2
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: accent }}
        >
          차량 접근 방법
        </h2>
      </div>
      <p className="mb-1 text-base font-bold text-gray-900">
        {opt.emoji} {opt.title}
      </p>
      <p className="mb-3 text-sm text-gray-700">{description}</p>
      {isKey && order.accessNote && (
        <div
          className="rounded-lg border-2 border-dashed bg-white p-3"
          style={{ borderColor: accent }}
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
            차키 위치
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {order.accessNote}
          </p>
        </div>
      )}
    </section>
  )
}

function VehicleCard({
  order,
  optionNames,
}: {
  order: (typeof shopOrders)[number]
  optionNames: string[]
}) {
  return (
    <section className="rounded-xl bg-white p-5 ring-1 ring-gray-200">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        차량 · 작업
      </h2>
      <dl className="flex flex-col gap-2.5 text-sm">
        <Row label="차량">
          {order.vehicleModel}{" "}
          <span className="text-gray-500">/ {order.vehiclePlate}</span>
        </Row>
        <Row label="작업">{order.menuName}</Row>
        {order.addOptions.length > 0 && (
          <Row label="추가">{order.addOptions.join(", ")}</Row>
        )}
        <Row label="결제">
          <span className="font-semibold tabular-nums text-gray-900">
            {formatKRW(order.total)}
          </span>{" "}
          <span className="text-xs text-green-700">· 결제 완료</span>
        </Row>
      </dl>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-xs text-gray-500">{label}</dt>
      <dd className="text-right text-sm text-gray-900">{children}</dd>
    </div>
  )
}

function ActionPanel({
  status,
  onDeparted,
  onArrived,
  onStartWork,
  onComplete,
  onFinalize,
  photoAdded,
  onTogglePhoto,
  extraNote,
  onChangeNote,
  signed,
  onToggleSign,
}: {
  status: OrderStatus
  onDeparted: () => void
  onArrived: () => void
  onStartWork: () => void
  onComplete: () => void
  onFinalize: () => void
  photoAdded: boolean
  onTogglePhoto: () => void
  extraNote: string
  onChangeNote: (v: string) => void
  signed: boolean
  onToggleSign: () => void
}) {
  return (
    <section className="rounded-xl bg-white p-5 ring-1 ring-gray-200">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
        작업 진행
      </h2>

      <AnimatePresence mode="wait">
        {status === "scheduled" && (
          <motion.div key="scheduled" {...stepMotion}>
            <BigButton onClick={onDeparted} color="orange" icon={<Navigation className="h-5 w-5" />}>
              출발하기
            </BigButton>
          </motion.div>
        )}
        {status === "departed" && (
          <motion.div key="departed" {...stepMotion}>
            <p className="mb-3 text-xs text-gray-500">현재 이동 중입니다</p>
            <BigButton onClick={onArrived} color="orange" icon={<MapPin className="h-5 w-5" />}>
              도착했어요
            </BigButton>
          </motion.div>
        )}
        {status === "arrived" && (
          <motion.div key="arrived" {...stepMotion}>
            <p className="mb-3 text-xs text-gray-500">차량 확인 후 작업을 시작해주세요</p>
            <BigButton onClick={onStartWork} color="orange" icon={<Wrench className="h-5 w-5" />}>
              작업 시작
            </BigButton>
          </motion.div>
        )}
        {status === "in_progress" && (
          <motion.div key="in_progress" {...stepMotion} className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onTogglePhoto}
              className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors"
              style={{
                borderColor: photoAdded ? "#1E40AF" : "#D1D5DB",
                backgroundColor: photoAdded ? "#EFF6FF" : "#F9FAFB",
              }}
            >
              {photoAdded ? (
                <>
                  <Check className="h-6 w-6" style={{ color: "#1E40AF" }} strokeWidth={3} />
                  <span className="text-sm font-semibold" style={{ color: "#1E40AF" }}>
                    작업 사진 1장 추가됨
                  </span>
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-500">작업 사진 추가</span>
                </>
              )}
            </button>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-500">
                추가 작업 발견 시 입력
              </span>
              <textarea
                value={extraNote}
                onChange={(e) => onChangeNote(e.target.value)}
                placeholder="예: 에어 필터 매우 더러움, 교체 권장"
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
              />
            </label>
            <BigButton onClick={onComplete} color="green" icon={<Check className="h-5 w-5" />}>
              작업 완료
            </BigButton>
          </motion.div>
        )}
        {status === "completed" && (
          <motion.div key="completed" {...stepMotion} className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-700">
              고객님께 확인 받아주세요
            </p>
            <button
              type="button"
              onClick={onToggleSign}
              className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors"
              style={{
                borderColor: signed ? "#15803D" : "#D1D5DB",
                backgroundColor: signed ? "#F0FDF4" : "#F9FAFB",
              }}
            >
              {signed ? (
                <>
                  <svg
                    className="h-12 w-32 text-green-700"
                    viewBox="0 0 120 40"
                    fill="none"
                  >
                    <path
                      d="M5 28 Q15 8 28 22 T55 18 Q70 32 90 12 L115 22"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-green-700">
                    서명 완료
                  </span>
                </>
              ) : (
                <>
                  <Plus className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-500">여기에 서명 받기</span>
                </>
              )}
            </button>
            <BigButton onClick={onFinalize} color="green" icon={<Check className="h-5 w-5" />}>
              확인 완료
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

const stepMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
}

function BigButton({
  onClick,
  children,
  color,
  icon,
}: {
  onClick: () => void
  children: React.ReactNode
  color: "orange" | "green"
  icon?: React.ReactNode
}) {
  const bg = color === "orange" ? "#F97316" : "#15803D"
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: bg }}
    >
      {icon}
      {children}
    </button>
  )
}

function Timeline({
  currentIdx,
  status,
}: {
  currentIdx: number
  status: OrderStatus
}) {
  return (
    <section className="rounded-xl bg-white p-5 ring-1 ring-gray-200">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
        진행 타임라인
      </h2>
      <ol className="flex flex-col">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i < currentIdx
          const isCurrentInProgress = status === "in_progress" && i === 4
          const current = i === currentIdx || isCurrentInProgress
          const isLast = i === TIMELINE_STEPS.length - 1
          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                    done
                      ? "bg-blue-700"
                      : current
                        ? "bg-blue-100 ring-4 ring-blue-100"
                        : "bg-gray-100"
                  }`}
                >
                  {done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  {current && !done && (
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
                    style={{ minHeight: 14 }}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p
                  className={`text-sm font-semibold ${
                    current
                      ? "text-blue-900"
                      : done
                        ? "text-gray-900"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
