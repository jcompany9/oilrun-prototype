export type FuelType = "가솔린" | "디젤" | "LPG" | "하이브리드" | "전기"

export interface Vehicle {
  id: string
  plate: string
  model: string
  year: number
  fuel: FuelType
  oilSpec: string
}

export interface Menu {
  id: string
  name: string
  description: string
  price: number
  recommended?: boolean
}

export interface AddOption {
  id: string
  name: string
  price: number
}

export interface Mechanic {
  id: string
  name: string
  phone: string
  rating: number
}

export type OrderStatus =
  | "new"
  | "scheduled"
  | "departed"
  | "arrived"
  | "in_progress"
  | "completed"

export interface ShopGeoPoint {
  lat: number
  lng: number
}

export type AccessMethod =
  | "with_owner"
  | "remote_unlock"
  | "key_dropoff"
  | "call_on_arrival"

export interface AccessOption {
  id: AccessMethod
  emoji: string
  title: string
  subtitle: string
  detail: string
  recommended?: boolean
  hint?: string
  needsNote?: boolean
  notePlaceholder?: string
  noteLabel?: string
}

export const accessOptions: AccessOption[] = [
  {
    id: "with_owner",
    emoji: "🚗",
    title: "차량과 함께 있어요",
    subtitle: "정비사가 도착할 때 차량 옆에 있을게요",
    detail: "30–40분 소요 예상",
  },
  {
    id: "remote_unlock",
    emoji: "🔓",
    title: "원격으로 문 열어드릴게요",
    subtitle: "현대 블루링크, 기아 커넥트, 제네시스 커넥티드 등",
    detail: "정비사 도착 시 알림 받고 앱에서 원격 잠금 해제",
    recommended: true,
    hint: "차량 제조사 앱과 연동 필요 (별도 설정)",
  },
  {
    id: "key_dropoff",
    emoji: "🔑",
    title: "차키를 미리 전달할게요",
    subtitle: "지정 장소에 차키를 두시면 정비사가 가져갑니다",
    detail: "예: 경비실, 사무실, 우편함 등",
    needsNote: true,
    noteLabel: "차키 위치를 알려주세요",
    notePlaceholder: "예: 경비실에 OO이름으로 맡겨두었습니다",
  },
  {
    id: "call_on_arrival",
    emoji: "📱",
    title: "도착 시 연락주세요",
    subtitle: "정비사가 전화하면 그때 내려가서 문 열어드릴게요",
    detail: "도착 알림 받고 5–10분 내 응답 가능하실 때",
  },
]

export function getAccessOption(id?: string | null): AccessOption | null {
  if (!id) return null
  return accessOptions.find((o) => o.id === id) ?? null
}

export interface ShopOrder {
  id: string
  customerName: string
  customerPhone: string
  vehiclePlate: string
  vehicleModel: string
  menuName: string
  menuOilSpec: string
  addOptions: string[]
  district: string
  address: string
  addressDetail?: string
  location: ShopGeoPoint
  scheduledAt: Date
  status: OrderStatus
  total: number
  distance: number
  timeUntil: string
  mechanicId?: string
  accessMethod?: AccessMethod
  accessNote?: string
}

export interface ShopInfo {
  name: string
  ownerName: string
  homeLocation: ShopGeoPoint
  todayRevenue: number
}

export const shopInfo: ShopInfo = {
  name: "성수자동차정비",
  ownerName: "박정비",
  homeLocation: { lat: 37.5447, lng: 127.0557 },
  todayRevenue: 425000,
}

export interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

