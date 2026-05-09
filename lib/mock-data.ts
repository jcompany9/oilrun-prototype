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
  {
    id: "OR-006",
    customerName: "한지우",
    customerPhone: "010-1234-5678",
    vehiclePlate: "12가7788",
    vehicleModel: "그랜저 IG",
    menuName: "프리미엄 합성유 0W-20",
    menuOilSpec: "0W-20 합성유",
    addOptions: [],
    district: "강남구",
    address: "강남구 청담동 45-12",
    location: { lat: 37.5208, lng: 127.0473 },
    scheduledAt: new Date(2026, 4, 8, 15, 0),
    status: "scheduled",
    total: 129000,
    distance: 5.4,
    timeUntil: "5월 8일 (금) 오후",
    mechanicId: "k3",
    accessMethod: "remote_unlock",
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

export const DEMO_TODAY = new Date(2026, 4, 5)

const HOLIDAY_KEYS = new Set<string>([
  "2026-05-13",
])

const SLOT_TIMES = [
  "09:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-17:00",
  "17:00-19:00",
  "19:00-21:00",
] as const

export interface DaySlot {
  time: string
  available: boolean
}

export interface AvailabilityDay {
  date: string
  dateObj: Date
  slots: DaySlot[]
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function isHoliday(date: Date): boolean {
  if (date.getDay() === 0) return true
  return HOLIDAY_KEYS.has(toDateKey(date))
}

export function getAvailableSlotsForDate(date: Date): DaySlot[] {
  if (isHoliday(date)) {
    return SLOT_TIMES.map((t) => ({ time: t, available: false }))
  }
  const day = date.getDay()
  const dateNum = date.getDate()

  if (day === 6) {
    return SLOT_TIMES.map((t) => ({
      time: t,
      available:
        t === "09:00-11:00" ||
        t === "11:00-13:00" ||
        t === "13:00-15:00",
    }))
  }

  return SLOT_TIMES.map((t, i) => {
    if (t === "19:00-21:00") return { time: t, available: false }
    const blocked = (dateNum * 3 + i * 7) % 11 === 0
    return { time: t, available: !blocked }
  })
}

export function buildAvailability(
  daysAhead = 14,
  base: Date = DEMO_TODAY
): AvailabilityDay[] {
  const out: AvailabilityDay[] = []
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    out.push({
      date: toDateKey(d),
      dateObj: d,
      slots: getAvailableSlotsForDate(d),
    })
  }
  return out
}

export const availableSlots: AvailabilityDay[] = buildAvailability(14, DEMO_TODAY)

const KO_WEEKDAY_SHORT = ["일", "월", "화", "수", "목", "금", "토"]
const KO_WEEKDAY_LONG = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
]

export function formatDateKorean(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${KO_WEEKDAY_SHORT[date.getDay()]})`
}

export function formatDateKoreanFull(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${KO_WEEKDAY_LONG[date.getDay()]})`
}

function periodHour(t: string): { period: "오전" | "오후"; hour: number } {
  const [hStr] = t.split(":")
  const h = Number(hStr)
  const period: "오전" | "오후" = h < 12 ? "오전" : "오후"
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return { period, hour }
}

export function formatTimeRange(slot: string): string {
  const [start, end] = slot.split("-")
  if (!start || !end) return slot
  const s = periodHour(start)
  const e = periodHour(end)
  if (s.period === e.period) {
    return `${s.period} ${s.hour}:00 - ${e.hour}:00`
  }
  return `${s.period} ${s.hour}:00 - ${e.period} ${e.hour}:00`
}

export function findAvailabilityDay(
  dateKey: string
): AvailabilityDay | undefined {
  return availableSlots.find((d) => d.date === dateKey)
}

// =============================================================================
// SaaS-related mock data (Core SaaS + Creator module)
// =============================================================================

export type SaasChannel =
  | "kakao"
  | "phone"
  | "naver"
  | "oilrun"
  | "self"
  | "youtube"

export const channelLabel: Record<SaasChannel, string> = {
  kakao: "카카오톡",
  phone: "전화",
  naver: "네이버",
  oilrun: "OilRun",
  self: "자사앱",
  youtube: "유튜브",
}

