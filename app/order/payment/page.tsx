"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Car,
  Clock,
  Droplet,
  KeyRound,
  MapPin,
  Plus,
  Check,
} from "lucide-react"
import {
  addOptions,
  getAccessOption,
  menus,
  resolveVehicleFromParams,
  vehicles,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"
import {
  PaymentModal,
  type PaymentMethod as PayMethod,
} from "@/components/order/PaymentModal"

const DELIVERY_FEE = 10000
const VERIFICATION_CODE = "1234"

function PaymentPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const vehicle = useMemo(
    () => resolveVehicleFromParams(searchParams) ?? vehicles[0],
    [searchParams]
  )
  const menu = useMemo(() => {
    const id = searchParams.get("menuId")
    return menus.find((m) => m.id === id) ?? menus[0]
  }, [searchParams])
  const selectedOptions = useMemo(() => {
    const raw = searchParams.get("options")
    if (!raw) return []
    const ids = raw.split(",")
    return addOptions.filter((o) => ids.includes(o.id))
  }, [searchParams])
  const location = searchParams.get("location") ?? ""
  const locationDetail = searchParams.get("locationDetail") ?? ""
  const timeLabel = searchParams.get("timeLabel") ?? ""
  const accessOption = getAccessOption(searchParams.get("access"))

  const total =
    menu.price +
    selectedOptions.reduce((sum, o) => sum + o.price, 0) +
    DELIVERY_FEE

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [codeRequested, setCodeRequested] = useState(false)
  const [code, setCode] = useState("")
  const [verified, setVerified] = useState(false)
  const [activeMethod, setActiveMethod] = useState<PayMethod | null>(null)

  const canPay = name.trim() !== "" && verified && activeMethod === null

  const onChangePhone = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 11)
    let formatted = d
    if (d.length >= 4 && d.length < 8) {
      formatted = `${d.slice(0, 3)}-${d.slice(3)}`
    } else if (d.length >= 8) {
      formatted = `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
    }
    setPhone(formatted)
    if (codeRequested) {
      setCodeRequested(false)
      setCode("")
      setVerified(false)
    }
  }

  const requestCode = () => {
    const digits = phone.replace(/\D/g, "")
    if (digits.length < 10) return
    setCodeRequested(true)
    setVerified(false)
    setCode("")
  }

  const onChangeCode = (raw: string) => {
    const c = raw.replace(/\D/g, "").slice(0, 4)
    setCode(c)
    setVerified(c === VERIFICATION_CODE)
  }

  const pay = (method: PayMethod) => {
    if (!canPay) return
    setActiveMethod(method)
  }

  const onPaymentSuccess = () => {
    if (!activeMethod) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("paymentMethod", activeMethod)
    params.set("payerName", name.trim())
    params.set("payerPhone", phone)
    router.push(`/order/matching?${params.toString()}`)
  }

  const productName = `${vehicle.model} ${menu.name}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-1 flex-col px-6 pt-8 pb-12"
    >
      <h1 className="mb-6 text-2xl font-bold text-gray-900">결제하기</h1>

      <section className="mb-8 rounded-xl bg-gray-50 p-5">
        <ul className="mb-4 flex flex-col gap-2.5">
          <SummaryRow
            icon={<Car className="h-4 w-4" style={{ color: "#1E40AF" }} />}
            text={`${vehicle.model}${vehicle.plate ? ` · ${vehicle.plate}` : ""}`}
          />
          <SummaryRow
            icon={
              <Droplet className="h-4 w-4" style={{ color: "#1E40AF" }} />
            }
            text={menu.name}
          />
          {selectedOptions.map((o) => (
            <SummaryRow
              key={o.id}
              icon={<Plus className="h-4 w-4 text-gray-400" />}
              text={o.name}
              muted
            />
          ))}
          <SummaryRow
            icon={<MapPin className="h-4 w-4" style={{ color: "#1E40AF" }} />}
            text={
              location +
              (locationDetail ? ` (${locationDetail})` : "") || "위치 미지정"
            }
          />
          <SummaryRow
            icon={<Clock className="h-4 w-4" style={{ color: "#1E40AF" }} />}
            text={timeLabel || "시간 미지정"}
          />
          {accessOption && (
            <SummaryRow
              icon={
                <KeyRound className="h-4 w-4" style={{ color: "#1E40AF" }} />
              }
              text={`차량 접근: ${accessOption.title}`}
            />
          )}
        </ul>

        <div className="border-t border-gray-200 pt-4">
          <PriceRow label="작업비" amount={menu.price} />
          {selectedOptions.map((o) => (
            <PriceRow key={o.id} label={o.name} amount={o.price} />
          ))}
          <PriceRow label="출장비" amount={DELIVERY_FEE} />
        </div>

        <div className="mt-3 flex items-center justify-between border-t-2 border-gray-300 pt-3">
          <span className="text-base font-bold text-gray-900">합계</span>
          <span className="text-xl font-bold tabular-nums text-gray-900">
            {formatKRW(total)}
          </span>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-gray-900">연락처 정보</h2>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-medium text-gray-500">
            이름
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
          />
        </label>

        <label className="mb-2 block">
          <span className="mb-1.5 block text-xs font-medium text-gray-500">
            휴대폰
          </span>
          <div className="flex items-center gap-2">
            <input
              value={phone}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder="010-0000-0000"
              inputMode="tel"
              className="h-12 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-base tabular-nums text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
              disabled={verified}
            />
            <button
              type="button"
              onClick={requestCode}
              disabled={
                phone.replace(/\D/g, "").length < 10 || verified
              }
              className="h-12 shrink-0 rounded-lg bg-gray-900 px-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            >
              인증번호 받기
            </button>
          </div>
        </label>

        <AnimatePresence>
          {codeRequested && (
            <motion.div
              key="code-input"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-900">
                인증번호가 발송되었습니다{" "}
                <span className="font-semibold">(시연용: 1234)</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={code}
                  onChange={(e) => onChangeCode(e.target.value)}
                  placeholder="인증번호 4자리"
                  inputMode="numeric"
                  maxLength={4}
                  disabled={verified}
                  className="h-12 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-center text-lg font-bold tabular-nums text-gray-900 placeholder:text-sm placeholder:font-medium placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
                />
                {verified && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex h-12 items-center gap-1.5 rounded-lg bg-green-50 px-3 text-sm font-semibold text-green-700"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                    인증 완료
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">결제 수단</h2>
        {!canPay && !activeMethod && (
          <p className="mb-3 text-xs text-gray-500">
            이름 입력과 휴대폰 인증을 완료해주세요
          </p>
        )}
        <div className="flex flex-col gap-2.5">
          <PayButton
            onClick={() => pay("toss")}
            disabled={!canPay}
            background="#0064FF"
            color="#FFFFFF"
            label="토스페이로 결제"
            emoji="💙"
          />
          <PayButton
            onClick={() => pay("kakao")}
            disabled={!canPay}
            background="#FFEB00"
            color="#191919"
            label="카카오페이로 결제"
            emoji="💛"
          />
          <PayButton
            onClick={() => pay("card")}
            disabled={!canPay}
            background="#111827"
            color="#FFFFFF"
            label="카드로 결제"
            emoji="💳"
          />
        </div>
      </section>

      <PaymentModal
        isOpen={activeMethod !== null}
        onClose={() => setActiveMethod(null)}
        onSuccess={onPaymentSuccess}
        paymentMethod={activeMethod ?? "toss"}
        amount={total}
        productName={productName}
      />
    </motion.div>
  )
}

function SummaryRow({
  icon,
  text,
  muted,
}: {
  icon: React.ReactNode
  text: string
  muted?: boolean
}) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span
        className={`text-sm ${muted ? "text-gray-600" : "text-gray-900 font-medium"}`}
      >
        {text}
      </span>
    </li>
  )
}

function PriceRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm tabular-nums text-gray-900">
        {formatKRW(amount)}
      </span>
    </div>
  )
}

function PayButton({
  onClick,
  disabled,
  background,
  color,
  label,
  emoji,
}: {
  onClick: () => void
  disabled: boolean
  background: string
  color: string
  label: string
  emoji: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
      style={{ backgroundColor: background, color }}
    >
      <span className="text-lg leading-none">{emoji}</span>
      {label}
    </button>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          불러오는 중…
        </div>
      }
    >
      <PaymentPageInner />
    </Suspense>
  )
}
