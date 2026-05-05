"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Delete, X } from "lucide-react"
import { formatKRW } from "@/lib/utils"

export type PaymentMethod = "toss" | "kakao" | "card"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  paymentMethod: PaymentMethod
  amount: number
  productName: string
}

type Step = "confirm" | "auth" | "processing" | "complete"

interface BrandConfig {
  logoText: string
  logoClass: string
  bg: string
  fg: string
  confirmTitle: string
  authTitle: string
  amountColor: string
  introText: string
}

const BRAND: Record<PaymentMethod, BrandConfig> = {
  toss: {
    logoText: "toss",
    logoClass: "text-2xl font-bold tracking-tight italic",
    bg: "#0064FF",
    fg: "#FFFFFF",
    confirmTitle: "토스페이 결제",
    authTitle: "토스 비밀번호를 입력해주세요",
    amountColor: "#0064FF",
    introText: "토스 비밀번호 입력 후 결제가 완료됩니다.",
  },
  kakao: {
    logoText: "kakaopay",
    logoClass: "text-xl font-extrabold tracking-tight",
    bg: "#FFEB00",
    fg: "#191919",
    confirmTitle: "카카오페이 결제",
    authTitle: "카카오페이 비밀번호 입력",
    amountColor: "#191919",
    introText: "카카오페이 비밀번호 입력 후 결제가 완료됩니다.",
  },
  card: {
    logoText: "CARD",
    logoClass: "text-base font-semibold tracking-[0.3em]",
    bg: "#111827",
    fg: "#FFFFFF",
    confirmTitle: "카드 결제",
    authTitle: "카드 정보를 입력해주세요",
    amountColor: "#111827",
    introText: "카드 정보 입력 후 결제가 완료됩니다.",
  },
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  paymentMethod,
  amount,
  productName,
}: PaymentModalProps) {
  const brand = BRAND[paymentMethod]
  const [step, setStep] = useState<Step>("confirm")
  const [password, setPassword] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [cardPw, setCardPw] = useState("")

  const orderNumber = useMemo(() => {
    if (!isOpen) return ""
    const d = new Date()
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
    const seq = String(Math.floor(Math.random() * 9000) + 1000)
    return `OR-${ymd}-${seq}`
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep("confirm")
        setPassword("")
        setCardNumber("")
        setExpiry("")
        setCvc("")
        setCardPw("")
      }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (step === "processing") {
      const t = setTimeout(() => setStep("complete"), 1500)
      return () => clearTimeout(t)
    }
    if (step === "complete") {
      const t = setTimeout(() => onSuccess(), 1000)
      return () => clearTimeout(t)
    }
  }, [step, isOpen, onSuccess])

  useEffect(() => {
    if (
      (paymentMethod === "toss" || paymentMethod === "kakao") &&
      step === "auth" &&
      password.length === 6
    ) {
      const t = setTimeout(() => setStep("processing"), 200)
      return () => clearTimeout(t)
    }
  }, [password, step, paymentMethod])

  const onConfirm = () => setStep("auth")

  const cardComplete =
    cardNumber.replace(/\D/g, "").length === 16 &&
    expiry.length === 5 &&
    cvc.length === 3 &&
    cardPw.length === 2

  const onCardSubmit = () => {
    if (cardComplete) setStep("processing")
  }

  const fillDemo = () => {
    if (step === "confirm") {
      setStep("processing")
      return
    }
    if (paymentMethod === "toss" || paymentMethod === "kakao") {
      setPassword("123456")
      return
    }
    setCardNumber("4444-4444-4444-4444")
    setExpiry("12/29")
    setCvc("123")
    setCardPw("12")
    setTimeout(() => setStep("processing"), 200)
  }

  const showDemoLink = step === "confirm" || step === "auth"

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:max-h-[80vh] sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95"
        >
          <DialogPrimitive.Title className="sr-only">
            {brand.confirmTitle}
          </DialogPrimitive.Title>

          <header
            className="flex items-center justify-between px-5 py-4"
            style={{ backgroundColor: brand.bg, color: brand.fg }}
          >
            <span className={brand.logoClass}>{brand.logoText}</span>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="닫기"
                className="-mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                style={{ color: brand.fg }}
              >
                <X className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </DialogPrimitive.Close>
          </header>

          <div className="relative flex flex-1 flex-col overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              {step === "confirm" && (
                <StepView key="confirm">
                  <ConfirmStep
                    brand={brand}
                    productName={productName}
                    amount={amount}
                    onConfirm={onConfirm}
                  />
                </StepView>
              )}
              {step === "auth" &&
                (paymentMethod === "toss" || paymentMethod === "kakao") && (
                  <StepView key="auth-pw">
                    <PasswordStep
                      title={brand.authTitle}
                      brandColor={brand.bg}
                      value={password}
                      onChange={setPassword}
                    />
                  </StepView>
                )}
              {step === "auth" && paymentMethod === "card" && (
                <StepView key="auth-card">
                  <CardStep
                    title={brand.authTitle}
                    brand={brand}
                    cardNumber={cardNumber}
                    setCardNumber={setCardNumber}
                    expiry={expiry}
                    setExpiry={setExpiry}
                    cvc={cvc}
                    setCvc={setCvc}
                    cardPw={cardPw}
                    setCardPw={setCardPw}
                    canSubmit={cardComplete}
                    onSubmit={onCardSubmit}
                  />
                </StepView>
              )}
              {step === "processing" && (
                <StepView key="processing">
                  <ProcessingStep brand={brand} />
                </StepView>
              )}
              {step === "complete" && (
                <StepView key="complete">
                  <CompleteStep amount={amount} orderNumber={orderNumber} />
                </StepView>
              )}
            </AnimatePresence>

            {showDemoLink && (
              <div className="flex justify-end px-4 pb-3">
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-xs text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
                >
                  (시연용 자동입력)
                </button>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function StepView({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  )
}

function ConfirmStep({
  brand,
  productName,
  amount,
  onConfirm,
}: {
  brand: BrandConfig
  productName: string
  amount: number
  onConfirm: () => void
}) {
  return (
    <div className="flex flex-1 flex-col px-6 py-7">
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        {brand.confirmTitle}
      </h2>
      <dl className="mb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-500">가맹점</dt>
          <dd className="text-sm font-semibold text-gray-900">OilRun</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-sm text-gray-500">상품명</dt>
          <dd className="text-right text-sm font-medium text-gray-900">
            {productName}
          </dd>
        </div>
      </dl>
      <div className="mb-5 rounded-xl bg-gray-50 p-5 text-center">
        <p className="mb-1 text-xs text-gray-500">결제 금액</p>
        <p
          className="text-3xl font-bold tabular-nums"
          style={{ color: brand.amountColor }}
        >
          {formatKRW(amount)}
        </p>
      </div>
      <p className="mb-6 text-xs leading-relaxed text-gray-500">
        {brand.introText}
      </p>
      <button
        type="button"
        onClick={onConfirm}
        className="h-14 w-full rounded-xl text-base font-bold transition-opacity hover:opacity-90"
        style={{ backgroundColor: brand.bg, color: brand.fg }}
      >
        결제하기
      </button>
    </div>
  )
}

function PasswordStep({
  title,
  brandColor,
  value,
  onChange,
}: {
  title: string
  brandColor: string
  value: string
  onChange: (v: string) => void
}) {
  const press = (digit: string) => {
    if (value.length >= 6) return
    onChange((value + digit).slice(0, 6))
  }
  const backspace = () => onChange(value.slice(0, -1))
  const clear = () => onChange("")

  const dots = Array.from({ length: 6 }, (_, i) => i < value.length)

  const KEYS: (string | "back" | "clear")[] = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "clear",
    "0",
    "back",
  ]

  return (
    <div className="flex flex-1 flex-col px-6 py-7">
      <h2 className="mb-6 text-center text-lg font-bold text-gray-900">
        {title}
      </h2>
      <div className="mb-8 flex justify-center gap-3">
        {dots.map((filled, i) => (
          <span
            key={i}
            className="h-3.5 w-3.5 rounded-full transition-all"
            style={{
              backgroundColor: filled ? brandColor : "#E5E7EB",
              transform: filled ? "scale(1)" : "scale(0.85)",
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => {
          if (k === "back") {
            return (
              <button
                key="back"
                type="button"
                onClick={backspace}
                className="flex h-14 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <Delete className="h-5 w-5" strokeWidth={1.75} />
              </button>
            )
          }
          if (k === "clear") {
            return (
              <button
                key="clear"
                type="button"
                onClick={clear}
                className="flex h-14 items-center justify-center rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                전체삭제
              </button>
            )
          }
          return (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className="flex h-14 items-center justify-center rounded-lg text-2xl font-semibold text-gray-900 transition-colors hover:bg-gray-100 active:bg-gray-200"
            >
              {k}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CardStep({
  title,
  brand,
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvc,
  setCvc,
  cardPw,
  setCardPw,
  canSubmit,
  onSubmit,
}: {
  title: string
  brand: BrandConfig
  cardNumber: string
  setCardNumber: (v: string) => void
  expiry: string
  setExpiry: (v: string) => void
  cvc: string
  setCvc: (v: string) => void
  cardPw: string
  setCardPw: (v: string) => void
  canSubmit: boolean
  onSubmit: () => void
}) {
  const formatCardNumber = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 16)
    return d.replace(/(\d{4})(?=\d)/g, "$1-")
  }
  const formatExpiry = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 4)
    if (d.length < 3) return d
    return `${d.slice(0, 2)}/${d.slice(2)}`
  }

  return (
    <div className="flex flex-1 flex-col px-6 py-7">
      <h2 className="mb-6 text-lg font-bold text-gray-900">{title}</h2>

      <label className="mb-3 block">
        <span className="mb-1.5 block text-xs font-medium text-gray-500">
          카드 번호
        </span>
        <input
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="0000-0000-0000-0000"
          inputMode="numeric"
          className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base tabular-nums text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
        />
      </label>

      <div className="mb-3 flex gap-2">
        <label className="block flex-1">
          <span className="mb-1.5 block text-xs font-medium text-gray-500">
            유효기간
          </span>
          <input
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            inputMode="numeric"
            maxLength={5}
            className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base tabular-nums text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
          />
        </label>
        <label className="block flex-1">
          <span className="mb-1.5 block text-xs font-medium text-gray-500">
            CVC
          </span>
          <input
            value={cvc}
            onChange={(e) =>
              setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
            }
            placeholder="000"
            inputMode="numeric"
            maxLength={3}
            className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base tabular-nums text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
          />
        </label>
      </div>

      <label className="mb-6 block">
        <span className="mb-1.5 block text-xs font-medium text-gray-500">
          비밀번호 앞 2자리
        </span>
        <input
          value={cardPw}
          onChange={(e) =>
            setCardPw(e.target.value.replace(/\D/g, "").slice(0, 2))
          }
          placeholder="••"
          inputMode="numeric"
          type="password"
          maxLength={2}
          className="h-12 w-32 rounded-lg border border-gray-200 bg-white px-3 text-center text-lg font-bold tracking-widest text-gray-900 placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
        />
      </label>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="h-14 w-full rounded-xl text-base font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ backgroundColor: brand.bg, color: brand.fg }}
      >
        다음
      </button>
    </div>
  )
}

function ProcessingStep({ brand }: { brand: BrandConfig }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: brand.bg }}
      >
        <span className={brand.logoClass} style={{ color: brand.fg }}>
          {brand.logoText}
        </span>
      </motion.div>
      <p className="mb-1 text-base font-semibold text-gray-900">
        결제 처리 중…
      </p>
      <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
    </div>
  )
}

function CompleteStep({
  amount,
  orderNumber,
}: {
  amount: number
  orderNumber: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
      >
        <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
      </motion.div>
      <p className="mb-2 text-lg font-bold text-gray-900">
        결제가 완료되었습니다
      </p>
      <p
        className="mb-4 text-2xl font-bold tabular-nums"
        style={{ color: "#111827" }}
      >
        {formatKRW(amount)}
      </p>
      <p className="text-xs text-gray-500">
        주문번호: <span className="tabular-nums">{orderNumber}</span>
      </p>
    </div>
  )
}