export const vehicles: Vehicle[] = [
  {
    id: "v1",
    plate: "12가3456",
    model: "카니발 4세대",
    year: 2022,
    fuel: "디젤",
    oilSpec: "5W-30 합성유",
  },
  {
    id: "v2",
    plate: "34나5678",
    model: "쏘나타 DN8",
    year: 2021,
    fuel: "가솔린",
    oilSpec: "0W-20 합성유",
  },
  {
    id: "v3",
    plate: "56다7890",
    model: "아반떼 CN7",
    year: 2023,
    fuel: "가솔린",
    oilSpec: "0W-20 합성유",
  },
  {
    id: "v4",
    plate: "78라9012",
    model: "쏘렌토 MQ4",
    year: 2022,
    fuel: "디젤",
    oilSpec: "5W-30 합성유",
  },
  {
    id: "v5",
    plate: "90마1234",
    model: "모닝 JA",
    year: 2020,
    fuel: "가솔린",
    oilSpec: "5W-30 합성유",
  },
]

export const menus: Menu[] = [
  {
    id: "m1",
    name: "기본형 합성유 5W-30",
    description: "일반 운전자에게 적합한 표준 합성유. 1만km 주기 권장.",
    price: 89000,
  },
  {
    id: "m2",
    name: "프리미엄 합성유 0W-20",
    description: "연비 향상과 엔진 보호에 유리한 저점도 합성유. 신차에 추천.",
    price: 129000,
    recommended: true,
  },
  {
    id: "m3",
    name: "터보 전용 5W-40",
    description: "터보 엔진과 고출력 차량에 최적화된 고온 안정성 합성유.",
    price: 149000,
  },
]

export const addOptions: AddOption[] = [
  { id: "a1", name: "에어 필터 교체", price: 15000 },
  { id: "a2", name: "에어컨 필터 교체", price: 15000 },
  { id: "a3", name: "와이퍼 교체", price: 20000 },
]

export const mechanics: Mechanic[] = [
  { id: "k1", name: "김기사", phone: "010-1234-5678", rating: 4.9 },
  { id: "k2", name: "박기사", phone: "010-1234-5678", rating: 4.8 },
  { id: "k3", name: "이기사", phone: "010-1234-5678", rating: 4.7 },
]

const today = new Date(2026, 4, 5)
const at = (hour: number, minute = 0) => {
  const d = new Date(today)
  d.setHours(hour, minute, 0, 0)
  return d
}

export const shopOrders: ShopOrder[] = [
  {
    id: "OR-001",
    customerName: "김민수",
    customerPhone: "010-1234-5678",
    vehiclePlate: "12가3456",
    vehicleModel: "카니발 4세대",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: [],
    district: "강남구",
    address: "강남구 역삼동 123-45",
    location: { lat: 37.5012, lng: 127.0396 },
    scheduledAt: at(16, 30),
    status: "new",
    total: 89000,
    distance: 8.2,
    timeUntil: "2시간 후",
  },
  {
    id: "OR-002",
    customerName: "이서연",
    customerPhone: "010-1234-5678",
    vehiclePlate: "34나5678",
    vehicleModel: "쏘나타 DN8",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: [],
    district: "서초구",
    address: "서초구 반포동 67-8",
    location: { lat: 37.5048, lng: 127.0244 },
    scheduledAt: at(17, 0),
    status: "new",
    total: 89000,
    distance: 12.5,
    timeUntil: "2시간 30분 후",
  },
  {
    id: "OR-003",
    customerName: "박지호",
    customerPhone: "010-1234-5678",
    vehiclePlate: "56다7890",
    vehicleModel: "아반떼 CN7",
    menuName: "프리미엄 합성유 0W-20",
    menuOilSpec: "0W-20 합성유",
    addOptions: ["에어컨 필터 교체"],
    district: "강남구",
    address: "강남구 역삼동 456-7",
    addressDetail: "지하 주차장 B2 23번",
    location: { lat: 37.4979, lng: 127.0276 },
    scheduledAt: at(14, 0),
    status: "in_progress",
    total: 144000,
    distance: 7.4,
    timeUntil: "진행 중",
    mechanicId: "k1",
    accessMethod: "key_dropoff",
    accessNote: "지하 1층 경비실에 박지호 이름으로 맡겨두었습니다",
  },
  {
    id: "OR-004",
    customerName: "최예린",
    customerPhone: "010-1234-5678",
    vehiclePlate: "78라9012",
    vehicleModel: "쏘렌토 MQ4",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: ["에어 필터 교체"],
    district: "강남구",
    address: "강남구 삼성동 88-2",
    location: { lat: 37.5145, lng: 127.0563 },
    scheduledAt: at(16, 30),
    status: "scheduled",
    total: 104000,
    distance: 3.1,
    timeUntil: "2시간 후",
    mechanicId: "k2",
    accessMethod: "remote_unlock",
  },
  {
    id: "OR-005",
    customerName: "정도윤",
    customerPhone: "010-1234-5678",
    vehiclePlate: "90마1234",
    vehicleModel: "모닝 JA",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: [],
    district: "송파구",
    address: "송파구 잠실동 200-12",
    location: { lat: 37.5133, lng: 127.0992 },
    scheduledAt: at(18, 0),
    status: "scheduled",
    total: 89000,
    distance: 6.8,
    timeUntil: "3시간 30분 후",
    mechanicId: "k2",
    accessMethod: "call_on_arrival",
  },
]

