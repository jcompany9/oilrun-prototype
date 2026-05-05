"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ShieldCheck } from "lucide-react"
import { accessOptions, type AccessMethod } from "@/lib/mock-data"

function AccessPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<AccessMethod | "">("")
  const [note, setNote] = useState("")

  const selectedOption = accessOptions.find((o) => o.id === selected)
  const needsNote = selectedOption?.needsNote ?? false

  const canProceed =
    selected !== "" && (!needsNote || note.trim().length > 0)

  const onNext = () => {
    if (!canProceed) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("access", selected)
    if (needsNote && note.trim()) {
      params.set("accessNote", note.trim())
    } else {
      params.delete("accessNote")
    }
    router.push(`/order/payment?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-1 flex-col px-6 pt-8 pb-32"
    >
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        차량에 어떻게 접근할까요?
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        정비 중 차주님이 함께 계실 필요 없어요
      </p>

      <div className="flex flex-col gap-3">
        {accessOptions.map((opt) => {
          const isSelected = selected === opt.id
          return (
            <motion.div key={opt.id} layout>
              <button
                type="button"
                onClick={() => {
                  setSelected(opt.id)
                  if (!opt.needsNote) setNote("")
                }}
                className="relative w-full rounded-xl border-2 p-5 text-left transition-all"
                style={{
                  borderColor: isSelected ? "#1E40AF" : "#E5E7EB",
                  backgroundColor: isSelected ? "#F5F8FF" : "#FFFFFF",
                }}
              >
                {opt.recommended && (
                  <span
                    className="absolute -top-2 left-4 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    추천
                  </span>
                )}
                {isSelected && (
                  <span
                    className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: "#1E40AF" }}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
                <div className="flex items-start gap-3 pr-8">
                  <span className="text-3xl leading-none">{opt.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-base font-bold text-gray-900">
                      {opt.title}
                    </p>
                    <p className="mb-1.5 text-sm text-gray-700">
                      {opt.subtitle}
                    </p>
                    <p className="text-xs text-gray-500">{opt.detail}</p>
                    {opt.hint && (
                      <p className="mt-2 text-[11px] text-gray-400">
                        {opt.hint}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isSelected && opt.needsNote && (
                  <motion.div
                    key="note"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                        {opt.noteLabel}
                      </span>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={opt.notePlaceholder}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <aside className="mt-8 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: "#1E40AF" }}
        />
        <div className="text-xs leading-relaxed text-gray-700">
          <p className="mb-1 font-semibold text-gray-900">안전 안내</p>
          정비 과정은 모두 사진으로 기록되며,
          <br />
          정비 전후 차량 상태가 자동 저장됩니다.
          <br />
          24시간 내 작업 보증을 제공합니다.
        </div>
      </aside>

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

export default function AccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          불러오는 중…
        </div>
      }
    >
      <AccessPageInner />
    </Suspense>
  )
}
