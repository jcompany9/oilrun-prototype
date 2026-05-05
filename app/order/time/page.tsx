"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface TimeSlot {
  id: string
  emoji: string
  title: string
  subtitle: string
}

const QUICK_SLOTS: TimeSlot[] = [
  {
    id: "asap",
    emoji: "⚡",
    title: "가능한 빨리",
    subtitle: "오늘 16:00–18:00 도착 예정",
  },
  {
    id: "tomorrow_am",
    emoji: "🌅",
    title: "내일 오전",
    subtitle: "내일 09:00–12:00 도착 예정",
  },
  {
    id: "tomorrow_pm",
    emoji: "☀️",
    title: "내일 오후",
    subtitle: "내일 14:00–18:00 도착 예정",
  },
  {
    id: "custom",
    emoji: "📅",
    title: "직접 선택",
    subtitle: "원하는 날짜와 시간 지정",
  },
]

const TIME_RANGES = [
  "09:00–11:00",
  "11:00–13:00",
  "14:00–16:00",
  "16:00–18:00",
  "18:00–20:00",
]

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const

interface DateOption {
  value: string
  label: string
}

function buildDateOptions(): DateOption[] {
  const out: DateOption[] = []
  const base = new Date()
  for (let i = 1; i <= 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const label = `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`
    out.push({ value, label })
  }
  return out
}

function TimePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [customDate, setCustomDate] = useState<string>("")
  const [customRange, setCustomRange] = useState<string>("")

  const dateOptions = useMemo(buildDateOptions, [])

  const customLabel = useMemo(() => {
    if (!customDate || !customRange) return ""
    const d = dateOptions.find((o) => o.value === customDate)
    return d ? `${d.label} ${customRange}` : ""
  }, [customDate, customRange, dateOptions])

  const canProceed =
    selectedSlot !== "" && (selectedSlot !== "custom" || customLabel !== "")

  const onNext = () => {
    if (!canProceed) return
    const slot = QUICK_SLOTS.find((s) => s.id === selectedSlot)
    const display =
      selectedSlot === "custom"
        ? customLabel
        : `${slot?.title} · ${slot?.subtitle}`
    const params = new URLSearchParams(searchParams.toString())
    params.set("timeSlot", selectedSlot)
    params.set("timeLabel", display)
    if (selectedSlot === "custom") {
      params.set("timeDate", customDate)
      params.set("timeRange", customRange)
    }
    router.push(`/order/access?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-1 flex-col px-6 pt-8 pb-32"
    >
      <h1 className="mb-2 text-2xl font-bold text-gray-900">언제 가능하세요?</h1>
      <p className="mb-6 text-sm text-gray-600">
        정비사가 도착할 시간을 골라주세요
      </p>

      <div className="flex flex-col gap-3">
        {QUICK_SLOTS.map((slot) => {
          const selected = selectedSlot === slot.id
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelectedSlot(slot.id)}
              className="w-full rounded-xl border-2 p-5 text-left transition-all"
              style={{
                borderColor: selected ? "#1E40AF" : "#E5E7EB",
                backgroundColor: selected ? "#F5F8FF" : "#FFFFFF",
              }}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl leading-none">{slot.emoji}</span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="mb-1 text-base font-bold text-gray-900">
                    {slot.title}
                  </p>
                  <p className="text-sm text-gray-600">{slot.subtitle}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedSlot === "custom" && (
          <motion.div
            key="custom-picker"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  날짜
                </label>
                <SelectField
                  value={customDate}
                  onChange={setCustomDate}
                  placeholder="날짜를 선택하세요"
                >
                  {dateOptions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  시간
                </label>
                <SelectField
                  value={customRange}
                  onChange={setCustomRange}
                  placeholder="시간대를 선택하세요"
                  disabled={!customDate}
                >
                  {TIME_RANGES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-gray-100 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="h-12 w-full rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: "#F97316" }}
        >
          다음
        </button>
      </div>
    </motion.div>
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
        className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-base font-medium text-gray-900 focus:border-blue-800 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 ${disabled ? "text-gray-300" : "text-gray-500"}`}
      />
    </div>
  )
}

export default function TimePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          불러오는 중…
        </div>
      }
    >
      <TimePageInner />
    </Suspense>
  )
}