export const channelEmoji: Record<SaasChannel, string> = {
  kakao: "💬",
  phone: "📞",
  naver: "🟢",
  oilrun: "🛢️",
  self: "📱",
  youtube: "▶️",
}

export const channelColor: Record<SaasChannel, { bg: string; fg: string }> = {
  kakao: { bg: "#FEF3C7", fg: "#A16207" },
  phone: { bg: "#E5E7EB", fg: "#374151" },
  naver: { bg: "#DCFCE7", fg: "#15803D" },
  oilrun: { bg: "#DBEAFE", fg: "#1E40AF" },
  self: { bg: "#EDE9FE", fg: "#6D28D9" },
  youtube: { bg: "#FEE2E2", fg: "#B91C1C" },
}

export interface SaasLocation {
  id: string
  name: string
  shortName: string
  address: string
  phone: string
  staffCount: number
  todayRevenue: number
  monthRevenue: number
  todayJobs: number
  isMain: boolean
}

export const saasLocations: SaasLocation[] = [
  {
    id: "main",
    name: "형제자동차정비 본점",
    shortName: "본점",
    address: "서울시 강남구 역삼동 123-45",
    phone: "02-123-4567",
    staffCount: 5,
    todayRevenue: 1240000,
    monthRevenue: 28500000,
    todayJobs: 14,
    isMain: true,
  },
  {
    id: "branch1",
    name: "형제자동차정비 송파점",
    shortName: "2호점",
    address: "서울시 송파구 잠실동 200-12",
    phone: "02-456-7890",
    staffCount: 3,
    todayRevenue: 670000,
    monthRevenue: 14200000,
    todayJobs: 7,
    isMain: false,
  },
]

export interface SaasStaff {
  id: string
  name: string
  role: "owner" | "senior" | "junior" | "intern" | "desk"
  roleLabel: string
  locationId: string
  phone: string
  avatar: string
  todayJobs: number
  isOff?: boolean
}

export const saasStaff: SaasStaff[] = [
  { id: "s1", name: "김형제", role: "owner", roleLabel: "사장", locationId: "main", phone: "010-1234-5678", avatar: "김", todayJobs: 0 },
  { id: "s2", name: "박정비", role: "senior", roleLabel: "수석정비사", locationId: "main", phone: "010-1234-5678", avatar: "박", todayJobs: 4 },
  { id: "s3", name: "이기사", role: "senior", roleLabel: "정비사", locationId: "main", phone: "010-1234-5678", avatar: "이", todayJobs: 4 },
  { id: "s4", name: "최기사", role: "junior", roleLabel: "정비사", locationId: "main", phone: "010-1234-5678", avatar: "최", todayJobs: 3 },
  { id: "s5", name: "정매니저", role: "desk", roleLabel: "데스크", locationId: "main", phone: "010-1234-5678", avatar: "정", todayJobs: 0 },
  { id: "s6", name: "한기사", role: "senior", roleLabel: "수석정비사", locationId: "branch1", phone: "010-1234-5678", avatar: "한", todayJobs: 4 },
  { id: "s7", name: "조기사", role: "junior", roleLabel: "정비사", locationId: "branch1", phone: "010-1234-5678", avatar: "조", todayJobs: 3 },
  { id: "s8", name: "윤기사", role: "intern", roleLabel: "견습", locationId: "branch1", phone: "010-1234-5678", avatar: "윤", todayJobs: 0, isOff: true },
]

export type SaasJobType =
  | "oil"
  | "tire"
  | "blackbox"
  | "inspection"
  | "battery"
  | "general"
  | "house_call"

export const jobTypeLabel: Record<SaasJobType, string> = {
  oil: "오일교환",
  tire: "타이어",
  blackbox: "블랙박스",
  inspection: "점검",
  battery: "배터리",
  general: "정비",
  house_call: "출장",
}

export const jobTypeEmoji: Record<SaasJobType, string> = {
  oil: "🛢️",
  tire: "🛞",
  blackbox: "📹",
  inspection: "🔍",
  battery: "🔋",
  general: "🔧",
  house_call: "🚐",
}

