import { NextResponse } from "next/server"
import { recommendOil, vehicles, type FuelType } from "@/lib/mock-data"
import { isValidPlate, normalizePlate } from "@/lib/utils"

export type VehicleLookupSource = "mock" | "apick" | "datahub"

export interface VehicleLookupBody {
  plate: string
  ownerName?: string
}

export interface VehicleLookupOk {
  found: true
  source: VehicleLookupSource
  vehicle: {
    id?: string
    plate: string
    model: string
    year: number
    fuel: FuelType
    oilSpec: string
    manufacturer?: string
  }
}

export interface VehicleLookupFail {
  found: false
  reason: "invalid_format" | "not_found" | "consent_required" | "provider_error"
  message: string
}

export type VehicleLookupResult = VehicleLookupOk | VehicleLookupFail

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | Partial<VehicleLookupBody>
    | null

  const rawPlate = body?.plate ?? ""
  const plate = normalizePlate(rawPlate)
  const ownerName = body?.ownerName?.trim()

  if (!isValidPlate(plate)) {
    return NextResponse.json<VehicleLookupResult>(
      {
        found: false,
        reason: "invalid_format",
        message: "차량번호 형식이 올바르지 않습니다 (예: 12가3456)",
      },
      { status: 400 }
    )
  }

  const provider = process.env.VEHICLE_LOOKUP_PROVIDER as
    | VehicleLookupSource
    | undefined

  if (provider === "apick" && process.env.APICK_API_KEY) {
    return NextResponse.json<VehicleLookupResult>(
      await lookupApick(plate, ownerName)
    )
  }
  if (provider === "datahub" && process.env.DATAHUB_API_KEY) {
    return NextResponse.json<VehicleLookupResult>(
      await lookupDatahub(plate, ownerName)
    )
  }

  return NextResponse.json<VehicleLookupResult>(lookupMock(plate))
}

function lookupMock(plate: string): VehicleLookupResult {
  const match = vehicles.find((v) => normalizePlate(v.plate) === plate)
  if (!match) {
    return {
      found: false,
      reason: "not_found",
      message: "등록된 차량 정보가 없습니다",
    }
  }
  return {
    found: true,
    source: "mock",
    vehicle: {
      id: match.id,
      plate: match.plate,
      model: match.model,
      year: match.year,
      fuel: match.fuel,
      oilSpec: match.oilSpec ?? recommendOil(match.model, match.fuel),
    },
  }
}

async function lookupApick(
  plate: string,
  ownerName: string | undefined
): Promise<VehicleLookupResult> {
  if (!ownerName) {
    return {
      found: false,
      reason: "consent_required",
      message: "차주 이름이 필요합니다 (개인정보 동의 필수)",
    }
  }
  return {
    found: false,
    reason: "provider_error",
    message: "에이픽 API 연동 미구현 (TODO)",
  }
}

async function lookupDatahub(
  plate: string,
  ownerName: string | undefined
): Promise<VehicleLookupResult> {
  if (!ownerName) {
    return {
      found: false,
      reason: "consent_required",
      message: "차주 이름이 필요합니다 (개인정보 동의 필수)",
    }
  }
  return {
    found: false,
    reason: "provider_error",
    message: "데이터허브 API 연동 미구현 (TODO)",
  }
}
