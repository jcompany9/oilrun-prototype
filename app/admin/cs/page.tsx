"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Send } from "lucide-react"
import {
  csQuickReplies,
  csTickets,
  type CsTicket,
} from "@/lib/admin-mock"

const STATUS_BADGE: Record<
  CsTicket["status"],
  { label: string; bg: string; fg: string }
> = {
  open: { label: "미응답", bg: "#FEE2E2", fg: "#B91C1C" },
  in_progress: { label: "응답중", bg: "#FEF3C7", fg: "#A16207" },
  closed: { label: "완료", bg: "#E5E7EB", fg: "#374151" },
}

const CATEGORY_LABEL: Record<CsTicket["category"], string> = {
  delivery: "정비사",
  payment: "결제",
  refund: "환불",
  service: "정비",
  other: "기타",
}

export default function AdminCsPage() {
  const [filter, setFilter] = useState<CsTicket["status"] | "all">("all")
  const [selectedId, setSelectedId] = useState<string>(csTickets[0]?.id ?? "")
  const [reply, setReply] = useState("")

  const filtered = useMemo(() => {
    if (filter === "all") return csTickets
    return csTickets.filter((t) => t.status === filter)
  }, [filter])

  const selected = csTickets.find((t) => t.id === selectedId) ?? filtered[0]

  const send = () => {
    if (!reply.trim() || !selected) return
    toast.success("응답이 발송되었습니다", {
      description: `${selected.customer}님에게 알림톡 발송`,
    })
    setReply("")
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col px-4 py-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-1 overflow-hidden">
          <aside className="flex w-full max-w-sm shrink-0 flex-col border-r border-gray-200">
            <div className="flex items-center gap-1.5 border-b border-gray-200 p-3">
              {(
                [
                  ["all", "전체"],
                  ["open", "미응답"],
                  ["in_progress", "응답중"],
                  ["closed", "완료"],
                ] as const
              ).map(([v, label]) => {
                const active = filter === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFilter(v as typeof filter)}
                    className="h-8 rounded-full px-3 text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: active ? "#1E40AF" : "#F3F4F6",
                      color: active ? "#FFFFFF" : "#374151",
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <ul className="flex-1 overflow-y-auto">
              {filtered.map((t) => {
                const isSel = selected?.id === t.id
                const badge = STATUS_BADGE[t.status]
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className="flex w-full flex-col gap-1 border-b border-gray-100 px-4 py-3 text-left transition-colors"
                      style={{ backgroundColor: isSel ? "#EFF6FF" : "white" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {t.customer}
                        </span>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.fg,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-sm text-gray-700">
                        {t.subject}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>[{CATEGORY_LABEL[t.category]}]</span>
                        <span className="tabular-nums">{t.createdAt}</span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          <main className="flex flex-1 flex-col overflow-hidden">
            {selected ? (
              <>
                <header className="border-b border-gray-200 px-6 py-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{
                        backgroundColor: STATUS_BADGE[selected.status].bg,
                        color: STATUS_BADGE[selected.status].fg,
                      }}
                    >
                      {STATUS_BADGE[selected.status].label}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-gray-500">
                      {selected.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selected.subject}
                  </h2>
                  <p className="mt-1 text-xs text-gray-600">
                    {selected.customer} · {selected.phone} · [
                    {CATEGORY_LABEL[selected.category]}]
                  </p>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-gray-50 p-4"
                  >
                    <p className="mb-1 text-xs font-semibold text-gray-500">
                      차주 문의
                    </p>
                    <p className="whitespace-pre-line text-sm text-gray-800">
                      {selected.body}
                    </p>
                    <p className="mt-2 text-[11px] text-gray-400">
                      {selected.createdAt}
                    </p>
                  </motion.div>

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold text-gray-700">
                      자주 쓰는 답변
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {csQuickReplies.map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setReply(q.body)}
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="응답을 입력하세요"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-800 focus:outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        toast(`${selected.customer} 문의를 완료 처리했습니다`)
                      }
                      className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      완료 처리
                    </button>
                    <button
                      type="button"
                      onClick={send}
                      disabled={!reply.trim()}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white transition-opacity disabled:opacity-40"
                      style={{ backgroundColor: "#1E40AF" }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      응답 보내기
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
                문의를 선택하세요
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