export const jobTypeColor: Record<SaasJobType, string> = {
  oil: "#1E40AF",
  tire: "#0F766E",
  blackbox: "#7C3AED",
  inspection: "#0891B2",
  battery: "#CA8A04",
  general: "#6B7280",
  house_call: "#F97316",
}

export interface SaasJob {
  id: string
  channel: SaasChannel
  jobType: SaasJobType
  title: string
  customerName: string
  customerPhone: string
  vehiclePlate: string
  vehicleModel: string
  date?: string // YYYY-MM-DD; 없으면 오늘로 처리
  startHour: number
  startMinute: number
  durationMin: number
  staffId?: string
  locationId: string
  status: OrderStatus
  total: number
  isHouseCall?: boolean
  address?: string
  videoRef?: string
  notes?: string
}

const buildJob = (
  id: string,
  channel: SaasChannel,
  jobType: SaasJobType,
  customerName: string,
  vehiclePlate: string,
  vehicleModel: string,
  startHour: number,
  startMinute: number,
  durationMin: number,
  staffId: string,
  locationId: string,
  status: OrderStatus,
  total: number,
  extra: Partial<SaasJob> = {}
): SaasJob => ({
  id,
  channel,
  jobType,
  title: jobTypeLabel[jobType],
  customerName,
  customerPhone: "010-1234-5678",
  vehiclePlate,
  vehicleModel,
  startHour,
  startMinute,
  durationMin,
  staffId,
  locationId,
  status,
  total,
  ...extra,
})

// 본점 + 2호점 today 일정 (2026-05-05 화요일)
export const saasJobs: SaasJob[] = [
  // === 본점 ===
  buildJob("J-001", "kakao", "oil", "김민수", "12가3456", "카니발 4세대", 9, 0, 30, "s2", "main", "completed", 89000),
  buildJob("J-002", "naver", "blackbox", "이서연", "34나5678", "쏘나타 DN8", 9, 30, 90, "s3", "main", "completed", 350000),
  buildJob("J-003", "kakao", "inspection", "박지호", "56다7890", "아반떼 CN7", 10, 0, 60, "s4", "main", "completed", 50000),
  buildJob("J-004", "phone", "tire", "최예린", "78라9012", "쏘렌토 MQ4", 11, 0, 60, "s2", "main", "completed", 280000),
  buildJob("J-005", "oilrun", "house_call", "정도윤", "90마1234", "모닝 JA", 11, 0, 60, "s3", "main", "completed", 89000, { isHouseCall: true, address: "강남구 삼성동 88-2" }),
  buildJob("J-006", "kakao", "oil", "한지우", "12가7788", "그랜저 IG", 13, 0, 30, "s4", "main", "in_progress", 129000),
  buildJob("J-007", "self", "battery", "강민준", "23나4455", "투싼 NX4", 13, 30, 30, "s2", "main", "in_progress", 150000),
  buildJob("J-008", "youtube", "blackbox", "송지유", "45다6677", "K5 DL3", 14, 0, 90, "s3", "main", "scheduled", 350000, { videoRef: "video-002" }),
  buildJob("J-009", "oilrun", "house_call", "윤재민", "67라8899", "팰리세이드", 14, 30, 60, "s4", "main", "scheduled", 99000, { isHouseCall: true, address: "서초구 반포동 67-8" }),
  buildJob("J-010", "phone", "oil", "조하늘", "89마9900", "셀토스", 15, 0, 30, "s2", "main", "scheduled", 89000),
  buildJob("J-011", "phone", "tire", "임수아", "01바1122", "스파크", 16, 0, 60, "s3", "main", "scheduled", 240000),
  buildJob("J-012", "youtube", "inspection", "노현우", "23사3344", "EV6", 16, 30, 60, "s4", "main", "scheduled", 60000, { videoRef: "video-005" }),
  buildJob("J-013", "kakao", "oil", "백나연", "45아5566", "G80", 17, 0, 30, "s2", "main", "scheduled", 169000),
  buildJob("J-014", "oilrun", "house_call", "구하준", "67자7788", "스타리아", 17, 30, 60, "s3", "main", "scheduled", 89000, { isHouseCall: true, address: "강남구 청담동 45-12" }),

  // === 2호점 ===
  buildJob("J-015", "kakao", "oil", "장민서", "11가1234", "K3", 9, 30, 30, "s6", "branch1", "completed", 89000),
  buildJob("J-016", "naver", "blackbox", "오시현", "22나2345", "쏘나타 DN8", 10, 30, 90, "s6", "branch1", "completed", 350000),
  buildJob("J-017", "self", "inspection", "양도윤", "33다3456", "투싼 NX4", 11, 30, 60, "s7", "branch1", "completed", 60000),
  buildJob("J-018", "phone", "tire", "권유나", "44라4567", "스포티지", 13, 0, 60, "s6", "branch1", "in_progress", 380000),
  buildJob("J-019", "self", "battery", "남예준", "55마5678", "QM6", 14, 30, 30, "s7", "branch1", "scheduled", 180000),
  buildJob("J-020", "youtube", "oil", "유시우", "66바6789", "쏘나타 DN8", 15, 30, 30, "s6", "branch1", "scheduled", 89000, { videoRef: "video-001" }),
  buildJob("J-021", "oilrun", "house_call", "표지안", "77사7890", "코나", 16, 30, 60, "s6", "branch1", "scheduled", 89000, { isHouseCall: true, address: "송파구 잠실동 200-12" }),
]

