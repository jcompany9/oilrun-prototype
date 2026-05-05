import type {
  AdminOrderRow,
  AdminOrderStatus,
} from "./mock-data"

const FIRST_NAMES = [
  "민수",
  "서연",
  "지호",
  "예린",
  "도윤",
  "선우",
  "서영",
  "지우",
  "재민",
  "하늘",
  "민준",
  "지유",
  "유준",
  "수아",
  "예준",
  "서윤",
  "지민",
  "현우",
  "수빈",
  "도현",
  "은우",
  "지안",
  "건우",
  "다은",
  "유나",
  "지원",
  "윤서",
  "하준",
  "예나",
  "성훈",
]
const LAST_NAMES = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "신",
  "서",
  "권",
  "황",
  "안",
  "송",
  "홍",
  "유",
  "고",
]
const VEHICLES = [
  "카니발 4세대",
  "쏘나타 DN8",
  "아반떼 CN7",
  "쏘렌토 MQ4",
  "모닝 JA",
  "그랜저 IG",
  "K5 DL3",
  "투싼 NX4",
  "팰리세이드",
  "셀토스",
  "스타리아",
  "아이오닉5",
  "EV6",
  "G80",
]
const MENUS = [
  "기본형 5W-30",
  "프리미엄 0W-20",
  "터보 5W-40",
  "기본형 5W-30 +옵션",
  "프리미엄 0W-20 +옵션",
]

const STATUSES: AdminOrderStatus[] = [
  "completed",
  "completed",
  "completed",
  "completed",
  "in_progress",
  "scheduled",
  "cancelled",
]

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function pickSeed(i: number, arr: string[]) {
  return arr[i % arr.length]
}

export interface AdminOrderFull extends AdminOrderRow {
  date: string
  customerPhone: string
  vehiclePlate: string
  payment: number
  fee: number
  hasClaim: boolean
}

export const adminOrdersFull: AdminOrderFull[] = Array.from(
  { length: 30 },
  (_, i) => {
    const idx = 30 - i
    const status = STATUSES[i % STATUSES.length]
    const day = 5 - Math.floor(i / 6)
    const dayDate = new Date(2026, 4, day < 1 ? 1 : day)
    const time = `${pad(9 + ((i * 3) % 12))}:${pad((i * 17) % 60)}`
    const amount = [89000, 104000, 129000, 144000, 149000][i % 5]
    const fee = Math.round(amount * 0.15)
    return {
      id: `OR-2026050${day < 1 ? 1 : day}-${String(idx).padStart(4, "0")}`,
      time,
      date: `2026.05.${pad(day < 1 ? 1 : day)}`,
      customerName:
        pickSeed(i, LAST_NAMES) + pickSeed((i * 7) % 30, FIRST_NAMES),
      customerPhone: `010-${pad(1000 + ((i * 137) % 9000))}-${pad((i * 521) % 10000)}`,
      vehicle: pickSeed(i, VEHICLES),
      vehiclePlate: `${pad(10 + (i % 89))}${
        ["가", "나", "다", "라", "마", "바"][i % 6]
      }${pad(1000 + ((i * 41) % 9000))}`,
      menuName: pickSeed(i, MENUS),
      amount,
      payment: amount,
      fee,
      shopName: "성수자동차정비",
      status,
      hasClaim: i === 5 || i === 12,
    }
  }
)

export interface AdminUserRow {
  id: string
  name: string
  phone: string
  joinedAt: string
  totalOrders: number
  totalPaid: number
  averageRating: number
  status: "active" | "dormant" | "blocked"
}

export const adminUsers: AdminUserRow[] = Array.from({ length: 42 }, (_, i) => {
  const status: AdminUserRow["status"] =
    i % 13 === 0 ? "dormant" : i % 31 === 0 ? "blocked" : "active"
  return {
    id: `U-${String(2000 + i).padStart(5, "0")}`,
    name:
      pickSeed(i, LAST_NAMES) + pickSeed((i * 11) % 30, FIRST_NAMES),
    phone: `010-${pad(1000 + ((i * 113) % 9000))}-${pad((i * 449) % 10000)}`,
    joinedAt: `2026.0${1 + (i % 5)}.${pad(1 + ((i * 7) % 28))}`,
    totalOrders: 1 + (i % 7),
    totalPaid: (1 + (i % 7)) * (89000 + (i % 4) * 15000),
    averageRating: Number((4.3 + ((i * 0.07) % 0.7)).toFixed(1)),
    status,
  }
})

export interface AdminShopRow {
  id: string
  name: string
  ownerName: string
  ownerPhone: string
  region: string
  monthGmv: number
  totalOrders: number
  averageRating: number
  acceptanceRate: number
  state: "active" | "pending" | "suspended"
  pendingDocs?: { businessLicense: boolean; mechanicLicense: boolean }
  appliedAt?: string
}

