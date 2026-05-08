// 카카오 REST API 호출 helper. 서버에서만 사용 (KAKAO_REST_API_KEY는 NEXT_PUBLIC_ 아님).

const KAKAO_REST_BASE = "https://dapi.kakao.com/v2/local"

export interface KakaoAddressResult {
  address_name: string
  road_address?: {
    address_name: string
    building_name?: string
  } | null
  x: string // longitude
  y: string // latitude
}

export interface KakaoKeywordResult {
  place_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
}

interface KakaoSearchResponse<T> {
  documents: T[]
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
}

export interface KakaoCoordToAddressResult {
  address: { address_name: string } | null
  road_address: { address_name: string; building_name?: string } | null
}

interface KakaoCoordResponse {
  documents: KakaoCoordToAddressResult[]
}

export class KakaoNotConfiguredError extends Error {
  constructor() {
    super("KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다")
  }
}

function authHeader(): Record<string, string> {
  const key = process.env.KAKAO_REST_API_KEY
  if (!key) throw new KakaoNotConfiguredError()
  return { Authorization: `KakaoAK ${key}` }
}

async function callKakao<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${KAKAO_REST_BASE}${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: authHeader() })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Kakao API ${res.status}: ${text}`)
  }
  return (await res.json()) as T
}

export async function searchAddress(
  query: string
): Promise<KakaoAddressResult[]> {
  const data = await callKakao<KakaoSearchResponse<KakaoAddressResult>>(
    "/search/address.json",
    { query, size: "10" }
  )
  return data.documents
}

export async function searchKeyword(
  query: string
): Promise<KakaoKeywordResult[]> {
  const data = await callKakao<KakaoSearchResponse<KakaoKeywordResult>>(
    "/search/keyword.json",
    { query, size: "10" }
  )
  return data.documents
}

export async function coordToAddress(
  lng: number,
  lat: number
): Promise<KakaoCoordToAddressResult | null> {
  const data = await callKakao<KakaoCoordResponse>(
    "/geo/coord2address.json",
    { x: String(lng), y: String(lat) }
  )
  return data.documents[0] ?? null
}
