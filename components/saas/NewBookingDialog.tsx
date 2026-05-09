"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, Phone, Footprints, MessageCircle, Globe } from "lucide-react"
import { toast } from "sonner"
import { formatKRW } from "@/lib/utils"

type ChannelType = "PHONE" | "WALK_IN" | "KAKAO" | "OTHER"
type Intent = "REGULAR" | "WARNING_LIGHT" | "NOISE" | "EMERGENCY" | "HOUSE_CALL"
type Category = "COMPACT" | "MIDSIZE" | "SUV" | "LUXURY" | "EV"
type Fuel = "GASOLINE" | "DIESEL" | "LPG" | "HYBRID" | "ELECTRIC"

interface MenuOption {
  id: string
  name: string
  description: string | null
  jobType: string
  durationMin: number
  isHouseCall: boolean
  recommended: boolean
  prices: Record<string, number | null>
}

const CHANNEL_OPTIONS: Array<{ value: ChannelType; label: string; icon: typeof Phone }> = [
  { value: "PHONE", label: "전화", icon: Phone },
  { value: "WALK_IN", label: "워크인", icon: Footprints },
  { value: "KAKAO", label: "카톡", icon: MessageCircle },
  { value: "OTHER", label: "기타", icon: Globe },
]

const INTENT_OPTIONS: Array<{ value: Intent; label: string }> = [
  { value: "REGULAR", label: "정기 점검" },
  { value: "WARNING_LIGHT", label: "경고등" },
  { value: "NOISE", label: "이상 소리/진동" },
  { value: "EMERGENCY", label: "긴급" },
  { value: "HOUSE_CALL", label: "출장" },
]

const CATEGORY_LABEL: Record<Category, string> = {
  COMPACT: "경차/소형",
  MIDSIZE: "중형",
  SUV: "SUV",
  LUXURY: "대형/수입",
  EV: "전기차",
}

const FUEL_LABEL: Record<Fuel, string> = {
  GASOLINE: "가솔린",
  DIESEL: "디젤",
  LPG: "LPG",
  HYBRID: "하이브리드",
  ELECTRIC: "전기",
}

const TIME_PRESETS: Array<{ value: string; label: string }> = [
  { value: "now", label: "지금" },
  { value: "+1h", label: "1시간 후" },
  { value: "+2h", label: "2시간 후" },
  { value: "today_pm", label: "오늘 오후" },
  { value: "tomorrow_am", label: "내일 오전" },
  { value: "custom", label: "직접" },
]

function calcScheduled(preset: string, customDate: string, customTime: string): Date | null {
  const now = new Date()
  switch (preset) {
    case "now":
      return now
    case "+1h":
      return new Date(now.getTime() + 60 * 60 * 1000)
    case "+2h":
      return new Date(now.getTime() + 2 * 60 * 60 * 1000)
    case "today_pm": {
      const d = new Date(now)
      d.setHours(15, 0, 0, 0)
      return d
    }
    case "tomorrow_am": {
      const d = new Date(now)
      d.setDate(d.getDate() + 1)
      d.setHours(10, 0, 0, 0)
      return d
    }
    case "custom":
      if (!customDate || !customTime) return null
      return new Date(`${customDate}T${customTime}`)
    default:
      return null
  }
}