export const adminShops: AdminShopRow[] = [
  {
    id: "S-001",
    name: "성수자동차정비",
    ownerName: "박정비",
    ownerPhone: "010-1111-2222",
    region: "성동구 성수동",
    monthGmv: 1250000,
    totalOrders: 47,
    averageRating: 4.8,
    acceptanceRate: 92,
    state: "active",
  },
  {
    id: "S-002",
    name: "강남오일플러스",
    ownerName: "김오일",
    ownerPhone: "010-2222-3333",
    region: "강남구 역삼동",
    monthGmv: 0,
    totalOrders: 0,
    averageRating: 0,
    acceptanceRate: 0,
    state: "pending",
    pendingDocs: { businessLicense: true, mechanicLicense: true },
    appliedAt: "2026.05.04",
  },
  {
    id: "S-003",
    name: "잠실모터스",
    ownerName: "이모터",
    ownerPhone: "010-3333-4444",
    region: "송파구 잠실동",
    monthGmv: 0,
    totalOrders: 0,
    averageRating: 0,
    acceptanceRate: 0,
    state: "pending",
    pendingDocs: { businessLicense: true, mechanicLicense: false },
    appliedAt: "2026.05.03",
  },
  {
    id: "S-004",
    name: "서초카케어",
    ownerName: "정케어",
    ownerPhone: "010-4444-5555",
    region: "서초구 반포동",
    monthGmv: 0,
    totalOrders: 0,
    averageRating: 0,
    acceptanceRate: 0,
    state: "pending",
    pendingDocs: { businessLicense: false, mechanicLicense: true },
    appliedAt: "2026.05.02",
  },
  {
    id: "S-005",
    name: "이전 1호점",
    ownerName: "장정비",
    ownerPhone: "010-5555-6666",
    region: "마포구 합정동",
    monthGmv: 0,
    totalOrders: 12,
    averageRating: 3.2,
    acceptanceRate: 60,
    state: "suspended",
  },
]

export type FinanceSettlementStatus = "pending" | "processing" | "paid"

export interface FinanceSettlementRow {
  shopId: string
  shopName: string
  period: string
  gmv: number
  fee: number
  payout: number
  status: FinanceSettlementStatus
  scheduledAt?: string
  paidAt?: string
}

export const financeSummary = {
  totalGmv: 8420000,
  fee: 1263000,
  payouts: 6940000,
  pgFee: 218000,
  alimtalkFee: 32000,
  netRevenue: 1013000,
}

export const financeSettlements: FinanceSettlementRow[] = [
  {
    shopId: "S-001",
    shopName: "성수자동차정비",
    period: "2026.05.01 – 2026.05.07",
    gmv: 1250000,
    fee: 187500,
    payout: 1062500,
    status: "pending",
    scheduledAt: "2026.05.08",
  },
  {
    shopId: "S-002",
    shopName: "강남오일프라자",
    period: "2026.05.01 – 2026.05.07",
    gmv: 870000,
    fee: 130500,
    payout: 739500,
    status: "pending",
    scheduledAt: "2026.05.08",
  },
  {
    shopId: "S-001",
    shopName: "성수자동차정비",
    period: "2026.04.24 – 2026.04.30",
    gmv: 1080000,
    fee: 162000,
    payout: 918000,
    status: "processing",
    scheduledAt: "2026.05.05 (오늘)",
  },
  {
    shopId: "S-002",
    shopName: "강남오일프라자",
    period: "2026.04.24 – 2026.04.30",
    gmv: 640000,
    fee: 96000,
    payout: 544000,
    status: "processing",
    scheduledAt: "2026.05.05 (오늘)",
  },
  {
    shopId: "S-001",
    shopName: "성수자동차정비",
    period: "2026.04.17 – 2026.04.23",
    gmv: 920000,
    fee: 138000,
    payout: 782000,
    status: "paid",
    paidAt: "2026.04.28",
  },
  {
    shopId: "S-001",
    shopName: "성수자동차정비",
    period: "2026.04.10 – 2026.04.16",
    gmv: 760000,
    fee: 114000,
    payout: 646000,
    status: "paid",
    paidAt: "2026.04.21",
  },
  {
    shopId: "S-002",
    shopName: "강남오일프라자",
    period: "2026.04.17 – 2026.04.23",
    gmv: 580000,
    fee: 87000,
    payout: 493000,
    status: "paid",
    paidAt: "2026.04.28",
  },
]

export interface MonthlyGmv {
  month: string
  gmv: number
}

export const monthlyGmv: MonthlyGmv[] = [
  { month: "1월", gmv: 4200000 },
  { month: "2월", gmv: 4900000 },
  { month: "3월", gmv: 5800000 },
  { month: "4월", gmv: 7200000 },
  { month: "5월", gmv: 8420000 },
]

