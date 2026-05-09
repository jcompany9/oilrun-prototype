"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, Clock, Coffee, RotateCcw } from "lucide-react"

export interface CalendarSettings {
  openHour: number // 9
  closeHour: number // 19
  lunchStartHour: number // 12
  lunchEndHour: number // 13
}

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  openHour: 9,
  closeHour: 19,
  lunchStartHour: 12,
  lunchEndHour: 13,
}

// 행 높이는 76px 고정 (overlap 시 lane 수만큼 확장)
export const FIXED_ROW_HEIGHT = 76

const HOUR_OPTIONS = Array.from({ length: 25 }, (_, i) => i) // 0~24

export function CalendarSettingsDialog({
  open,
  onClose,
  settings,
  onSave,
}: {
  open: boolean
  onClose: () => void
  settings: CalendarSettings
  onSave: (next: CalendarSettings) => void
}) {
  const [local, setLocal] = useState(settings)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setLocal(settings)
      setError(null)
    }
  }, [open, settings])

  function handleSave() {
    if (local.closeHour <= local.openHour) {
      setError("종료 시간은 시작 시간보다 늦어야 합니다")
      return
    }
    if (local.lunchEndHour <= local.lunchStartHour) {
      setError("점심 종료가 시작보다 늦어야 합니다")
      return
    }
    if (
      local.lunchStartHour < local.openHour ||
      local.lunchEndHour > local.closeHour
    ) {
      setError("점심시간은 영업시간 안에 있어야 합니다")
      return
    }
    onSave(local)
    onClose()
  }

  function handleReset() {
    setLocal(DEFAULT_CALENDAR_SETTINGS)
    setError(null)
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
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-4 top-8 bottom-8 z-50 mx-auto flex max-w-md flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[80vh] sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">캘린더 설정</h2>
                <p className="text-xs text-gray-500">영업시간 · 점심시간</p>
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

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <Section title="영업 시간" icon={Clock}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="시작">
                    <HourSelect
                      value={local.openHour}
                      onChange={(v) => setLocal({ ...local, openHour: v })}
                    />
                  </Field>
                  <Field label="종료">
                    <HourSelect
                      value={local.closeHour}
                      onChange={(v) => setLocal({ ...local, closeHour: v })}
                    />
                  </Field>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  현재: {local.openHour}:00 ~ {local.closeHour}:00 ({local.closeHour - local.openHour}시간)
                </p>
              </Section>

              <Section title="점심 시간" icon={Coffee}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="시작">
                    <HourSelect
                      value={local.lunchStartHour}
                      onChange={(v) => setLocal({ ...local, lunchStartHour: v })}
                    />
                  </Field>
                  <Field label="종료">
                    <HourSelect
                      value={local.lunchEndHour}
                      onChange={(v) => setLocal({ ...local, lunchEndHour: v })}
                    />
                  </Field>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  점심시간엔 캘린더에 빗금 표시 (예약은 가능)
                </p>
              </Section>

              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                <RotateCcw className="h-3 w-3" />
                기본값
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#1E40AF" }}
                >
                  저장
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function HourSelect({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm tabular-nums"
    >
      {HOUR_OPTIONS.map((h) => (
        <option key={h} value={h}>
          {String(h).padStart(2, "0")}:00
        </option>
      ))}
    </select>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Clock
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-gray-600">
        {label}
      </label>
      {children}
    </div>
  )
}
