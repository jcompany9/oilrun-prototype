"use client"

import { useEffect, useState } from "react"
import { useInbox } from "@/lib/contexts/saas-inbox"

// HTML5 drag 중 커서를 따라다니는 ghost 카드
// (HTML5 drag 동안 mousemove가 fire되지 않으므로 dragover 사용)
export function DragGhost() {
  const inbox = useInbox()
  const placementBooking = inbox.placementBooking
  const cancelPlacement = inbox.cancelPlacement
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!placementBooking) {
      setPos(null)
      return
    }

    function onDragOver(e: DragEvent) {
      // dragover는 element 위에서 fire — clientX/Y 유효
      if (e.clientX > 0 || e.clientY > 0) {
        setPos({ x: e.clientX, y: e.clientY })
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") cancelPlacement()
    }

    document.addEventListener("dragover", onDragOver)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("dragover", onDragOver)
      window.removeEventListener("keydown", onKey)
    }
  }, [placementBooking, cancelPlacement])

  if (!placementBooking) return null

  return (
    <div
      className="pointer-events-none fixed z-[100] flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold shadow-xl"
      style={{
        left: (pos?.x ?? 0) + 14,
        top: (pos?.y ?? 0) + 14,
        opacity: pos ? 1 : 0,
        backgroundColor: "#FFF7ED",
        borderColor: "#F97316",
        color: "#C2410C",
      }}
    >
      <span>📌</span>
      <span>{placementBooking.customerName}</span>
      <span className="text-[10px] font-medium opacity-70">
        ({placementBooking.vehicleModel})
      </span>
    </div>
  )
}