export interface VehicleManufacturer {
  id: string
  name: string
  nameEn: string
}

export const vehicleManufacturers: VehicleManufacturer[] = [
  { id: "hyundai", name: "현대", nameEn: "Hyundai" },
  { id: "kia", name: "기아", nameEn: "Kia" },
  { id: "genesis", name: "제네시스", nameEn: "Genesis" },
  { id: "chevrolet", name: "쉐보레", nameEn: "Chevrolet" },
  { id: "renault", name: "르노코리아", nameEn: "Renault Korea" },
  { id: "kgm", name: "KG모빌리티", nameEn: "KGM" },
  { id: "bmw", name: "BMW", nameEn: "BMW" },
  { id: "benz", name: "벤츠", nameEn: "Mercedes-Benz" },
  { id: "audi", name: "아우디", nameEn: "Audi" },
  { id: "vw", name: "폭스바겐", nameEn: "Volkswagen" },
  { id: "toyota", name: "토요타", nameEn: "Toyota" },
  { id: "lexus", name: "렉서스", nameEn: "Lexus" },
  { id: "etc", name: "기타", nameEn: "Other" },
]

export const vehicleModelsByManufacturer: Record<string, string[]> = {
  hyundai: [
    "아반떼",
    "쏘나타",
    "그랜저",
    "코나",
    "투싼",
    "싼타페",
    "팰리세이드",
    "캐스퍼",
    "스타리아",
    "아이오닉5",
  ],
  kia: [
    "모닝",
    "레이",
    "K3",
    "K5",
    "K8",
    "셀토스",
    "스포티지",
    "쏘렌토",
    "카니발",
    "EV6",
  ],
  genesis: ["G70", "G80", "G90", "GV70", "GV80"],
  chevrolet: ["스파크", "트레일블레이저", "트래버스", "말리부", "콜로라도"],
  renault: ["QM6", "SM6", "XM3", "캡처"],
  kgm: ["토레스", "렉스턴", "티볼리", "코란도"],
  bmw: ["3시리즈", "5시리즈", "7시리즈", "X3", "X5"],
  benz: ["A클래스", "C클래스", "E클래스", "S클래스", "GLC", "GLE"],
  audi: ["A4", "A6", "A8", "Q5", "Q7", "e-트론"],
  vw: ["골프", "제타", "파사트", "티구안", "아테온"],
  toyota: ["캠리", "프리우스", "라브4", "하이랜더", "시에나"],
  lexus: ["ES", "IS", "RX", "NX", "LS"],
  etc: ["기타 모델"],
}

export const vehicleYearOptions: number[] = Array.from(
  { length: 12 },
  (_, i) => 2026 - i
)

