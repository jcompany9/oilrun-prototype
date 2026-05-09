"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowUpRight,
  Copy,
  Eye,
  MousePointerClick,
  Calendar,
  Banknote,
  Sparkles,
  Trophy,
  PlayCircle,
  ExternalLink,
} from "lucide-react"
import {
  creatorVideos,
  creatorFunnel30d,
  creatorChannelMeta,
} from "@/lib/mock-data"
import { formatKRW } from "@/lib/utils"

const FUNNEL_STAGES = [
  {
    label: "유튜브 조회",
    icon: Eye,
    key: "videoViews" as const,
    color: "#B91C1C",
    bg: "#FEE2E2",
  },
  {
    label: "링크 클릭",
    icon: MousePointerClick,
    key: "linkClicks" as const,
    color: "#A16207",
    bg: "#FEF3C7",
  },
  {
    label: "부킹 페이지 진입",
    icon: ExternalLink,
    key: "pageViews" as const,
    color: "#0891B2",
    bg: "#CFFAFE",
  },
  {
    label: "예약 완료",
    icon: Calendar,
    key: "bookings" as const,
    color: "#15803D",
    bg: "#DCFCE7",
  },
  {
    label: "매출",
    icon: Banknote,
    key: "revenue" as const,
    color: "#1E40AF",
    bg: "#DBEAFE",
  },
]

export default function CreatorDashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-2 border-b border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
            >
              🎬 Creator 모듈
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: "#FED7AA", color: "#C2410C" }}
            >
              Design Partner
            </span>
          </div>
          <h1 className="mt-1 text-xl font-extrabold text-gray-900">
            영상 → 매출 funnel
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            지난 30일 · {creatorChannelMeta.channelName} ({creatorChannelMeta.channelHandle})
          </p>
        </div>
        <ChannelMetaCard />
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <FunnelStrip />
        <TopPerformerHighlight />
        <VideoTable />
      </div>
    </div>
  )
}

function ChannelMetaCard() {
  return (
    <div
      className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5"
      style={{ backgroundColor: "#FEE2E2" }}
    >
      <PlayCircle className="h-6 w-6 shrink-0 text-red-600" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-red-700">
          구독자
        </p>
        <p className="text-base font-extrabold tabular-nums text-red-900">
          {creatorChannelMeta.subscribers.toLocaleString()}
        </p>
      </div>
      <div className="border-l border-red-200 pl-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-red-700">
          영상
        </p>
        <p className="text-base font-extrabold tabular-nums text-red-900">
          {creatorChannelMeta.videoCount}
        </p>
      </div>
    </div>
  )
}

