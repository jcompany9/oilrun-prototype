"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Phone,
  MapPin,
  Clock,
  ArrowLeft,
  Camera,
  ChevronRight,
  PlayCircle,
  AlertTriangle,
  Volume2,
  Wrench,
  Check,
  Sparkles,
  Truck,
} from "lucide-react"
import {
  bookingMenus,
  warningLights,
  carCategoryLabel,
  carCategoryExamples,
  creatorVideos,
  jobTypeEmoji,
  type SaasPublicShop,
  type CreatorVideo,
  type CarCategory,
  type BookingMenu,
  type WarningLight,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

type IntentType = "routine" | "warning" | "noise" | "emergency"

interface IntentOption {
  id: IntentType
  emoji: string
  title: string
  subtitle: string
  bg: string
  border: string
  icon: typeof Wrench
}

const INTENTS: IntentOption[] = [
  {
    id: "routine",
    emoji: "🛢️",
    title: "정기 정비 / 교체",
    subtitle: "오일·타이어·블랙박스 등 메뉴에서 선택",
    bg: "#DBEAFE",
    border: "#1E40AF",
    icon: Wrench,
  },
  {
    id: "warning",
    emoji: "🚨",
    title: "경고등이 떴어요",
    subtitle: "사진 올리시면 사장님이 확인해드려요",
    bg: "#FEE2E2",
    border: "#B91C1C",
    icon: AlertTriangle,
  },
  {
    id: "noise",
    emoji: "🔊",
    title: "이상한 소리·진동",
    subtitle: "어떤 상황에서 나는지 알려주세요",
    bg: "#FEF3C7",
    border: "#A16207",
    icon: Volume2,
  },
  {
    id: "emergency",
    emoji: "🆘",
    title: "고장·긴급",
    subtitle: "지금 바로 전화 연결",
    bg: "#FED7AA",
    border: "#C2410C",
    icon: Phone,
  },
]

type Step = "intent" | "routine_category" | "routine_menu" | "time" | "warning" | "confirm"

interface AvailabilitySlot {
  time: string
  available: boolean
  capacity: number
  reason?: string
}
interface AvailabilityResponse {
  date: string
  durationMin: number
  mechanics: number
  slots: AvailabilitySlot[]
}

export function BookingFlow({
  shop,
  sourceVideo,
}: {
  shop: SaasPublicShop
  sourceVideo?: CreatorVideo
}) {
  const [step, setStep] = useState<Step>("intent")
  const [intent, setIntent] = useState<IntentType | null>(null)
  const [carCategory, setCarCategory] = useState<CarCategory | null>(null)
  const [selectedMenu, setSelectedMenu] = useState<BookingMenu | null>(null)
  const [selectedWarning, setSelectedWarning] = useState<WarningLight | null>(null)
  const [warningNote, setWarningNote] = useState("")
  const [refVideo, setRefVideo] = useState<CreatorVideo | undefined>(sourceVideo)
  // 차주 정보 — confirm 단계에 입력
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // 시간 선택 (routine 한정)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [availLoading, setAvailLoading] = useState(false)

  function ymd(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  // 시간 단계 진입 또는 날짜 변경 시 가용성 fetch
  useEffect(() => {
    if (step !== "time") return
    if (!selectedMenu) return
    let canceled = false
    setAvailLoading(true)
    fetch(
      `/api/public/availability?shop=${shop.slug}&date=${ymd(selectedDate)}&durationMin=${selectedMenu.durationMin}`
    )
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json() as Promise<AvailabilityResponse>
      })
      .then((data) => {
        if (canceled) return
        setAvailability(data)
        setAvailLoading(false)
      })
      .catch((e) => {
        if (canceled) return
        toast.error("시간 조회 실패", { description: String(e) })
        setAvailLoading(false)
      })
    return () => {
      canceled = true
    }
  }, [step, selectedDate, selectedMenu, shop.slug])

  const goBack = () => {
    if (step === "intent") return
    if (step === "routine_category") setStep("intent")
    else if (step === "routine_menu") setStep("routine_category")
    else if (step === "time") setStep("routine_menu")
    else if (step === "warning") setStep("intent")
    else if (step === "confirm") {
      setStep(intent === "warning" ? "warning" : "time")
    }
  }

  const pickIntent = (id: IntentType) => {
    setIntent(id)
    if (id === "routine") setStep("routine_category")
    else if (id === "warning") setStep("warning")
    else if (id === "emergency") {
      toast.success("긴급 상담 전화 연결", {
        description: shop.phone,
      })
    } else {
      toast("준비 중인 기능이에요", {
        description: "곧 추가될 예정. 지금은 전화로 연락 부탁드립니다",
      })
    }
  }

  const intentMap: Record<IntentType, "REGULAR" | "WARNING_LIGHT" | "NOISE" | "EMERGENCY"> = {
    routine: "REGULAR",
    warning: "WARNING_LIGHT",
    noise: "NOISE",
    emergency: "EMERGENCY",
  }
  const categoryMap: Record<CarCategory, "COMPACT" | "MIDSIZE" | "SUV" | "LUXURY" | "EV"> = {
    compact: "COMPACT",
    midsize: "MIDSIZE",
    suv: "SUV",
    luxury: "LUXURY",
    ev: "EV",
  }

  const resetForm = () => {
    setStep("intent")
    setIntent(null)
    setCarCategory(null)
    setSelectedMenu(null)
    setSelectedWarning(null)
    setWarningNote("")
    setCustomerName("")
    setCustomerPhone("")
    setVehiclePlate("")
    setSelectedTime(null)
    setAvailability(null)
  }

  const submit = async () => {
    if (!intent) return
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("이름과 휴대폰을 입력해주세요")
      return
    }
    setSubmitting(true)
    try {
      const description =
        intent === "warning"
          ? `${selectedWarning?.name ?? "경고등"}${warningNote ? ` · ${warningNote}` : ""}`
          : undefined

      // 시간 선택 → ISO 변환
      const scheduledStartISO =
        selectedTime && intent === "routine"
          ? new Date(`${ymd(selectedDate)}T${selectedTime}:00`).toISOString()
          : undefined

      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopSlug: shop.slug,
          intent: intentMap[intent],
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          vehiclePlate: vehiclePlate.trim() || undefined,
          vehicleCategory: carCategory ? categoryMap[carCategory] : undefined,
          bookingMenuId: selectedMenu?.id,
          bookingMenuName: selectedMenu?.name,
          estimatedAmount:
            selectedMenu && carCategory ? selectedMenu.prices[carCategory] ?? undefined : undefined,
          scheduledStart: scheduledStartISO,
          durationMin: selectedMenu?.durationMin,
          description,
          sourceRef: refVideo?.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `${res.status}`)
      }
      toast.success("예약 신청 완료!", {
        description: "사장님이 확인 후 카카오 알림톡으로 답변드려요",
      })
      resetForm()
    } catch (e) {
      toast.error("예약 실패", { description: String(e) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader shop={shop} sourceVideo={refVideo} onClearVideo={() => setRefVideo(undefined)} />

      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        {step !== "intent" && (
          <button
            type="button"
            onClick={goBack}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === "intent" && (
            <motion.div
              key="intent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <IntentStep onPick={pickIntent} />
            </motion.div>
          )}

          {step === "routine_category" && (
            <motion.div
              key="cat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CategoryStep
                onPick={(c) => {
                  setCarCategory(c)
                  setStep("routine_menu")
                }}
              />
            </motion.div>
          )}

          {step === "routine_menu" && carCategory && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MenuStep
                category={carCategory}
                onPick={(m) => {
                  setSelectedMenu(m)
                  setSelectedTime(null)
                  setAvailability(null)
                  setStep("time")
                }}
              />
            </motion.div>
          )}

          {step === "time" && (
            <motion.div
              key="time"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TimeStep
                selectedDate={selectedDate}
                onDateChange={(d) => {
                  setSelectedDate(d)
                  setSelectedTime(null)
                }}
                selectedTime={selectedTime}
                onPickTime={(t) => {
                  setSelectedTime(t)
                  setStep("confirm")
                }}
                availability={availability}
                loading={availLoading}
                durationMin={selectedMenu?.durationMin ?? 30}
              />
            </motion.div>
          )}

          {step === "warning" && (
            <motion.div
              key="warn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <WarningStep
                selected={selectedWarning}
                note={warningNote}
                onSelect={setSelectedWarning}
                onNoteChange={setWarningNote}
                onContinue={() => setStep("confirm")}
              />
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ConfirmStep
                shop={shop}
                intent={intent}
                category={carCategory}
                menu={selectedMenu}
                warning={selectedWarning}
                note={warningNote}
                refVideo={refVideo}
                customerName={customerName}
                onCustomerNameChange={setCustomerName}
                customerPhone={customerPhone}
                onCustomerPhoneChange={setCustomerPhone}
                vehiclePlate={vehiclePlate}
                onVehiclePlateChange={setVehiclePlate}
                submitting={submitting}
                onSubmit={submit}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {step === "intent" && shop.hasCreatorModule && <CreatorSection shop={shop} />}
      </div>
    </div>
  )
}

function ShopHeader({
  shop,
  sourceVideo,
  onClearVideo,
}: {
  shop: SaasPublicShop
  sourceVideo?: CreatorVideo
  onClearVideo: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-lg font-extrabold tracking-tight" style={{ color: "#1E40AF" }}>
              OilRun
            </span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
            >
              부킹
            </span>
          </Link>
          <a
            href={`tel:${shop.phone.replace(/-/g, "")}`}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-gray-100 px-3 text-xs font-bold text-gray-700 hover:bg-gray-200"
          >
            <Phone className="h-3.5 w-3.5" />
            {shop.phone}
          </a>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-extrabold text-gray-900">{shop.name}</h1>
          <p className="mt-0.5 text-sm text-gray-600">{shop.ownerGreeting}</p>
          <div className="mt-2 space-y-0.5 text-xs text-gray-600">
            <p className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {shop.address}
            </p>
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {shop.hours}
            </p>
          </div>
        </div>

        {sourceVideo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5"
          >
            <PlayCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                이 영상 보고 오셨어요?
              </p>
              <p className="truncate text-xs text-red-900">{sourceVideo.title}</p>
            </div>
            <button
              type="button"
              onClick={onClearVideo}
              className="text-[11px] font-medium text-red-700 hover:underline"
            >
              아니요
            </button>
          </motion.div>
        )}
      </div>
    </header>
  )
}

function IntentStep({ onPick }: { onPick: (id: IntentType) => void }) {
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-gray-900">무엇 때문에 오시나요?</h2>
      <p className="mt-1 text-sm text-gray-500">증상부터 알려주셔도 돼요</p>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {INTENTS.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => onPick(it.id)}
              className="group flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: it.border }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: it.bg }}
              >
                {it.emoji}
              </span>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">{it.title}</p>
                <p className="mt-0.5 text-xs text-gray-600">{it.subtitle}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
        💡 <span className="font-bold">정찰가 보장</span> · 추가 비용 발생 시 사전 안내 · 작업 후 변경 없음
      </div>
    </section>
  )
}

function CategoryStep({ onPick }: { onPick: (cat: CarCategory) => void }) {
  const categories: CarCategory[] = ["compact", "midsize", "suv", "luxury", "ev"]

  return (
    <section>
      <h2 className="text-xl font-extrabold text-gray-900">차종을 알려주세요</h2>
      <p className="mt-1 text-sm text-gray-500">차종에 따라 정찰가가 달라요</p>
      <ul className="mt-5 space-y-2">
        {categories.map((c) => (
          <li key={c}>
            <button
              type="button"
              onClick={() => onPick(c)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <div>
                <p className="text-base font-bold text-gray-900">{carCategoryLabel[c]}</p>
                <p className="mt-0.5 text-xs text-gray-500">예: {carCategoryExamples[c]}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MenuStep({
  category,
  onPick,
}: {
  category: CarCategory
  onPick: (m: BookingMenu) => void
}) {
  const available = bookingMenus.filter((m) => m.prices[category] !== null)

  return (
    <section>
      <h2 className="text-xl font-extrabold text-gray-900">메뉴를 골라주세요</h2>
      <p className="mt-1 text-sm text-gray-500">
        {carCategoryLabel[category]} 정찰가 (부가세 포함)
      </p>
      <ul className="mt-5 space-y-2">
        {available.map((m) => {
          const price = m.prices[category]!
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onPick(m)}
                className="flex w-full items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-blue-400"
                style={{ borderColor: m.isHouseCall ? "#FDBA74" : "#E5E7EB" }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                  style={{ backgroundColor: m.isHouseCall ? "#FFEDD5" : "#F9FAFB" }}
                >
                  {m.isHouseCall ? "🚐" : jobTypeEmoji[m.jobType]}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900">{m.name}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      {m.isHouseCall && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
                        >
                          출장
                        </span>
                      )}
                      {m.recommended && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
                        >
                          추천
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-600">{m.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>⏱ 약 {m.durationMin}분</span>
                    <span className="ml-auto text-base font-extrabold tabular-nums" style={{ color: "#1E40AF" }}>
                      {formatKRW(price)}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function WarningStep({
  selected,
  note,
  onSelect,
  onNoteChange,
  onContinue,
}: {
  selected: WarningLight | null
  note: string
  onSelect: (w: WarningLight) => void
  onNoteChange: (s: string) => void
  onContinue: () => void
}) {
  const severityColor = {
    high: { bg: "#FEE2E2", fg: "#B91C1C" },
    mid: { bg: "#FEF3C7", fg: "#A16207" },
    low: { bg: "#DCFCE7", fg: "#15803D" },
  }

  return (
    <section>
      <h2 className="text-xl font-extrabold text-gray-900">어떤 경고등인가요?</h2>
      <p className="mt-1 text-sm text-gray-500">사진을 올리시면 가장 정확해요</p>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:bg-blue-50"
        onClick={() => toast("사진 업로드 시뮬레이션", { description: "프로토타입에서는 실제 업로드 안 돼요" })}
      >
        <Camera className="h-5 w-5" />
        경고등 사진 올리기
      </button>

      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-gray-500">또는 종류 선택</p>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {warningLights.map((w) => {
          const sev = severityColor[w.severity]
          const isSelected = selected?.id === w.id
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => onSelect(w)}
                className={`flex w-full flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{w.emoji}</span>
                <p className="text-sm font-bold text-gray-900">{w.name}</p>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: sev.bg, color: sev.fg }}
                >
                  {w.severity === "high" ? "긴급" : w.severity === "mid" ? "확인 필요" : "참고"}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="언제부터 떴는지, 주행 중 변화는 있는지 적어주세요 (선택)"
        rows={3}
        className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none"
      />

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected}
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl text-base font-bold text-white transition-opacity disabled:opacity-40"
        style={{ backgroundColor: "#F97316" }}
      >
        다음
      </button>
    </section>
  )
}

// ─── 시간 선택 단계 ──────────────────────────────────
const KO_DAY_SHORT = ["일", "월", "화", "수", "목", "금", "토"]

function TimeStep({
  selectedDate,
  onDateChange,
  selectedTime,
  onPickTime,
  availability,
  loading,
  durationMin,
}: {
  selectedDate: Date
  onDateChange: (d: Date) => void
  selectedTime: string | null
  onPickTime: (time: string) => void
  availability: AvailabilityResponse | null
  loading: boolean
  durationMin: number
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  function sameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  // 슬롯을 morning/afternoon으로 그룹
  const morningSlots = availability?.slots.filter((s) => parseInt(s.time) < 12) ?? []
  const afternoonSlots = availability?.slots.filter((s) => parseInt(s.time) >= 13) ?? []

  return (
    <section>
      <h2 className="text-xl font-extrabold text-gray-900">원하는 시간을 골라주세요</h2>
      <p className="mt-1 text-sm text-gray-500">
        작업 시간 약 {durationMin}분
        {availability && ` · 정비사 ${availability.mechanics}명 동시 진행 가능`}
      </p>

      {/* 날짜 strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => {
          const active = sameDay(d, selectedDate)
          const isToday = sameDay(d, today)
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onDateChange(d)}
              className={`flex shrink-0 flex-col items-center rounded-xl border px-4 py-2 transition-colors ${
                active
                  ? "border-blue-700 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              style={active ? { backgroundColor: "#1E40AF" } : undefined}
            >
              <span className={`text-[10px] font-medium ${active ? "" : "text-gray-500"}`}>
                {KO_DAY_SHORT[d.getDay()]}
              </span>
              <span className="text-base font-bold tabular-nums">{d.getDate()}</span>
              {isToday && (
                <span
                  className={`text-[9px] font-bold ${
                    active ? "" : "text-blue-700"
                  }`}
                >
                  오늘
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 슬롯 그리드 */}
      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
        {loading ? (
          <p className="text-center text-sm text-gray-500">로드 중…</p>
        ) : !availability || availability.slots.length === 0 ? (
          <p className="text-center text-sm text-gray-500">예약 가능한 시간이 없어요</p>
        ) : (
          <>
            {morningSlots.length > 0 && (
              <SlotGroup
                title="오전"
                slots={morningSlots}
                selectedTime={selectedTime}
                onPick={onPickTime}
              />
            )}
            {afternoonSlots.length > 0 && (
              <SlotGroup
                title="오후"
                slots={afternoonSlots}
                selectedTime={selectedTime}
                onPick={onPickTime}
              />
            )}
          </>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-gray-500">
        가능한 시간만 보입니다. 정비사가 동시 처리할 수 있어 같은 시간에도 자리가 있을 수 있어요.
      </p>
    </section>
  )
}

function SlotGroup({
  title,
  slots,
  selectedTime,
  onPick,
}: {
  title: string
  slots: AvailabilitySlot[]
  selectedTime: string | null
  onPick: (time: string) => void
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {title}
      </p>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
        {slots.map((s) => {
          const active = selectedTime === s.time
          const lunch = s.reason === "lunch"
          return (
            <button
              key={s.time}
              type="button"
              onClick={() => s.available && onPick(s.time)}
              disabled={!s.available}
              className={`rounded-lg border px-2 py-2 text-xs font-bold transition-colors ${
                active
                  ? "text-white"
                  : s.available
                    ? "border-gray-200 bg-white text-gray-900 hover:border-blue-400"
                    : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
              }`}
              style={
                active
                  ? { backgroundColor: "#1E40AF", borderColor: "#1E40AF" }
                  : undefined
              }
            >
              {lunch ? "🍽️" : s.time}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ConfirmStep({
  shop,
  intent,
  category,
  menu,
  warning,
  note,
  refVideo,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  vehiclePlate,
  onVehiclePlateChange,
  submitting,
  onSubmit,
}: {
  shop: SaasPublicShop
  intent: IntentType | null
  category: CarCategory | null
  menu: BookingMenu | null
  warning: WarningLight | null
  note: string
  refVideo?: CreatorVideo
  customerName: string
  onCustomerNameChange: (v: string) => void
  customerPhone: string
  onCustomerPhoneChange: (v: string) => void
  vehiclePlate: string
  onVehiclePlateChange: (v: string) => void
  submitting: boolean
  onSubmit: () => void
}) {
  const isWarning = intent === "warning"
  const price = menu && category ? menu.prices[category] : null

  return (
    <section>
      <h2 className="text-xl font-extrabold text-gray-900">예약 내용 확인</h2>

      <div className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
          >
            {shop.shortName}
          </span>
          <span className="text-xs text-gray-500">{shop.address.split(" ").slice(1, 3).join(" ")}</span>
        </div>

        {!isWarning && menu && category && (
          <>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{menu.isHouseCall ? "🚐" : jobTypeEmoji[menu.jobType]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-bold text-gray-900">{menu.name}</p>
                  {menu.isHouseCall && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
                    >
                      출장
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  {carCategoryLabel[category]} · 약 {menu.durationMin}분
                </p>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-700">총 결제 예정</span>
                <span className="text-2xl font-extrabold tabular-nums" style={{ color: "#1E40AF" }}>
                  {price !== null ? formatKRW(price!) : "별도 견적"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                정찰가 보장 · 추가 작업 시 사장님 확인 후 동의 시에만 진행
              </p>
            </div>
            {menu.isHouseCall && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900">
                <p className="flex items-center gap-1 font-bold">
                  <Truck className="h-3.5 w-3.5" />
                  출장 서비스 안내
                </p>
                <p className="mt-1">
                  기사님이 직접 차량 위치로 방문해서 작업합니다. 주차장·자택·사무실 어디든 가능해요.
                </p>
              </div>
            )}
          </>
        )}

        {isWarning && warning && (
          <>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{warning.emoji}</span>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">{warning.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">{warning.hint}</p>
                {note && (
                  <p className="mt-2 rounded-md bg-gray-50 px-2 py-1.5 text-xs text-gray-700">
                    "{note}"
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900">
              💬 사장님이 사진·내용 확인 후 견적·일정 답변을 카카오 알림톡으로 보내드려요
            </div>
          </>
        )}

        {refVideo && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[11px]">
            <PlayCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="font-bold text-red-700">유튜브 추적:</span>
            <span className="truncate text-red-900">{refVideo.title}</span>
          </div>
        )}
      </div>

      <input
        type="text"
        value={customerName}
        onChange={(e) => onCustomerNameChange(e.target.value)}
        placeholder="이름"
        className="mt-4 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-400 focus:outline-none"
      />
      <input
        type="tel"
        value={customerPhone}
        onChange={(e) => onCustomerPhoneChange(e.target.value)}
        placeholder="휴대폰 번호 (010-)"
        className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-400 focus:outline-none"
      />
      <input
        type="text"
        value={vehiclePlate}
        onChange={(e) => onVehiclePlateChange(e.target.value)}
        placeholder="차량번호 (예: 12가3456)"
        className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-400 focus:outline-none"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "#F97316" }}
      >
        <Check className="h-5 w-5" />
        {submitting ? "신청 중…" : "예약 신청"}
      </button>
      <p className="mt-2 text-center text-[11px] text-gray-500">
        신청 후 사장님 확인 → 카카오 알림톡으로 확정 알림이 갑니다
      </p>
    </section>
  )
}

function CreatorSection({ shop }: { shop: SaasPublicShop }) {
  const topVideos = creatorVideos.slice(0, 3)

  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-5">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-red-600" />
          <div className="min-w-0">
            <p className="text-base font-extrabold text-gray-900">{shop.channelName}</p>
            <p className="text-xs text-gray-600">
              {shop.channelHandle} · 구독자{" "}
              <span className="font-bold tabular-nums text-red-700">
                {shop.channelSubscribers?.toLocaleString()}명
              </span>
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex h-9 items-center gap-1 rounded-full bg-red-600 px-3 text-xs font-bold text-white hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            구독
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-700">{shop.channelDescription}</p>
      </div>

      <h3 className="mt-5 mb-2 text-sm font-bold text-gray-900">인기 영상으로 미리 알아보기</h3>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {topVideos.map((v) => (
          <li key={v.id}>
            <article className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-5xl">
                {v.thumbnailEmoji}
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 text-xs font-bold text-gray-900">{v.title}</p>
                <p className="mt-1 text-[10px] text-gray-500">
                  조회 {(v.views / 1000).toFixed(0)}k · {v.duration}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
