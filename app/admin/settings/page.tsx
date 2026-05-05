"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Bell, Building2, CreditCard, Plug, Users } from "lucide-react"

const ROLES = [
  { name: "오징어땅쿙", role: "사장님", phone: "010-1111-2222" },
  { name: "이세일즈", role: "세일즈맨", phone: "010-3333-4444" },
  { name: "박CS", role: "CS 직원", phone: "010-5555-6666" },
]

const NOTIFICATIONS = [
  { id: "new_order", label: "새 주문 발생", on: true },
  { id: "shop_apply", label: "정비소 가맹 신청", on: true },
  { id: "claim", label: "클레임 발생", on: true },
  { id: "settle", label: "정산 완료", on: false },
  { id: "weekly_report", label: "주간 리포트", on: true },
]

export default function AdminSettingsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const toggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, on: !n.on } : n))
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1100px] gap-5 lg:grid-cols-2">
        <Section
          icon={<Building2 className="h-4 w-4" />}
          title="회사 정보"
        >
          <SettingRow label="회사명" value="OilRun (주)" />
          <SettingRow label="사업자번호" value="123-45-67890" />
          <SettingRow label="대표자명" value="오징어땅쿙" />
          <SettingRow label="주소" value="서울시 성동구 성수동 1-23" />
          <button
            type="button"
            onClick={() => toast("회사 정보 편집 (시연용)")}
            className="mt-2 h-10 rounded-lg border border-gray-300 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            편집
          </button>
        </Section>

        <Section
          icon={<Users className="h-4 w-4" />}
          title="사용자 권한 관리"
        >
          <ul className="space-y-2">
            {ROLES.map((r) => (
              <li
                key={r.name}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {r.name}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      · {r.role}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">{r.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast(`${r.name} 권한 편집`)}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  편집
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => toast("사용자 추가 (시연용)")}
            className="mt-3 h-10 rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: "#1E40AF" }}
          >
            + 사용자 추가
          </button>
        </Section>

        <Section
          icon={<Bell className="h-4 w-4" />}
          title="알림 설정"
        >
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5"
              >
                <span className="text-sm text-gray-800">{n.label}</span>
                <button
                  type="button"
                  onClick={() => toggle(n.id)}
                  role="switch"
                  aria-checked={n.on}
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{ backgroundColor: n.on ? "#1E40AF" : "#D1D5DB" }}
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: n.on ? "translateX(22px)" : "translateX(2px)",
                    }}
                  />
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          icon={<CreditCard className="h-4 w-4" />}
          title="결제·정산 설정"
        >
          <SettingRow label="정산 주기" value="주 1회 (매주 월요일)" />
          <SettingRow label="최소 정산액" value="100,000원" />
          <SettingRow label="기본 수수료" value="15%" />
          <SettingRow label="VAT 처리" value="별도" />
          <button
            type="button"
            onClick={() => toast("정산 설정 편집 (시연용)")}
            className="mt-2 h-10 rounded-lg border border-gray-300 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            편집
          </button>
        </Section>

        <Section
          icon={<Plug className="h-4 w-4" />}
          title="통합 설정"
          fullWidth
        >
          <ul className="grid gap-2 lg:grid-cols-2">
            <SettingRow
              label="카카오 알림톡"
              value="•••• •••• •••• 3812"
              mono
            />
            <SettingRow
              label="토스페이먼츠 키"
              value="•••• •••• •••• 9410"
              mono
            />
            <SettingRow
              label="카카오맵 SDK"
              value="•••• •••• •••• 7124"
              mono
            />
            <SettingRow
              label="Slack 웹훅"
              value="hooks.slack.com/services/•••"
              mono
            />
          </ul>
          <p className="mt-3 text-[11px] text-gray-500">
            ※ 시연용 마스킹 표시. 실제 키는 .env에 보관됩니다.
          </p>
        </Section>
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  children,
  fullWidth,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 ${fullWidth ? "lg:col-span-2" : ""}`}
    >
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-700">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

function SettingRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={`text-right text-sm text-gray-900 ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}