export const vehicleFuelOptions: FuelType[] = [
  "가솔린",
  "디젤",
  "하이브리드",
  "LPG",
  "전기",
]

const SUV_MINIVAN_KEYWORDS = [
  "카니발",
  "스타리아",
  "쏘렌토",
  "싼타페",
  "팰리세이드",
  "투싼",
  "코나",
  "셀토스",
  "스포티지",
  "트레일블레이저",
  "트래버스",
  "QM6",
  "XM3",
  "캡처",
  "토레스",
  "렉스턴",
  "티볼리",
  "코란도",
  "GV",
  "X3",
  "X5",
  "Q5",
  "Q7",
  "GLC",
  "GLE",
  "RX",
  "NX",
  "라브",
  "하이랜더",
  "시에나",
  "티구안",
]

export function recommendOil(model: string, fuel: FuelType): string {
  if (fuel === "전기") return "오일교환 불필요"
  if (fuel === "하이브리드") return "0W-20 합성유"
  if (/터보/i.test(model)) return "5W-40 합성유"
  if (
    fuel === "디젤" ||
    SUV_MINIVAN_KEYWORDS.some((k) => model.includes(k))
  ) {
    return "5W-30 합성유"
  }
  return "5W-30 합성유"
}

export function buildCustomVehicle(input: {
  model: string
  year: number
  fuel: FuelType
  plate?: string
}): Vehicle {
  return {
    id: "custom",
    plate: input.plate ?? "",
    model: input.model,
    year: input.year,
    fuel: input.fuel,
    oilSpec: recommendOil(input.model, input.fuel),
  }
}

export function resolveVehicleFromParams(
  params: URLSearchParams
): Vehicle | null {
  const id = params.get("vehicleId")
  if (!id) return null
  if (id !== "custom") {
    return vehicles.find((v) => v.id === id) ?? null
  }
  const model = params.get("model")
  const year = Number(params.get("year"))
  const fuel = params.get("fuel") as FuelType | null
  if (!model || !year || !fuel) return null
  return {
    id: "custom",
    plate: params.get("plate") ?? "",
    model,
    year,
    fuel,
    oilSpec: params.get("oilSpec") ?? recommendOil(model, fuel),
  }
}

export interface AdminKPI {
  todayGmv: number
  gmvDelta: number
  todayOrders: number
  ordersCompleted: number
  ordersInProgress: number
  activeShops: number
  averageRating: number
  reviewCount: number
}

export const adminKPI: AdminKPI = {
  todayGmv: 1250000,
  gmvDelta: 12,
  todayOrders: 14,
  ordersCompleted: 11,
  ordersInProgress: 3,
  activeShops: 1,
  averageRating: 4.8,
  reviewCount: 23,
}

export interface AdminHourlyBucket {
  range: string
  orders: number
}

export const adminHourlyDistribution: AdminHourlyBucket[] = [
  { range: "09–11", orders: 1 },
  { range: "11–13", orders: 3 },
  { range: "14–16", orders: 4 },
  { range: "16–18", orders: 5 },
  { range: "18–20", orders: 1 },
]

export type AdminOrderStatus = "completed" | "in_progress" | "scheduled" | "cancelled"

export interface AdminOrderRow {
  id: string
  customerName: string
  vehicle: string
  menuName: string
  amount: number
  shopName: string
  status: AdminOrderStatus
  time: string
}

