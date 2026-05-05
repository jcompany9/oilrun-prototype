"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  FileText,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import { formatKRW } from "@/lib/utils"

const FLOW_STEPS = [
  {
    id: "customer",
    icon: CreditCard,
    title: "차주 결제",
    sub: "토스페이먼츠 / 카드 / 카카오페이",
    note: "주문 즉시 결제",
    color: "#1E40AF",
  },
  {
    id: "platform",
    icon: ShieldCheck,
    title: "OilRun 안전 보관",
    sub: "에스크로 계좌에 자금 격리",
    note: "정비 완료 + 차주 확인까지",
    color: "#7C3AED",
  },
  {
    id: "shop",
    icon: Building2,
    title: "정비소 입금",
    sub: "주 1회 · 매주 월요일",
    note: "수수료 차감 후 자동 송금",
    color: "#15803D",
  },
] as const

const CYCLE_CARDS = [
  {
    icon: CalendarClock,
    title: "주간 정산",
    desc: "매주 월~일요일 매출을 모아 다음 주 월요일에 정산해드려요.",
    accent: "#1E40AF",
    bg: "#EFF6FF",
    fg: "#1E3A8A",
    bullets: ["입금일: 매주 월요일", "최소 정산액 100,000원", "VAT 별도 처리"],
  },
  {
    icon: ShieldCheck,
    title: "안전 보관",
    desc: "차주가 결제한 금액은 작업 완료 전까지 OilRun이 안전하게 보관해요.",
    accent: "#F97316",
    bg: "#FFF7ED",
    fg: "#9A3412",
    bullets: [
      "에스크로 계좌 분리 보관",
      "분쟁 시 환불 처리 가능",
      "고객·정비소 양쪽 보호",
    ],
  },
  {
    icon: FileText,
    title: "자동 세금계산서",
    desc: "매월 말 정산 내역을 모아 세금계산서를 자동 발행해드려요.",
    accent: "#15803D",
    bg: "#F0FDF4",
    fg: "#14532D",
    bullets: [
      "매월 말일 자동 발행",
      "이메일 + 홈택스 동시 등록",
      "별도 회계 작업 불필요",
    ],
  },
]

const FAQS: { q: string; a: string }[] = [
  {
    q: "정산은 언제 입금되나요?",
    a: "매주 월요일 오전 9시 전에 입금됩니다. 월요일이 공휴일인 경우 다음 영업일에 입금됩니다.",
  },
  {
    q: "정산 수수료는 얼마인가요?",
    a: "플랫폼 수수료 15%와 PG 수수료 3%를 차감한 금액을 정산해드립니다. VAT는 별도이며 매월 자동 발행되는 세금계산서에 포함됩니다.",
  },
  {
    q: "주문이 환불되면 어떻게 되나요?",
    a: "차주가 결제한 금액은 작업 완료 전까지 OilRun이 보관하므로, 작업 시작 전 환불 시에는 정비소에 별도 차감 없이 처리됩니다. 작업 완료 후 클레임으로 인한 환불은 사례별로 협의 후 처리됩니다.",
  },
  {
    q: "최소 정산액은 얼마인가요?",
    a: "주간 정산액이 100,000원 미만일 경우 다음 주에 누적되어 함께 정산됩니다. 최소 정산액에 도달하지 않은 매출은 자동으로 이월됩니다.",
  },
  {
    q: "세금계산서는 어떻게 받나요?",
    a: "매월 말일 등록된 사업자번호와 이메일로 자동 발행되며, 동시에 홈택스에 등록됩니다. 사업자번호 변경 시 설정에서 수정해주세요.",
  },
]

const TARGET_DATE = new Date(2026, 4, 8, 9, 0, 0)
const EXPECTED_PAYOUT = 875000

function getCountdown(target: Date) {
  const now = new Date(2026, 4, 5, 14, 0, 0)
  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  return { days, hours, minutes }
}

