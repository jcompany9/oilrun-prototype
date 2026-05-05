"use client"

import { Check } from "lucide-react"
import { formatTimeRange, type DaySlot } from "@/lib/mock-data"

interface Props {
  slots: DaySlot[] | null
  selected: string
  onSelect: (time: string) => void
}

function isMorning(time: string) {
  const [h] = time.split(":")
  return Number(h) < 13
}

export function TimeSlotPicker({ slots, selected, onSelect }: Props) {
  if (!slots) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500">
        먼저 날짜를 선택해주세요
      </div>
    )
  }

  const morning = slots.filter((s) => isMorning(s.time))
  const afternoon = slots.filter((s) => !isMorning(s.time))

  return (
    <div className="space-y-4">
      <SlotGroup
        title="오전"
        slots={morning}
        selected={selected}
        onSelect={onSelect}
      />
      <SlotGroup
        title="오후"
        slots={afternoon}
        selected={selected}
        onSelect={onSelect}
      />
    </div>
  )
}

function SlotGroup({
  title,
  slots,
  selected,
  onSelect,
}: {
  title: string
  slots: DaySlot[]
  selected: string
  onSelect: (time: string) => void
}) {
  if (slots.length === 0) return null
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-500">{title}</p>
      <ul className="grid grid-cols-2 gap-2">
        {slots.map((s) => (
          <SlotButton
            key={s.time}
            slot={s}
            selected={selected === s.time}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  )
}

function SlotButton({
  slot,
  selected,
  onSelect,
}: {
  slot: DaySlot
  selected: boolean
  onSelect: (time: string) => void
}) {
  const closed = !slot.available
  return (
    <li>
      <button
        type="button"
        onClick={() => !closed && onSelect(slot.time)}
        disabled={closed}
        className="flex h-14 w-full items-center justify-between rounded-xl border-2 px-4 text-left transition-all"
        style={{
          borderColor: selected ? "#1E40AF" : "#E5E7EB",
          backgroundColor: selected
            ? "#EFF6FF"
            : closed
              ? "#F3F4F6"
              : "#FFFFFF",
          cursor: closed ? "not-allowed" : "pointer",
          opacity: closed ? 0.6 : 1,
        }}
      >
        <span
          className="text-sm font-bold tabular-nums"
          style={{
            color: selected ? "#1E40AF" : closed ? "#9CA3AF" : "#111827",
          }}
        >
          {formatTimeRange(slot.time)}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-semibold"
          style={{
            color: closed ? "#9CA3AF" : selected ? "#1E40AF" : "#15803D",
          }}
        >
          {closed ? (
            "예약 마감"
          ) : selected ? (
            <>
              <Check className="h-3 w-3" strokeWidth={3} />
              선택
            </>
          ) : (
            "가능"
          )}
        </span>
      </button>
    </li>
  )
}