export const adminRecentOrders: AdminOrderRow[] = [
  {
    id: "OR-20260505-0014",
    customerName: "정도윤",
    vehicle: "모닝 JA",
    menuName: "기본형 5W-30",
    amount: 89000,
    shopName: "성수자동차정비",
    status: "scheduled",
    time: "18:00",
  },
  {
    id: "OR-20260505-0013",
    customerName: "최예린",
    vehicle: "쏘렌토 MQ4",
    menuName: "기본형 5W-30 +옵션",
    amount: 104000,
    shopName: "성수자동차정비",
    status: "scheduled",
    time: "16:30",
  },
  {
    id: "OR-20260505-0012",
    customerName: "박지호",
    vehicle: "아반떼 CN7",
    menuName: "프리미엄 0W-20 +옵션",
    amount: 144000,
    shopName: "성수자동차정비",
    status: "in_progress",
    time: "14:00",
  },
  {
    id: "OR-20260505-0011",
    customerName: "김선우",
    vehicle: "스타리아",
    menuName: "기본형 5W-30",
    amount: 89000,
    shopName: "성수자동차정비",
    status: "in_progress",
    time: "13:30",
  },
  {
    id: "OR-20260505-0010",
    customerName: "이서영",
    vehicle: "그랜저 IG",
    menuName: "프리미엄 0W-20",
    amount: 129000,
    shopName: "성수자동차정비",
    status: "completed",
    time: "12:00",
  },
  {
    id: "OR-20260505-0009",
    customerName: "한지우",
    vehicle: "K5 DL3",
    menuName: "기본형 5W-30",
    amount: 89000,
    shopName: "성수자동차정비",
    status: "cancelled",
    time: "11:30",
  },
  {
    id: "OR-20260505-0008",
    customerName: "윤재민",
    vehicle: "팰리세이드",
    menuName: "프리미엄 0W-20",
    amount: 129000,
    shopName: "성수자동차정비",
    status: "completed",
    time: "11:00",
  },
  {
    id: "OR-20260505-0007",
    customerName: "조하늘",
    vehicle: "셀토스",
    menuName: "기본형 5W-30",
    amount: 89000,
    shopName: "성수자동차정비",
    status: "completed",
    time: "10:30",
  },
  {
    id: "OR-20260505-0006",
    customerName: "강민준",
    vehicle: "투싼 NX4",
    menuName: "터보 5W-40",
    amount: 149000,
    shopName: "성수자동차정비",
    status: "completed",
    time: "10:00",
  },
  {
    id: "OR-20260505-0005",
    customerName: "송지유",
    vehicle: "아반떼 CN7",
    menuName: "기본형 5W-30",
    amount: 89000,
    shopName: "성수자동차정비",
    status: "completed",
    time: "09:30",
  },
]

export interface AdminClaim {
  id: string
  type: "claim" | "refund"
  text: string
  createdAt: string
}

export type HistoryStatus = "in_progress" | "completed" | "cancelled"

export interface HistoryOrder {
  id: string
  status: HistoryStatus
  date: string
  scheduledLabel: string
  vehicleId: string
  vehicleModel: string
  vehiclePlate: string
  menuId: string
  menuName: string
  menuOilSpec: string
  addOptions: string[]
  location: string
  mechanicName?: string
  mechanicPhone?: string
  total: number
  rating?: number
  review?: string
  cancelReason?: string
  refundStatus?: string
}