export default function ShopSettlementPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [countdown, setCountdown] = useState(() => getCountdown(TARGET_DATE))

  useEffect(() => {
    setCountdown(getCountdown(TARGET_DATE))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-gray-200 bg-white px-4 sm:px-6">
        <Link
          href="/shop"
          className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          aria-label="뒤로"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 truncate text-base font-bold text-gray-900">
          정산 안내
        </h1>
      </header>

      <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section
          className="overflow-hidden rounded-2xl p-6 text-white shadow-lg sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%)",
          }}
        >
          <div className="mb-1 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-200" />
            <span className="text-[11px] font-semibold tracking-wider text-blue-200 uppercase">
              자금 흐름
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">
            안전한 결제부터 정확한 정산까지
          </h2>
          <p className="mb-7 text-sm text-blue-100">
            차주의 결제 금액은 OilRun이 안전하게 보관한 뒤, 매주 월요일 자동
            정산해드려요.
          </p>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-2">
            {FLOW_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                  className="relative"
                >
                  <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="mb-0.5 text-[10px] font-semibold tracking-wider text-blue-200 uppercase">
                      Step {i + 1}
                    </p>
                    <p className="mb-1 text-base font-bold text-white">
                      {step.title}
                    </p>
                    <p className="mb-2 text-xs text-blue-100">{step.sub}</p>
                    <p className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-blue-50">
                      {step.note}
                    </p>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.15 + 0.3, duration: 0.3 }}
                      className="absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 translate-x-1/2 sm:block"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg">
                        <ArrowRight
                          className="h-3.5 w-3.5"
                          style={{ color: step.color }}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-orange-100 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ backgroundColor: "#FED7AA" }}
                >
                  <CalendarClock className="h-3.5 w-3.5 text-orange-700" />
                </span>
                <span className="text-xs font-bold text-orange-700">
                  다음 정산일
                </span>
              </div>
              <p className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                2026년 5월 8일 (월)
              </p>
              <p className="text-xs text-gray-500">오전 9시 자동 입금</p>
            </div>

            <div className="flex items-center gap-2">
              <CountdownBlock value={countdown.days} label="일" emphasized />
              <span className="text-2xl font-bold text-gray-300">:</span>
              <CountdownBlock value={countdown.hours} label="시간" />
              <span className="text-2xl font-bold text-gray-300">:</span>
              <CountdownBlock value={countdown.minutes} label="분" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-3">
            <Stat label="이번 주 매출" value="1,030,000원" />
            <Stat label="수수료 (15%)" value="-154,500원" tone="deduct" />
            <Stat
              label="예상 정산액"
              value={formatKRW(EXPECTED_PAYOUT)}
              tone="primary"
            />
          </div>

          <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
            ※ 실제 정산액은 환불·클레임 반영 후 확정됩니다.
          </div>
        </section>

        <section>
          <h3 className="mb-3 px-1 text-base font-bold text-gray-900">
            정산 시스템의 3가지 핵심
          </h3>
          <div className="grid gap-3 lg:grid-cols-3">
            {CYCLE_CARDS.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.article
                  key={c.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-5 shadow-sm ring-1 ring-gray-200"
                  style={{ backgroundColor: c.bg }}
                >
                  <div
                    className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: c.accent + "33" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: c.accent }} />
                  </div>
                  <h4
                    className="mb-1.5 text-base font-bold"
                    style={{ color: c.fg }}
                  >
                    {c.title}
                  </h4>
                  <p
                    className="mb-4 text-xs leading-relaxed"
                    style={{ color: c.fg, opacity: 0.85 }}
                  >
                    {c.desc}
                  </p>
                  <ul className="space-y-1.5">
                    {c.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: c.fg }}
                      >
                        <span
                          className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: c.accent }}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
          <h3 className="mb-1 text-base font-bold text-gray-900">자주 묻는 질문</h3>
          <p className="mb-4 text-xs text-gray-500">
            정산에 대해 가장 많이 묻는 내용을 모았어요
          </p>
          <ul className="divide-y divide-gray-100">
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center gap-3 py-4 text-left transition-colors"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                      style={{
                        backgroundColor: open ? "#1E40AF" : "#EFF6FF",
                        color: open ? "#FFFFFF" : "#1E40AF",
                      }}
                    >
                      Q
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-900">
                      {f.q}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-gray-400 transition-transform"
                      style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-9 pb-4 pr-2">
                          <p className="rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">
                            {f.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </section>

        <p className="text-center text-[11px] text-gray-400">
          시연용 화면 · 실제 정산은 가맹 계약서에 따릅니다
        </p>
      </div>
    </div>
  )
}

function CountdownBlock({
  value,
  label,
  emphasized,
}: {
  value: number
  label: string
  emphasized?: boolean
}) {
  return (
    <div
      className="flex w-14 flex-col items-center rounded-xl px-2 py-2 sm:w-16"
      style={{
        backgroundColor: emphasized ? "#1E40AF" : "#F3F4F6",
        color: emphasized ? "#FFFFFF" : "#111827",
      }}
    >
      <span className="text-2xl font-bold tabular-nums sm:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="text-[10px]"
        style={{ color: emphasized ? "#BFDBFE" : "#6B7280" }}
      >
        {label}
      </span>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "primary" | "deduct"
}) {
  const color =
    tone === "primary" ? "#1E40AF" : tone === "deduct" ? "#B91C1C" : "#111827"
  return (
    <div>
      <p className="mb-1 text-[11px] text-gray-500">{label}</p>
      <p
        className="text-base font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  )
}