// "새 예약 동시 들어옴" 데모용 — 자동 배정 시뮬레이션
export interface SaasIncomingBooking {
  id: string
  channel: SaasChannel
  jobType: SaasJobType
  customerName: string
  vehiclePlate: string
  vehicleModel: string
  preferredTime: string
  total: number
  videoRef?: string
  message?: string
}

export const saasIncomingBookings: SaasIncomingBooking[] = [
  {
    id: "I-001",
    channel: "kakao",
    jobType: "blackbox",
    customerName: "홍길동",
    vehiclePlate: "98가1234",
    vehicleModel: "K7 프리미어",
    preferredTime: "오늘 오후",
    total: 350000,
    message: "앞뒤 2채널로 부탁드려요",
  },
  {
    id: "I-002",
    channel: "phone",
    jobType: "oil",
    customerName: "장영실",
    vehiclePlate: "76나5678",
    vehicleModel: "그랜저 IG",
    preferredTime: "내일 오전",
    total: 89000,
  },
  {
    id: "I-003",
    channel: "youtube",
    jobType: "inspection",
    customerName: "김유튜브",
    vehiclePlate: "54다9012",
    vehicleModel: "K5 DL3",
    preferredTime: "주말 오후",
    total: 50000,
    videoRef: "video-001",
    message: "오일 교환 영상 보고 점검 받으러 가요",
  },
]

// Customers (단골 차주)
export interface SaasCustomer {
  id: string
  name: string
  phone: string
  vehiclePlate: string
  vehicleModel: string
  vehicleYear: number
  firstVisit: string
  visitCount: number
  totalSpent: number
  lastServiceDate: string
  lastServiceType: SaasJobType
  lastServiceMenu: string
  nextDueLabel: string
  nextDueType?: SaasJobType
  isDue: boolean
  isVip?: boolean
  source: SaasChannel
  videoRef?: string
}

