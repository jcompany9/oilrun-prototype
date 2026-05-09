"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import type { SaasIncomingBooking } from "@/lib/mock-data"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// 들어오는 예약 인박스 — 전역 상태
//   · SaaS 헤더의 🔔 알림 bell이 카운트·트리거를 표시
//   · 캘린더 페이지가 자동 배정 핸들러 등록
//   · Drawer는 SaasShell이 렌더 (전역)

interface InboxContextValue {
  incoming: SaasIncomingBooking[]
  loading: boolean
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  refresh: () => Promise<void>
  // 캘린더가 자동 배정 핸들러 등록
  registerAutoAssign: (handler: (() => void) | null) => void
  // Drawer가 호출
  runAutoAssign: () => void
  // 수동 배정 모드 (특정 부킹을 캘린더 빈 슬롯에 배치)
  placementBooking: SaasIncomingBooking | null
  startPlacement: (b: SaasIncomingBooking) => void
  cancelPlacement: () => void
  // 우측 인박스 사이드바 collapse 상태
  inboxCollapsed: boolean
  toggleInboxCollapsed: () => void
  expandInbox: () => void
  // 부킹별 사용자가 설정한 작업 시간 (드래그 가능 조건)
  bookingDurations: Record<string, number>
  setBookingDuration: (bookingId: string, durationMin: number) => void
  getBookingDuration: (bookingId: string) => number | undefined
}

const InboxContext = createContext<InboxContextValue | null>(null)

export function InboxProvider({ children }: { children: ReactNode }) {
  const [incoming, setIncoming] = useState<SaasIncomingBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [placementBooking, setPlacementBooking] = useState<SaasIncomingBooking | null>(null)
  const [inboxCollapsed, setInboxCollapsed] = useState(true)
  const [bookingDurations, setBookingDurations] = useState<Record<string, number>>({})
  const autoAssignRef = useRef<(() => void) | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/saas/bookings/incoming")
      if (!res.ok) throw new Error(`${res.status}`)
      const data = (await res.json()) as SaasIncomingBooking[]
      setIncoming(data)
    } catch (e) {
      console.error("부킹 인박스 로드 실패:", e)
      toast.error("부킹 인박스 로드 실패", { description: String(e) })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // ─── Supabase Realtime: Booking 변경 시 자동 refresh
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const channel = supabase
      .channel("inbox-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Booking" },
        (payload) => {
          // 새 부킹이 INSERT 되면 toast 알림
          if (payload.eventType === "INSERT") {
            const row = payload.new as { customerName?: string }
            toast("🔔 새 예약이 들어왔어요", {
              description: row.customerName ?? "",
            })
          }
          // 짧은 시간 내 여러 변경은 한 번에 refresh (debounce 200ms)
          if (debounceTimer) clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            refresh()
          }, 200)
        }
      )
      .subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [refresh])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), [])

  const registerAutoAssign = useCallback((handler: (() => void) | null) => {
    autoAssignRef.current = handler
  }, [])

  const runAutoAssign = useCallback(() => {
    autoAssignRef.current?.()
  }, [])

  const startPlacement = useCallback((b: SaasIncomingBooking) => {
    setPlacementBooking(b)
  }, [])
  const cancelPlacement = useCallback(() => setPlacementBooking(null), [])
  const toggleInboxCollapsed = useCallback(() => setInboxCollapsed((c) => !c), [])
  const expandInbox = useCallback(() => setInboxCollapsed(false), [])

  const setBookingDuration = useCallback((id: string, dur: number) => {
    setBookingDurations((prev) => ({ ...prev, [id]: dur }))
  }, [])
  const getBookingDuration = useCallback(
    (id: string) => bookingDurations[id],
    [bookingDurations]
  )

  return (
    <InboxContext.Provider
      value={{
        incoming,
        loading,
        drawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        refresh,
        registerAutoAssign,
        runAutoAssign,
        placementBooking,
        startPlacement,
        cancelPlacement,
        inboxCollapsed,
        toggleInboxCollapsed,
        expandInbox,
        bookingDurations,
        setBookingDuration,
        getBookingDuration,
      }}
    >
      {children}
    </InboxContext.Provider>
  )
}

export function useInbox() {
  const ctx = useContext(InboxContext)
  if (!ctx) throw new Error("useInbox must be used inside <InboxProvider>")
  return ctx
}