export function NewBookingDialog({
  open,
  onClose,
  onCreated,
  defaultScheduledStart,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  defaultScheduledStart?: Date | null
}) {
  const [menus, setMenus] = useState<MenuOption[]>([])
  const [submitting, setSubmitting] = useState(false)

  // form state
  const [channel, setChannel] = useState<ChannelType>("PHONE")
  const [intent, setIntent] = useState<Intent>("REGULAR")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [vehicleModelName, setVehicleModelName] = useState("")
  const [vehicleYear, setVehicleYear] = useState<number>(new Date().getFullYear())
  const [vehicleFuel, setVehicleFuel] = useState<Fuel>("GASOLINE")
  const [vehicleCategory, setVehicleCategory] = useState<Category>("MIDSIZE")
  const [bookingMenuId, setBookingMenuId] = useState<string>("")
  const [timePreset, setTimePreset] = useState<string>("now")
  const [customDate, setCustomDate] = useState<string>("")
  const [customTime, setCustomTime] = useState<string>("")
  const [description, setDescription] = useState<string>("")

  useEffect(() => {
    if (!open) return
    fetch("/api/saas/booking-menus")
      .then((r) => r.json())
      .then((data: MenuOption[]) => setMenus(data))
      .catch((e) => console.error("메뉴 로드 실패:", e))
  }, [open])

  // reset on close
  useEffect(() => {
    if (open) return
    setChannel("PHONE")
    setIntent("REGULAR")
    setCustomerName("")
    setCustomerPhone("")
    setVehiclePlate("")
    setVehicleModelName("")
    setVehicleYear(new Date().getFullYear())
    setVehicleFuel("GASOLINE")
    setVehicleCategory("MIDSIZE")
    setBookingMenuId("")
    setTimePreset("now")
    setCustomDate("")
    setCustomTime("")
    setDescription("")
  }, [open])

  // 외부에서 시간 prefill (캘린더 빈 슬롯 클릭)
  useEffect(() => {
    if (!open || !defaultScheduledStart) return
    const d = defaultScheduledStart
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    setTimePreset("custom")
    setCustomDate(ymd)
    setCustomTime(hm)
  }, [open, defaultScheduledStart])

  const selectedMenu = menus.find((m) => m.id === bookingMenuId) ?? null
  const estimatedAmount = selectedMenu?.prices[vehicleCategory] ?? null

  async function handleSubmit() {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("이름과 휴대폰은 필수입니다")
      return
    }
    const scheduledStart = calcScheduled(timePreset, customDate, customTime)
    if (!scheduledStart) {
      toast.error("예약 시간을 선택해주세요")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/saas/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelType: channel,
          intent,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          vehiclePlate: vehiclePlate.trim() || undefined,
          vehicleModelName: vehicleModelName.trim() || undefined,
          vehicleYear,
          vehicleFuel,
          vehicleCategory,
          bookingMenuId: bookingMenuId || undefined,
          bookingMenuName: selectedMenu?.name,
          estimatedAmount: estimatedAmount ?? undefined,
          scheduledStart: scheduledStart.toISOString(),
          isHouseCall: intent === "HOUSE_CALL" || (selectedMenu?.isHouseCall ?? false),
          description: description.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `${res.status}`)
      }
      toast.success("새 예약이 인박스에 추가됐어요")
      onCreated()
      onClose()
    } catch (e) {
      toast.error("등록 실패", { description: String(e) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-8 bottom-8 z-50 mx-auto flex max-w-lg flex-col rounded-2xl bg-white shadow-2xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[88vh] sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">새 예약 (직접 입력)</h2>
                <p className="text-xs text-gray-500">전화·워크인 손님을 받았을 때</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <Section title="채널">
                <div className="grid grid-cols-4 gap-2">
                  {CHANNEL_OPTIONS.map((c) => {
                    const Icon = c.icon
                    const active = channel === c.value
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setChannel(c.value)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-semibold transition ${
                          active
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section title="차주 정보">
                <Field label="이름 *">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="휴대폰 *">
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    inputMode="tel"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </Field>
              </Section>

              <Section title="차량 정보">
                <Field label="차량번호 (선택)">
                  <input
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="12가3456"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="모델">
                  <input
                    value={vehicleModelName}
                    onChange={(e) => setVehicleModelName(e.target.value)}
                    placeholder="쏘나타 DN8"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </Field>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="연식">
                    <input
                      type="number"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="유종">
                    <select
                      value={vehicleFuel}
                      onChange={(e) => setVehicleFuel(e.target.value as Fuel)}
                      className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
                    >
                      {(Object.keys(FUEL_LABEL) as Fuel[]).map((f) => (
                        <option key={f} value={f}>{FUEL_LABEL[f]}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="차종">
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value as Category)}
                      className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
                    >
                      {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Section>

              <Section title="작업">
                <Field label="의도">
                  <div className="flex flex-wrap gap-1.5">
                    {INTENT_OPTIONS.map((i) => {
                      const active = intent === i.value
                      return (
                        <button
                          key={i.value}
                          type="button"
                          onClick={() => setIntent(i.value)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            active
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {i.label}
                        </button>
                      )
                    })}
                  </div>
                </Field>
                <Field label="메뉴">
                  <select
                    value={bookingMenuId}
                    onChange={(e) => setBookingMenuId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
                  >
                    <option value="">— 메뉴 선택 (선택) —</option>
                    {menus.map((m) => {
                      const price = m.prices[vehicleCategory]
                      return (
                        <option key={m.id} value={m.id}>
                          {m.isHouseCall ? "🚐 " : ""}{m.name} {price ? `· ${formatKRW(price)}` : ""}
                        </option>
                      )
                    })}
                  </select>
                </Field>
                {selectedMenu && estimatedAmount !== null && (
                  <p className="text-xs font-semibold text-gray-700">
                    예상 금액: <span className="text-blue-700">{formatKRW(estimatedAmount)}</span>
                    <span className="ml-2 text-gray-500">· 약 {selectedMenu.durationMin}분</span>
                  </p>
                )}
              </Section>

              <Section title="시간">
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_PRESETS.map((t) => {
                    const active = timePreset === t.value
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTimePreset(t.value)}
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
                {timePreset === "custom" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                    />
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                    />
                  </div>
                )}
              </Section>

              <Section title="메모">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="자유 메모 (예: 경고등 이름, 사장님께 메시지 등)"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </Section>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#1E40AF" }}
              >
                {submitting ? "등록 중…" : "예약 등록"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  )
}