export const historyOrders: HistoryOrder[] = [
  {
    id: "OR-20260505-0012",
    status: "in_progress",
    date: "2026.05.05",
    scheduledLabel: "오늘 16:30–18:00",
    vehicleId: "v1",
    vehicleModel: "카니발 4세대",
    vehiclePlate: "12가3456",
    menuId: "m1",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: ["에어컨 필터 교체"],
    location: "강남구 역삼동 123-45",
    mechanicName: "김기사",
    mechanicPhone: "010-1234-5678",
    total: 114000,
  },
  {
    id: "OR-20260415-0042",
    status: "completed",
    date: "2026.04.15",
    scheduledLabel: "2026년 4월 15일",
    vehicleId: "v1",
    vehicleModel: "카니발 4세대",
    vehiclePlate: "12가3456",
    menuId: "m1",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: [],
    location: "강남구 역삼동 123-45",
    mechanicName: "김기사",
    total: 89000,
    rating: 5,
    review: "친절하고 빠르게 작업해주셔서 만족스러웠습니다",
  },
  {
    id: "OR-20260318-0019",
    status: "completed",
    date: "2026.03.18",
    scheduledLabel: "2026년 3월 18일",
    vehicleId: "v1",
    vehicleModel: "카니발 4세대",
    vehiclePlate: "12가3456",
    menuId: "m2",
    menuName: "프리미엄 합성유 0W-20",
    menuOilSpec: "0W-20 합성유",
    addOptions: ["에어 필터 교체"],
    location: "강남구 삼성동 88-2",
    mechanicName: "박기사",
    total: 144000,
    rating: 5,
    review: "시간 약속 정확하게 지키셨어요",
  },
  {
    id: "OR-20260202-0007",
    status: "completed",
    date: "2026.02.02",
    scheduledLabel: "2026년 2월 2일",
    vehicleId: "v1",
    vehicleModel: "카니발 4세대",
    vehiclePlate: "12가3456",
    menuId: "m1",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: [],
    location: "강남구 역삼동 123-45",
    mechanicName: "이기사",
    total: 89000,
    rating: 4,
    review: "괜찮았습니다",
  },
  {
    id: "OR-20251212-0033",
    status: "completed",
    date: "2025.12.12",
    scheduledLabel: "2025년 12월 12일",
    vehicleId: "v1",
    vehicleModel: "카니발 4세대",
    vehiclePlate: "12가3456",
    menuId: "m1",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: ["와이퍼 교체"],
    location: "서초구 반포동 67-8",
    mechanicName: "김기사",
    total: 109000,
    rating: 5,
    review: "추가 작업도 깔끔하게 해주셔서 좋았습니다",
  },
  {
    id: "OR-20251005-0021",
    status: "completed",
    date: "2025.10.05",
    scheduledLabel: "2025년 10월 5일",
    vehicleId: "v1",
    vehicleModel: "카니발 4세대",
    vehiclePlate: "12가3456",
    menuId: "m1",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: [],
    location: "강남구 역삼동 123-45",
    mechanicName: "박기사",
    total: 89000,
    rating: 4,
  },
  {
    id: "OR-20251224-0050",
    status: "cancelled",
    date: "2025.12.24",
    scheduledLabel: "2025년 12월 24일",
    vehicleId: "v1",
    vehicleModel: "카니발 4세대",
    vehiclePlate: "12가3456",
    menuId: "m1",
    menuName: "기본형 합성유 5W-30",
    menuOilSpec: "5W-30 합성유",
    addOptions: [],
    location: "강남구 역삼동 123-45",
    total: 89000,
    cancelReason: "일정 변경으로 인한 본인 취소",
    refundStatus: "전액 환불 완료",
  },
]

export interface NextExchangeReminder {
  vehicleId: string
  vehicleModel: string
  monthsSinceLast: number
  message: string
}

export const nextExchangeReminder: NextExchangeReminder = {
  vehicleId: "v1",
  vehicleModel: "카니발 4세대",
  monthsSinceLast: 6,
  message: "곧 오일 교환할 시기예요!",
}

export const adminClaims: AdminClaim[] = [
  {
    id: "CL-001",
    type: "claim",
    text: "정비사가 약속한 시간보다 30분 늦게 도착",
    createdAt: "1시간 전",
  },
  {
    id: "RF-001",
    type: "refund",
    text: "OR-20260505-0009 환불 요청",
    createdAt: "2시간 전",
  },
]

export const weeklyRevenue: DailyRevenue[] = [
  { date: "4/29", revenue: 1240000, orders: 11 },
  { date: "4/30", revenue: 1580000, orders: 14 },
  { date: "5/1", revenue: 1820000, orders: 16 },
  { date: "5/2", revenue: 2150000, orders: 19 },
  { date: "5/3", revenue: 1670000, orders: 15 },
  { date: "5/4", revenue: 1390000, orders: 12 },
  { date: "5/5", revenue: 1920000, orders: 17 },
]
