"use client"

import { usePathname } from "next/navigation"
import { BackButton } from "@/components/order/BackButton"
import { ProgressIndicator } from "@/components/order/ProgressIndicator"

const STEP_MAP: Record<string, number> = {
  "/order/start": 1,
  "/order/vehicle": 2,
  "/order/menu": 3,
  "/order/location": 4,
  "/order/time": 5,
  "/order/access": 6,
  "/order/payment": 7,
  "/order/matching": 8,
}

const TOTAL_STEPS = 9

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const knownStep = STEP_MAP[pathname]
  const isMatching = pathname === "/order/matching"
  const isHistory = pathname === "/order/history"
  const isOrderDetail =
    !knownStep &&
    !isHistory &&
    pathname.startsWith("/order/") &&
    pathname !== "/order"
  const titledHeader = isOrderDetail || isHistory
  const headerTitle = isHistory ? "내 예약내역" : "주문 상세"

  const backFallback =
    knownStep === 1 || titledHeader ? "/" : undefined

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white">
        {titledHeader ? (
          <div className="mx-auto flex h-14 w-full max-w-md items-center px-4">
            <BackButton fallback="/" />
            <h1 className="flex-1 text-center text-base font-bold text-gray-900">
              {headerTitle}
            </h1>
            <div className="w-10" />
          </div>
        ) : (
          <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
            {isMatching ? (
              <div className="w-10" />
            ) : (
              <BackButton fallback={backFallback} />
            )}
            <div className="flex items-center gap-3">
              <ProgressIndicator
                currentStep={knownStep ?? 1}
                totalSteps={TOTAL_STEPS}
              />
              <span className="text-sm font-medium text-gray-500 tabular-nums">
                {knownStep ?? 1}/{TOTAL_STEPS}
              </span>
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