function FunnelStrip() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">전체 funnel (30일)</h2>
        <span className="text-[11px] font-medium text-gray-500">
          유튜브 조회 → 매출 전환
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {FUNNEL_STAGES.map((s, i) => {
          const value = creatorFunnel30d[s.key]
          const display =
            s.key === "revenue"
              ? formatKRW(value as number)
              : (value as number).toLocaleString()
          const Icon = s.icon
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: s.bg, color: s.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {s.label}
                </p>
              </div>
              <p
                className="mt-2 text-xl font-extrabold tabular-nums sm:text-2xl"
                style={{ color: s.color }}
              >
                {display}
              </p>
              {i < FUNNEL_STAGES.length - 1 && (
                <p className="mt-1 hidden text-[10px] font-medium text-gray-500 sm:block">
                  ↓ 다음 단계
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Conversion label="조회 → 클릭" value={creatorFunnel30d.clickThroughRate} suffix="%" />
        <Conversion label="페이지 → 예약" value={creatorFunnel30d.bookingConversionRate} suffix="%" />
        <Conversion
          label="예약당 평균"
          value={Math.round(creatorFunnel30d.revenue / creatorFunnel30d.bookings)}
          suffix="원"
          isCurrency
        />
      </div>
    </section>
  )
}

function Conversion({
  label,
  value,
  suffix,
  isCurrency,
}: {
  label: string
  value: number
  suffix: string
  isCurrency?: boolean
}) {
  const display = isCurrency
    ? `${value.toLocaleString()}${suffix}`
    : `${value}${suffix}`
  return (
    <div className="rounded-lg bg-orange-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
        {label}
      </p>
      <p className="mt-0.5 text-base font-extrabold tabular-nums text-orange-900">
        {display}
      </p>
    </div>
  )
}

function TopPerformerHighlight() {
  const top = creatorVideos.find((v) => v.isTopPerformer && v.revenue > 10000000) ?? creatorVideos[0]

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-sm">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center justify-center rounded-xl bg-white text-7xl shadow-sm sm:h-32 sm:w-44">
          {top.thumbnailEmoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-orange-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
              이번 달 매출 1위 영상
            </span>
          </div>
          <h3 className="mt-1 text-lg font-extrabold text-gray-900">{top.title}</h3>
          <p className="text-xs text-gray-600">
            업로드 {top.publishedAt} · {top.duration}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">조회</p>
              <p className="text-sm font-bold tabular-nums text-gray-900">
                {(top.views / 1000).toFixed(0)}k
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">예약</p>
              <p className="text-sm font-bold tabular-nums text-gray-900">{top.bookings}건</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">매출</p>
              <p className="text-sm font-extrabold tabular-nums" style={{ color: "#1E40AF" }}>
                {formatKRW(top.revenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function VideoTable() {
  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h2 className="text-sm font-bold text-gray-900">영상별 attribution</h2>
        <Link
          href="/book/hyungje"
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
        >
          부킹 페이지 보기
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-500">
              <th className="px-5 py-2.5 font-semibold">영상</th>
              <th className="px-3 py-2.5 text-right font-semibold">조회</th>
              <th className="px-3 py-2.5 text-right font-semibold">클릭</th>
              <th className="px-3 py-2.5 text-right font-semibold">예약</th>
              <th className="px-3 py-2.5 text-right font-semibold">매출</th>
              <th className="px-3 py-2.5 text-right font-semibold">단축링크</th>
            </tr>
          </thead>
          <tbody>
            {creatorVideos.map((v) => (
              <VideoRow key={v.id} video={v} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function VideoRow({ video }: { video: typeof creatorVideos[0] }) {
  const [copied, setCopied] = useState(false)
  const link = `oilrun.kr/book/hyungje?ref=${video.id}`

  const copy = () => {
    navigator.clipboard?.writeText(`https://${link}`)
    setCopied(true)
    toast.success("단축링크 복사됨", {
      description: "유튜브 영상 설명란에 붙여넣으세요",
    })
    window.setTimeout(() => setCopied(false), 2000)
  }

  const ctr = ((video.bookingClicks / video.views) * 100).toFixed(1)
  const conv = ((video.bookings / video.bookingClicks) * 100).toFixed(1)

  return (
    <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl">
            {video.thumbnailEmoji}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-gray-900">{video.title}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {video.publishedAt} · {video.duration}
              {video.isTopPerformer && (
                <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                  <Sparkles className="h-2.5 w-2.5" />
                  Top
                </span>
              )}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <p className="text-xs font-bold tabular-nums text-gray-900">
          {(video.views / 1000).toFixed(0)}k
        </p>
      </td>
      <td className="px-3 py-3 text-right">
        <p className="text-xs font-bold tabular-nums text-gray-900">
          {video.bookingClicks.toLocaleString()}
        </p>
        <p className="text-[10px] text-gray-500">CTR {ctr}%</p>
      </td>
      <td className="px-3 py-3 text-right">
        <p className="text-xs font-bold tabular-nums text-gray-900">{video.bookings}건</p>
        <p className="text-[10px] text-gray-500">전환 {conv}%</p>
      </td>
      <td className="px-3 py-3 text-right">
        <p className="text-xs font-extrabold tabular-nums" style={{ color: "#1E40AF" }}>
          {formatKRW(video.revenue)}
        </p>
      </td>
      <td className="px-3 py-3 text-right">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-200"
        >
          {copied ? (
            <>
              <Sparkles className="h-3 w-3 text-orange-500" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              링크
            </>
          )}
        </button>
      </td>
    </tr>
  )
}