export interface VehicleAvg {
  model: string
  avgPrice: number
  count: number
}

export const adminVehicleAvg: VehicleAvg[] = [
  { model: "카니발 4세대", avgPrice: 144000, count: 18 },
  { model: "팰리세이드", avgPrice: 138000, count: 12 },
  { model: "쏘렌토 MQ4", avgPrice: 124000, count: 9 },
  { model: "G80", avgPrice: 158000, count: 7 },
  { model: "투싼 NX4", avgPrice: 112000, count: 7 },
  { model: "쏘나타 DN8", avgPrice: 96000, count: 6 },
  { model: "그랜저 IG", avgPrice: 129000, count: 6 },
  { model: "아반떼 CN7", avgPrice: 91000, count: 5 },
  { model: "K5 DL3", avgPrice: 94000, count: 4 },
  { model: "셀토스", avgPrice: 98000, count: 4 },
]

export interface DistrictDistribution {
  district: string
  orders: number
}

export const adminDistrictDistribution: DistrictDistribution[] = [
  { district: "강남구", orders: 28 },
  { district: "서초구", orders: 18 },
  { district: "송파구", orders: 12 },
  { district: "성동구", orders: 9 },
  { district: "마포구", orders: 5 },
  { district: "용산구", orders: 4 },
]

export interface RatingDistribution {
  rating: number
  count: number
}

export const adminRatingDistribution: RatingDistribution[] = [
  { rating: 5, count: 18 },
  { rating: 4, count: 4 },
  { rating: 3, count: 1 },
  { rating: 2, count: 0 },
  { rating: 1, count: 0 },
]

export interface CsTicket {
  id: string
  customer: string
  phone: string
  subject: string
  body: string
  category: "delivery" | "payment" | "refund" | "service" | "other"
  status: "open" | "in_progress" | "closed"
  createdAt: string
}

export const csTickets: CsTicket[] = [
  {
    id: "TK-201",
    customer: "박지호",
    phone: "010-1234-5678",
    subject: "정비사가 안 와요",
    body: "16시 30분 약속이었는데 17시 10분이 되어도 도착하지 않았습니다. 확인 부탁드립니다.",
    category: "delivery",
    status: "open",
    createdAt: "2026-05-05 17:14",
  },
  {
    id: "TK-200",
    customer: "한지우",
    phone: "010-2345-6789",
    subject: "환불 가능한가요?",
    body: "오늘 아침에 예약했는데 갑자기 일정이 바뀌어서요. 환불 처리 가능할까요?",
    category: "refund",
    status: "in_progress",
    createdAt: "2026-05-05 15:30",
  },
  {
    id: "TK-199",
    customer: "이서영",
    phone: "010-3456-7890",
    subject: "결제했는데 영수증이 안 와요",
    body: "결제는 정상으로 완료되었는데 알림톡으로 영수증이 안 왔어요.",
    category: "payment",
    status: "in_progress",
    createdAt: "2026-05-05 12:42",
  },
  {
    id: "TK-198",
    customer: "정도윤",
    phone: "010-4567-8901",
    subject: "정비 후 문제가 생겼어요",
    body: "어제 교환받았는데 오늘 시동 걸 때 이상한 소리가 납니다. 점검 가능할까요?",
    category: "service",
    status: "closed",
    createdAt: "2026-05-05 10:15",
  },
  {
    id: "TK-197",
    customer: "최예린",
    phone: "010-5678-9012",
    subject: "차종 등록이 안 돼요",
    body: "신차인데 차종 마스터에 없어서 직접 입력해야 했어요. 추가해주실 수 있나요?",
    category: "other",
    status: "closed",
    createdAt: "2026-05-04 18:20",
  },
  {
    id: "TK-196",
    customer: "조하늘",
    phone: "010-6789-0123",
    subject: "출장비가 너무 비싸요",
    body: "거리도 가까운데 1만원이나 나오는 건 부담이에요. 정책 검토 부탁드립니다.",
    category: "other",
    status: "open",
    createdAt: "2026-05-04 14:55",
  },
]

export const csQuickReplies = [
  {
    id: "qr1",
    label: "정비사 위치 확인 안내",
    body: "안녕하세요. 정비사 위치 확인 후 답변 드리겠습니다. 잠시만 기다려주세요.",
  },
  {
    id: "qr2",
    label: "환불 처리 안내",
    body: "환불 정책에 따라 작업 시작 전 무료 취소 가능합니다. 카드 결제는 영업일 기준 2–3일 내 처리됩니다.",
  },
  {
    id: "qr3",
    label: "영수증 재발송",
    body: "영수증을 다시 발송했습니다. 알림톡 수신함 확인 부탁드립니다.",
  },
]