export const saasCustomers: SaasCustomer[] = [
  {
    id: "c1",
    name: "김민수",
    phone: "010-1111-2222",
    vehiclePlate: "12가3456",
    vehicleModel: "카니발 4세대",
    vehicleYear: 2022,
    firstVisit: "2024-03-12",
    visitCount: 7,
    totalSpent: 1230000,
    lastServiceDate: "2025-11-12",
    lastServiceType: "oil",
    lastServiceMenu: "기본형 5W-30",
    nextDueLabel: "오일 교환 권장",
    nextDueType: "oil",
    isDue: true,
    isVip: true,
    source: "kakao",
  },
  {
    id: "c2",
    name: "이서연",
    phone: "010-2222-3333",
    vehiclePlate: "34나5678",
    vehicleModel: "쏘나타 DN8",
    vehicleYear: 2021,
    firstVisit: "2023-08-04",
    visitCount: 12,
    totalSpent: 2840000,
    lastServiceDate: "2026-05-05",
    lastServiceType: "blackbox",
    lastServiceMenu: "블랙박스 2채널",
    nextDueLabel: "1년 후 점검",
    isDue: false,
    isVip: true,
    source: "naver",
  },
  {
    id: "c3",
    name: "박지호",
    phone: "010-3333-4444",
    vehiclePlate: "56다7890",
    vehicleModel: "아반떼 CN7",
    vehicleYear: 2023,
    firstVisit: "2025-02-18",
    visitCount: 3,
    totalSpent: 320000,
    lastServiceDate: "2025-12-02",
    lastServiceType: "oil",
    lastServiceMenu: "프리미엄 0W-20",
    nextDueLabel: "오일 교환 임박",
    nextDueType: "oil",
    isDue: true,
    source: "self",
  },
  {
    id: "c4",
    name: "송지유",
    phone: "010-4444-5555",
    vehiclePlate: "45다6677",
    vehicleModel: "K5 DL3",
    vehicleYear: 2022,
    firstVisit: "2026-04-22",
    visitCount: 1,
    totalSpent: 89000,
    lastServiceDate: "2026-04-22",
    lastServiceType: "oil",
    lastServiceMenu: "기본형 5W-30",
    nextDueLabel: "다음 정비까지 5개월",
    isDue: false,
    source: "youtube",
    videoRef: "video-001",
  },
  {
    id: "c5",
    name: "노현우",
    phone: "010-5555-6666",
    vehiclePlate: "23사3344",
    vehicleModel: "EV6",
    vehicleYear: 2024,
    firstVisit: "2025-09-30",
    visitCount: 2,
    totalSpent: 110000,
    lastServiceDate: "2026-01-15",
    lastServiceType: "inspection",
    lastServiceMenu: "정기점검",
    nextDueLabel: "정기점검 권장",
    nextDueType: "inspection",
    isDue: true,
    source: "youtube",
    videoRef: "video-005",
  },
  {
    id: "c6",
    name: "한지우",
    phone: "010-6666-7777",
    vehiclePlate: "12가7788",
    vehicleModel: "그랜저 IG",
    vehicleYear: 2020,
    firstVisit: "2022-11-08",
    visitCount: 18,
    totalSpent: 4120000,
    lastServiceDate: "2026-05-05",
    lastServiceType: "oil",
    lastServiceMenu: "프리미엄 0W-20",
    nextDueLabel: "5개월 후 권장",
    isDue: false,
    isVip: true,
    source: "phone",
  },
  {
    id: "c7",
    name: "최예린",
    phone: "010-7777-8888",
    vehiclePlate: "78라9012",
    vehicleModel: "쏘렌토 MQ4",
    vehicleYear: 2022,
    firstVisit: "2024-06-15",
    visitCount: 5,
    totalSpent: 920000,
    lastServiceDate: "2026-05-05",
    lastServiceType: "tire",
    lastServiceMenu: "타이어 4본",
    nextDueLabel: "오일 교환까지 2개월",
    isDue: false,
    source: "phone",
  },
  {
    id: "c8",
    name: "정도윤",
    phone: "010-8888-9999",
    vehiclePlate: "90마1234",
    vehicleModel: "모닝 JA",
    vehicleYear: 2020,
    firstVisit: "2025-04-01",
    visitCount: 4,
    totalSpent: 380000,
    lastServiceDate: "2026-05-05",
    lastServiceType: "house_call",
    lastServiceMenu: "출장 오일 5W-30",
    nextDueLabel: "6개월 후 권장",
    isDue: false,
    source: "oilrun",
  },
]

// 채널별 매출 비중 (이번 달)
export interface ChannelRevenueShare {
  channel: SaasChannel
  share: number
  monthRevenue: number
  bookings: number
}

