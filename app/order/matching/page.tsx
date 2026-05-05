"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Wrench } from "lucide-react"

const MOCK_ORDER_ID = "OR-20260505-0001"

const STAGES = [
  "결제가 완료되었어요",
  "인근 정비소에 알리는 중...",
  "정비소 배정 대기",
  "출발 준비",
]

function MatchingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [doneCount, setDoneCount] = useState(1)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setActiveIdx(1), 1000)
    const t2 = setTimeout(() => {
      setDoneCount(2)
      setActiveIdx(2)
    }, 2500)
    const t3 = setTimeout(() => {
      setDoneCount(3)
      setActiveIdx(3)
    }, 3500)
    const t4 = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      router.push(`/order/${MOCK_ORDER_ID}?${params.toString()}`)
    }, 4000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [router, searchParams])

  return (
    <div className="flex flex-1 flex-col items-center px-6 pt-12 pb-10">
      <div className="relative mb-10 flex h-32 w-32 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#1E40AF" }}
            animate={{ scale: [1, 2, 2], opacity: [0.35, 0, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut",
            }}
          />
        ))}
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: "#1E40AF" }}
        >
          <Wrench className="h-11 w-11 text-white" strokeWidth={2} />
        </div>
      </div>

      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
        정비소를 찾고 있어요...
      </h1>
      <p className="mb-10 text-center text-sm text-gray-600">
        보통 1–3분 정도 걸려요
      </p>

      <ul className="mb-8 flex w-full flex-col gap-3.5">
        {STAGES.map((label, i) => {
          const done = i < doneCount
          const active = activeIdx === i && !done
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                  done
                    ? "bg-blue-700"
                    : active
                      ? "bg-blue-100"
                      : "bg-gray-100"
                }`}
              >
                {done && (
                  <Check
                    className="h-3.5 w-3.5 text-white"
                    strokeWidth={3}
                  />
                )}
                {active && (
                  <span
                    className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"
                    aria-hidden
                  />
                )}
                {!done && !active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                )}
              </span>
              <span
                className={`text-sm font-medium ${
                  done
                    ? "text-gray-900"
                    : active
                      ? "text-blue-900"
                      : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </motion.li>
          )
        })}
      </ul>

      <div className="w-full rounded-xl bg-gray-50 px-4 py-3 text-center">
        <p className="text-xs leading-relaxed text-gray-600">
          💡 정비사가 배정되면 알림으로 알려드려요
        </p>
      </div>
    </div>
  )
}

export default function MatchingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          불러오는 중…
        </div>
      }
    >
      <MatchingPageInner />
    </Suspense>
  )
}
