"use client"

import { createBrowserClient } from "@supabase/ssr"

// Realtime/Auth용 브라우저 Supabase 클라이언트
// 환경변수 미설정 시 null 반환 (앱 crash 방지 — 실시간 기능만 비활성)
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    if (typeof window !== "undefined") {
      console.warn(
        "[supabase] env missing — realtime disabled. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      )
    }
    return null
  }
  return createBrowserClient(url, key)
}