export const channelRevenueShare: ChannelRevenueShare[] = [
  { channel: "kakao", share: 32, monthRevenue: 9120000, bookings: 142 },
  { channel: "phone", share: 25, monthRevenue: 7125000, bookings: 98 },
  { channel: "naver", share: 18, monthRevenue: 5130000, bookings: 64 },
  { channel: "self", share: 12, monthRevenue: 3420000, bookings: 51 },
  { channel: "youtube", share: 8, monthRevenue: 2280000, bookings: 32 },
  { channel: "oilrun", share: 5, monthRevenue: 1425000, bookings: 21 },
]

// 메뉴별 매출 (이번 달)
export interface MenuRevenueRow {
  menuName: string
  jobType: SaasJobType
  count: number
  revenue: number
}

export const menuRevenueByMonth: MenuRevenueRow[] = [
  { menuName: "오일교환 (기본 5W-30)", jobType: "oil", count: 89, revenue: 7921000 },
  { menuName: "오일교환 (프리미엄 0W-20)", jobType: "oil", count: 42, revenue: 5418000 },
  { menuName: "타이어 교체", jobType: "tire", count: 34, revenue: 8400000 },
  { menuName: "블랙박스 설치", jobType: "blackbox", count: 18, revenue: 6300000 },
  { menuName: "정기점검", jobType: "inspection", count: 56, revenue: 2800000 },
  { menuName: "배터리 교체", jobType: "battery", count: 12, revenue: 1800000 },
  { menuName: "출장 오일", jobType: "house_call", count: 31, revenue: 3193000 },
]

// 지점별 일별 매출 추이 (지난 7일)
export interface LocationDailyRevenue {
  date: string
  main: number
  branch1: number
}

export const locationDailyRevenue: LocationDailyRevenue[] = [
  { date: "4/29", main: 980000, branch1: 540000 },
  { date: "4/30", main: 1340000, branch1: 720000 },
  { date: "5/1", main: 1580000, branch1: 810000 },
  { date: "5/2", main: 1760000, branch1: 920000 },
  { date: "5/3", main: 1290000, branch1: 670000 },
  { date: "5/4", main: 1100000, branch1: 580000 },
  { date: "5/5", main: 1240000, branch1: 670000 },
]

// =============================================================================
// 차주 부킹 페이지 (public surface) — /book/[shopSlug]
// =============================================================================

export type CarCategory = "compact" | "midsize" | "suv" | "luxury" | "ev"

export const carCategoryLabel: Record<CarCategory, string> = {
  compact: "경/소형",
  midsize: "준중형/중형",
  suv: "SUV/RV",
  luxury: "수입/대형",
  ev: "전기차",
}

export const carCategoryExamples: Record<CarCategory, string> = {
  compact: "모닝, 스파크, 캐스퍼",
  midsize: "아반떼, 쏘나타, K5",
  suv: "투싼, 쏘렌토, 카니발",
  luxury: "벤츠, BMW, 그랜저",
  ev: "EV6, 아이오닉5, 테슬라",
}

export interface BookingMenu {
  id: string
  jobType: SaasJobType
  name: string
  description: string
  prices: Record<CarCategory, number | null>
  durationMin: number
  recommended?: boolean
  isHouseCall?: boolean
}

