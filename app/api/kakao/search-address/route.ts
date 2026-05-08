import { NextResponse } from "next/server"
import {
  KakaoNotConfiguredError,
  searchAddress,
  searchKeyword,
  type KakaoAddressResult,
  type KakaoKeywordResult,
} from "@/lib/kakao"

export interface AddressSearchHit {
  label: string
  detail?: string
  lat: number
  lng: number
}

export interface AddressSearchResponse {
  ok: true
  source: "kakao" | "mock"
  results: AddressSearchHit[]
}

export interface AddressSearchError {
  ok: false
  reason: "missing_query" | "not_configured" | "provider_error"
  message: string
}

const MOCK_RESULTS: AddressSearchHit[] = [
  { label: "서울시 강남구 역삼동 123-45", lat: 37.5012, lng: 127.0396 },
  { label: "서울시 강남구 삼성동 88-2", lat: 37.5145, lng: 127.0563 },
  { label: "서울시 강남구 청담동 45-12", lat: 37.5208, lng: 127.0473 },
  { label: "서울시 서초구 반포동 67-8", lat: 37.5048, lng: 127.0244 },
  { label: "서울시 송파구 잠실동 200-12", lat: 37.5133, lng: 127.0992 },
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get("q")?.trim() ?? ""
  if (!query) {
    return NextResponse.json<AddressSearchError>(
      { ok: false, reason: "missing_query", message: "검색어가 비어있습니다" },
      { status: 400 }
    )
  }

  if (!process.env.KAKAO_REST_API_KEY) {
    const filtered = MOCK_RESULTS.filter((r) => r.label.includes(query))
    return NextResponse.json<AddressSearchResponse>({
      ok: true,
      source: "mock",
      results: filtered.length ? filtered : MOCK_RESULTS,
    })
  }

  try {
    const [addressHits, keywordHits] = await Promise.all([
      searchAddress(query),
      searchKeyword(query),
    ])
    const results = [
      ...addressHits.map(addressToHit),
      ...keywordHits.map(keywordToHit),
    ]
    const dedup = dedupByLabel(results).slice(0, 10)
    return NextResponse.json<AddressSearchResponse>({
      ok: true,
      source: "kakao",
      results: dedup,
    })
  } catch (err) {
    if (err instanceof KakaoNotConfiguredError) {
      return NextResponse.json<AddressSearchError>(
        { ok: false, reason: "not_configured", message: err.message },
        { status: 500 }
      )
    }
    return NextResponse.json<AddressSearchError>(
      {
        ok: false,
        reason: "provider_error",
        message: err instanceof Error ? err.message : "주소 검색 실패",
      },
      { status: 502 }
    )
  }
}

function addressToHit(d: KakaoAddressResult): AddressSearchHit {
  const road = d.road_address?.address_name
  return {
    label: road ?? d.address_name,
    detail: road ? d.address_name : undefined,
    lat: Number(d.y),
    lng: Number(d.x),
  }
}

function keywordToHit(d: KakaoKeywordResult): AddressSearchHit {
  return {
    label: d.place_name,
    detail: d.road_address_name || d.address_name,
    lat: Number(d.y),
    lng: Number(d.x),
  }
}

function dedupByLabel(results: AddressSearchHit[]): AddressSearchHit[] {
  const seen = new Set<string>()
  return results.filter((r) => {
    if (seen.has(r.label)) return false
    seen.add(r.label)
    return true
  })
}
