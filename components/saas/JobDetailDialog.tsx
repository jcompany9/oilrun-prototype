"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { X, ExternalLink } from "lucide-react"
import type { SaasJob } from "@/lib/mock-data"
import { JobDetailContent } from "./JobDetailContent"

// 캘린더 카드 클릭 시 열리는 상세 팝업 (페이지 전체를 모달로 띄움)
export function JobDetailDialog({
  job,
  onClose,
  onDelete,
}: {
  job: SaasJob | null
  onClose: () => void
  onDelete?: (id: string) => void
}) {
  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-4 top-4 bottom-4 z-50 mx-auto flex max-w-2xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[92vh] sm:w-[640px] sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            {/* close button (overlay top-right) */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-5 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                작업 상세
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/saas/jobs/${job.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-100"
                  title="새 페이지로 열기"
                >
                  <ExternalLink className="h-3 w-3" />
                  페이지로
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="닫기"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 sm:px-5">
              <JobDetailContent
                job={job}
                onDelete={
                  onDelete
                    ? (id) => {
                        onDelete(id)
                        onClose()
                      }
                    : undefined
                }
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