export const bookingMenus: BookingMenu[] = [
  {
    id: "bm1",
    jobType: "oil",
    name: "엔진오일 교환 (기본 5W-30)",
    description: "표준 합성유, 1만km 주기 권장",
    prices: { compact: 79000, midsize: 89000, suv: 99000, luxury: 119000, ev: null },
    durationMin: 30,
    recommended: true,
  },
  {
    id: "bm2",
    jobType: "oil",
    name: "엔진오일 교환 (프리미엄 0W-20)",
    description: "저점도, 신차·연비 향상",
    prices: { compact: 119000, midsize: 129000, suv: 149000, luxury: 169000, ev: null },
    durationMin: 30,
  },
  {
    id: "bm-house",
    jobType: "oil",
    name: "출장 엔진오일 교환",
    description: "기사가 직접 방문 · 주차장·자택·사무실 어디든 (기본 5W-30)",
    prices: { compact: 99000, midsize: 109000, suv: 119000, luxury: 139000, ev: null },
    durationMin: 60,
    isHouseCall: true,
  },
  {
    id: "bm3",
    jobType: "blackbox",
    name: "블랙박스 설치 (앞·뒤 2채널)",
    description: "QHD 화질 + 32GB 메모리 포함",
    prices: { compact: 350000, midsize: 350000, suv: 380000, luxury: 420000, ev: 380000 },
    durationMin: 90,
  },
  {
    id: "bm4",
    jobType: "tire",
    name: "타이어 교체 (1본)",
    description: "정렬·밸런스 포함 (브랜드별 별도 견적)",
    prices: { compact: 120000, midsize: 140000, suv: 180000, luxury: 250000, ev: 200000 },
    durationMin: 45,
  },
  {
    id: "bm5",
    jobType: "battery",
    name: "배터리 교체",
    description: "국산/수입 모두 대응",
    prices: { compact: 130000, midsize: 150000, suv: 180000, luxury: 250000, ev: 350000 },
    durationMin: 30,
  },
  {
    id: "bm6",
    jobType: "inspection",
    name: "정기 종합점검",
    description: "엔진·하부·타이어·전기 시스템 전체",
    prices: { compact: 50000, midsize: 50000, suv: 60000, luxury: 80000, ev: 60000 },
    durationMin: 60,
  },
]

// 경고등 종류 (증상 b)
export interface WarningLight {
  id: string
  emoji: string
  name: string
  severity: "high" | "mid" | "low"
  hint: string
}

export const warningLights: WarningLight[] = [
  { id: "wl1", emoji: "🔧", name: "엔진 경고등", severity: "high", hint: "즉시 점검 필요할 수 있어요" },
  { id: "wl2", emoji: "🛢️", name: "엔진오일 경고등", severity: "high", hint: "오일 부족 또는 오일펌프 이상" },
  { id: "wl3", emoji: "🌡️", name: "엔진 과열", severity: "high", hint: "주행 중지 후 점검 권장" },
  { id: "wl4", emoji: "🔋", name: "배터리 경고등", severity: "mid", hint: "충전 시스템 또는 배터리 노후" },
  { id: "wl5", emoji: "🛞", name: "타이어 공기압", severity: "low", hint: "공기압 점검 후 보충" },
  { id: "wl6", emoji: "⚠️", name: "ABS 경고등", severity: "mid", hint: "제동 관련 시스템 점검" },
  { id: "wl7", emoji: "❓", name: "잘 모르겠어요", severity: "mid", hint: "사진 올리시면 사장님이 확인해드려요" },
]

// 정비소 퍼블릭 정보
export interface SaasPublicShop {
  slug: string
  name: string
  shortName: string
  ownerName: string
  ownerGreeting: string
  address: string
  phone: string
  hours: string
  hasCreatorModule: boolean
  channelName?: string
  channelHandle?: string
  channelSubscribers?: number
  channelDescription?: string
}

export const saasPublicShops: SaasPublicShop[] = [
  {
    slug: "hyungje",
    name: "형제자동차정비",
    shortName: "형제카센터",
    ownerName: "김형제",
    ownerGreeting: "30년 경력, 친절·정직 약속드립니다",
    address: "서울시 강남구 역삼동 123-45",
    phone: "02-123-4567",
    hours: "평일 09:00–19:00 / 토 09:00–14:00 / 일·공휴일 휴무",
    hasCreatorModule: true,
    channelName: "형제카센터TV",
    channelHandle: "@hyungje_tv",
    channelSubscribers: 130000,
    channelDescription: "30년차 정비사가 알려주는 자동차 상식, 셀프점검, 정비 노하우",
  },
]

// =============================================================================
// Creator 모듈 — YouTube 영상 → 매출 funnel
// =============================================================================

export interface CreatorVideo {
  id: string
  title: string
  thumbnailEmoji: string
  publishedAt: string
  duration: string
  views: number
  bookingClicks: number
  bookings: number
  revenue: number
  isTopPerformer?: boolean
}

