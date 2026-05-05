"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { DatePicker } from "@/components/order/DatePicker"
import { TimeSlotPicker } from "@/components/order/TimeSlotPicker"
import { SelectedDateTime } from "@/components/order/SelectedDateTime"
import {
  availableSlots,
  findAvailabilityDay,
  formatDateKorean,
  formatTimeRange,
} from "@/lib/mock-data"

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

function TimePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [customDate, setCustomDate] = useState<string>("")
  const [customTime, setCustomTime] = useState<string>("")

  const selectedDay = useMemo(
    () => (customDate ? findAvailabilityDay(customDate) : undefined),
    [customDate]
  )

  const customLabel = useMemo(() => {
    if (!selectedDay || !customTime) return ""
    return `${formatDateKorean(selectedDay.dateObj)} ${formatTimeRange(customTime)}`
  }, [selectedDay, customTime])

  const canProceed =
    selectedSlot !== "" && (selectedSlot !== "custom" || customLabel !== "")

  const onPickDate = (key: string) => {
    setCustomDate(key)
    setCustomTime("")
  }

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
      params.set("timeRange", customTime)
    } else {
      params.delete("timeDate")
      params.delete("timeRange")
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
            <div className="space-y-5 rounded-xl bg-gray-50 p-4">
              <div>
                <p className="mb-1 text-sm font-bold text-gray-900">
                  원하는 날짜와 시간을 선택해주세요
                </p>
                <p className="text-xs text-gray-500">
                  오늘부터 14일 이내 예약 가능
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  날짜
                </p>
                <DatePicker
                  days={availableSlots}
                  selected={customDate}
                  onSelect={onPickDate}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  시간대
                </p>
                <TimeSlotPicker
                  slots={selectedDay?.slots ?? null}
                  selected={customTime}
                  onSelect={setCustomTime}
                />
              </div>

              <AnimatePresence>
                {selectedDay && customTime && (
                  <SelectedDateTime
                    key={`${customDate}-${customTime}`}
                    date={selectedDay.dateObj}
                    time={customTime}
                  />
                )}
              </AnimatePresence>
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
