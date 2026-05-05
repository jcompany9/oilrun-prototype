"use client"

import { motion } from "framer-motion"
import { CalendarDays } from "lucide-react"
import { formatDateKoreanFull, formatTimeRange } from "@/lib/mock-data"

interface Props {
  date: Date
  time: string
}

export function SelectedDateTime({ date, time }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-5"
      style={{
        background:
          "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
          <CalendarDays className="h-4 w-4 text-white" />
        </span>
        <span className="text-[11px] font-semibold tracking-wider text-blue-200 uppercase">
          예약 일시
        </span>
      </div>

      <p className="text-lg font-bold text-white">
        {formatDateKoreanFull(date)}
      </p>
      <p className="text-base font-semibold text-blue-100">
        {formatTimeRange(time)}
      </p>

      <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-blue-50">
        정비사가 이 시간에 도착합니다
      </p>
    </motion.div>
  )
}
