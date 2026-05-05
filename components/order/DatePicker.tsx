"use client"

import { useEffect, useRef } from "react"
import { Check } from "lucide-react"
import {
  DEMO_TODAY,
  toDateKey,
  type AvailabilityDay,
} from "@/lib/mock-data"

const KO_WEEKDAY_SHORT = ["일", "월", "화", "수", "목", "금", "토"]

interface Props {
  days: AvailabilityDay[]
  selected: string
  onSelect: (dateKey: string) => void
}

export function DatePicker({ days, selected, onSelect }: Props) {
  const todayKey = toDateKey(DEMO_TODAY)
  const tomorrowKey = toDateKey(
    new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), DEMO_TODAY.getDate() + 1)
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selected || !scrollRef.current) return
    const el = scrollRef.current.querySelector<HTMLButtonElement>(
      `[data-date="${selected}"]`
    )
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [selected])

  return (
    <div
      ref={scrollRef}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {days.map((d) => {
        const dayIdx = d.dateObj.getDay()
        const weekday = KO_WEEKDAY_SHORT[dayIdx]
        const month = d.dateObj.getMonth() + 1
        const date = d.dateObj.getDate()
        const isToday = d.date === todayKey
        const isTomorrow = d.date === tomorrowKey
        const isSelected = selected === d.date
        const hasAvailable = d.slots.some((s) => s.available)
        const isClosed = !hasAvailable

        const weekdayColor =
          dayIdx === 6
            ? "#1E40AF"
            : dayIdx === 0
              ? "#DC2626"
              : isSelected
                ? "#1E40AF"
                : "#6B7280"

        return (
          <button
            key={d.date}
            type="button"
            data-date={d.date}
            onClick={() => !isClosed && onSelect(d.date)}
            disabled={isClosed}
            className="relative flex h-[88px] w-16 shrink-0 flex-col items-center justify-center rounded-xl border-2 transition-all"
            style={{
              borderColor: isSelected ? "#1E40AF" : isClosed ? "#E5E7EB" : "#E5E7EB",
              backgroundColor: isSelected
                ? "#EFF6FF"
                : isClosed
                  ? "#F9FAFB"
                  : "#FFFFFF",
              opacity: isClosed ? 0.55 : 1,
              cursor: isClosed ? "not-allowed" : "pointer",
            }}
          >
            {(isToday || isTomorrow) && (
              <span
                className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap"
                style={{
                  backgroundColor: isToday ? "#F97316" : "#1E40AF",
                  color: "#FFFFFF",
                }}
              >
                {isToday ? "오늘" : "내일"}
              </span>
            )}

            <span
              className="text-xs font-bold"
              style={{ color: weekdayColor }}
            >
              {weekday}
            </span>
            <span
              className="mt-0.5 text-base font-bold tabular-nums"
              style={{
                color: isSelected
                  ? "#1E40AF"
                  : isClosed
                    ? "#9CA3AF"
                    : "#111827",
              }}
            >
              {month}/{date}
            </span>

            <span
              className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold"
              style={{
                color: isClosed
                  ? "#9CA3AF"
                  : isSelected
                    ? "#1E40AF"
                    : "#15803D",
              }}
            >
              {isClosed ? (
                "마감"
              ) : isSelected ? (
                <>
                  <Check className="h-3 w-3" strokeWidth={3} />
                  선택
                </>
              ) : (
                <>가능 ✓</>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
