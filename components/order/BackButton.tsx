"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

interface BackButtonProps {
  fallback?: string
}

export function BackButton({ fallback }: BackButtonProps) {
  const router = useRouter()

  const onClick = () => {
    if (fallback) {
      router.push(fallback)
      return
    }
    router.back()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="뒤로 가기"
      className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
    >
      <ChevronLeft className="h-6 w-6" strokeWidth={2} />
    </button>
  )
}
