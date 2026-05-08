import { NextResponse } from "next/server"
import { KakaoNotConfiguredError, coordToAddress } from "@/lib/kakao"

export interface ReverseGeocodeResponse {
  ok: true
  source: "kakao" | "mock"
  address: string
}

export interface ReverseGeocodeError {
  ok: false
  reason: "invalid_coords" | "not_found" | "not_configured" | "provider_error"
  message: string
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const lat = Number(url.searchParams.get("lat"))
  const lng = Number(url.searchParams.get("lng"))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json<ReverseGeocodeError>(
      {
        ok: false,
        reason: "invalid_coords",
        message: "lat / lng 가 필요합니다",
      },
      { status: 400 }
    )
  }

  if (!process.env.KAKAO_REST_API_KEY) {
    return NextResponse.json<ReverseGeocodeResponse>({
      ok: true,
      source: "mock",
      address: "서울시 강남구 역삼동 123-45",
    })
  }

  try {
    const result = await coordToAddress(lng, lat)
    if (!result) {
      return NextResponse.json<ReverseGeocodeError>(
        {
          ok: false,
          reason: "not_found",
          message: "해당 좌표의 주소를 찾을 수 없습니다",
        },
        { status: 404 }
      )
    }
    const address =
      result.road_address?.address_name ??
      result.address?.address_name ??
      ""
    if (!address) {
      return NextResponse.json<ReverseGeocodeError>(
        { ok: false, reason: "not_found", message: "주소 정보가 비어있습니다" },
        { status: 404 }
      )
    }
    return NextResponse.json<ReverseGeocodeResponse>({
      ok: true,
      source: "kakao",
      address,
    })
  } catch (err) {
    if (err instanceof KakaoNotConfiguredError) {
      return NextResponse.json<ReverseGeocodeError>(
        { ok: false, reason: "not_configured", message: err.message },
        { status: 500 }
      )
    }
    return NextResponse.json<ReverseGeocodeError>(
      {
        ok: false,
        reason: "provider_error",
        message: err instanceof Error ? err.message : "주소 조회 실패",
      },
      { status: 502 }
    )
  }
}