export const creatorVideos: CreatorVideo[] = [
  {
    id: "video-001",
    title: "엔진오일 교환 주기, 1만km vs 1만5천km 진실",
    thumbnailEmoji: "🛢️",
    publishedAt: "2026-04-18",
    duration: "12:34",
    views: 142000,
    bookingClicks: 3400,
    bookings: 87,
    revenue: 7250000,
    isTopPerformer: true,
  },
  {
    id: "video-002",
    title: "블랙박스 직접 설치 vs 정비소, 뭐가 나을까?",
    thumbnailEmoji: "📹",
    publishedAt: "2026-04-02",
    duration: "8:21",
    views: 89000,
    bookingClicks: 2100,
    bookings: 42,
    revenue: 14700000,
    isTopPerformer: true,
  },
  {
    id: "video-003",
    title: "타이어 공기압 경고등 떴을 때 5분 자가점검",
    thumbnailEmoji: "🛞",
    publishedAt: "2026-03-22",
    duration: "5:48",
    views: 67000,
    bookingClicks: 980,
    bookings: 18,
    revenue: 2160000,
  },
  {
    id: "video-004",
    title: "배터리 방전 직전 신호 5가지 (꼭 확인하세요)",
    thumbnailEmoji: "🔋",
    publishedAt: "2026-03-08",
    duration: "9:15",
    views: 54000,
    bookingClicks: 760,
    bookings: 15,
    revenue: 2250000,
  },
  {
    id: "video-005",
    title: "엔진경고등 떴을 때 절대 하면 안 되는 행동",
    thumbnailEmoji: "🔧",
    publishedAt: "2026-02-19",
    duration: "11:02",
    views: 38000,
    bookingClicks: 540,
    bookings: 12,
    revenue: 720000,
  },
]

export interface CreatorFunnel {
  videoViews: number
  linkClicks: number
  pageViews: number
  bookings: number
  revenue: number
  clickThroughRate: number
  bookingConversionRate: number
}

export const creatorFunnel30d: CreatorFunnel = {
  videoViews: 390000,
  linkClicks: 7780,
  pageViews: 6450,
  bookings: 174,
  revenue: 27080000,
  clickThroughRate: 2.0,
  bookingConversionRate: 2.7,
}

export interface CreatorChannelMeta {
  shopSlug: string
  channelName: string
  channelHandle: string
  subscribers: number
  videoCount: number
  totalViews: number
}

export const creatorChannelMeta: CreatorChannelMeta = {
  shopSlug: "hyungje",
  channelName: "형제카센터TV",
  channelHandle: "@hyungje_tv",
  subscribers: 130000,
  videoCount: 218,
  totalViews: 8430000,
}

export function findVideoById(id?: string): CreatorVideo | undefined {
  if (!id) return undefined
  return creatorVideos.find((v) => v.id === id)
}

export function findPublicShopBySlug(slug: string): SaasPublicShop | undefined {
  return saasPublicShops.find((s) => s.slug === slug)
}

export type TimeSlotKind = "asap" | "tomorrow_am" | "tomorrow_pm" | "custom"

export interface TimeDisplay {
  primary: string
  secondary: string
  isScheduled: boolean
}

export function buildTimeDisplay(
  timeSlot: string | null,
  timeDate?: string | null,
  timeRange?: string | null
): TimeDisplay | null {
  if (!timeSlot) return null
  switch (timeSlot) {
    case "asap":
      return {
        primary: "가능한 빨리",
        secondary: "오늘 16:00 - 18:00 도착 예정",
        isScheduled: false,
      }
    case "tomorrow_am":
      return {
        primary: "내일 오전",
        secondary: "09:00 - 12:00 도착 예정",
        isScheduled: false,
      }
    case "tomorrow_pm":
      return {
        primary: "내일 오후",
        secondary: "14:00 - 18:00 도착 예정",
        isScheduled: false,
      }
    case "custom": {
      if (!timeDate || !timeRange) {
        return {
          primary: "사전 예약",
          secondary: "",
          isScheduled: true,
        }
      }
      const day = findAvailabilityDay(timeDate)
      const dateObj = day?.dateObj ?? new Date(timeDate)
      return {
        primary: formatDateKoreanFull(dateObj),
        secondary: formatTimeRange(timeRange),
        isScheduled: true,
      }
    }
    default:
      return null
  }
}
