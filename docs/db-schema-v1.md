# DB 스키마 설계서 v1

> 작성일: 2026-05-06
> 기반: `lib/mock-data.ts` + `lib/admin-mock.ts`
> 대상 DB: PostgreSQL 15+
> ORM: Prisma

## 1. ER 다이어그램 (개요)

```
                 ┌──────┐
                 │ User │ (phone, role, ciHash)
                 └──┬───┘
        ┌───────────┼───────────┬──────────────┐
        ▼           ▼           ▼              ▼
   Customer       Shop      Mechanic       Admin
   Profile      (1:N docs,  Profile       Profile
        │       service area)  │
   ┌────┼─────┐                │
   ▼    ▼     ▼                │
 Vehicle Address Order ◄───────┴── OrderAssignment
                  │              (수락/거부 이력)
        ┌─────────┼──────┬─────────┬────────┐
        ▼         ▼      ▼         ▼        ▼
     Payment  Refund  AddOn   OrderEvent  Review
                                (audit log)
                  │
                  ▼
             Settlement ── SettlementItem

  Catalog: VehicleManufacturer ─ VehicleModel
           OilProduct ─ OilProductPrice (카테고리별)
           AddOnProduct ─ AddOnProductPrice
```

---

## 2. 주요 설계 결정

| # | 결정 | 이유 |
|---|---|---|
| 1 | 단일 `User` + 역할별 Profile | 한 사람이 차주이면서 정비사일 수도 있음. 역할은 `User.role`, 도메인 데이터는 별도 테이블. |
| 2 | 주문은 vehicle/menu/address `snapshot` 보유 | 메뉴 가격이나 차량 정보가 추후 바뀌어도 과거 영수증·정산이 변하면 안 됨. |
| 3 | 차종 카테고리별 정찰제 → `OilProductPrice` 별도 테이블 | CLAUDE.md 규칙 반영. (메뉴, 카테고리) 조합이 PK. `effectiveFrom`으로 가격 이력 보존. |
| 4 | `OrderEvent` audit log 분리 | 상태 변경 시점·행위자·이전값 추적. 분쟁·CS 핵심 자료. |
| 5 | `OrderAssignment`로 수락/거부 이력 | 정비소가 자유롭게 거절하는 비즈니스 규칙 → 시도-응답 1:N. 매칭 실패 분석에도 사용. |
| 6 | 차주는 `mechanicId`를 배정 후에만 조회 | DB는 항상 저장, 단 API 응답에서 `status >= MATCHED`까지 마스킹. |
| 7 | 금액·수수료율 모두 snapshot | 정산 시점에 수수료율이 바뀌어도 과거 주문 정산 무결성 보장. |
| 8 | 위치는 `Decimal(10,7)` 또는 PostGIS | MVP는 Decimal로 충분. 반경 검색이 빈번해지면 PostGIS `geography` 컬럼으로 마이그레이션. |
| 9 | 민감정보 hash 컬럼 분리 | 휴대폰·CI·DI는 검색용 hash + 본문 암호화 별도 컬럼. 결제정보는 절대 미저장. |
| 10 | 소프트 삭제 (`deletedAt`) | 회원 탈퇴 후에도 정산·세무 보존 5년 의무 (전자상거래법). |

---

## 3. Prisma 스키마 초안

### 3.1 Auth · 본인인증

```prisma
enum UserRole { CUSTOMER  SHOP_OWNER  MECHANIC  ADMIN_CS  ADMIN_FINANCE  ADMIN_SUPER }
enum UserStatus { ACTIVE  DORMANT  BLOCKED  DELETED }

model User {
  id              String     @id @default(cuid())
  phone           String     @unique
  phoneVerifiedAt DateTime?
  name            String
  email           String?    @unique
  role            UserRole
  status          UserStatus @default(ACTIVE)
  ciHash          String?    @unique  // 본인인증 CI(중복가입 방지)
  diHash          String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  deletedAt       DateTime?

  customerProfile CustomerProfile?
  shopOwnership   Shop[]            @relation("ShopOwner")
  mechanicProfile MechanicProfile?
  adminProfile    AdminProfile?
  sessions        Session[]

  @@index([role, status])
}

model Session {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash  String   @unique
  ipAddress  String?
  userAgent  String?
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime @default(now())
  @@index([userId])
}

model OtpCode {
  id         String   @id @default(cuid())
  phone      String
  codeHash   String
  purpose    String   // login | signup | phone_change
  expiresAt  DateTime
  consumedAt DateTime?
  attempts   Int      @default(0)
  createdAt  DateTime @default(now())
  @@index([phone, purpose])
}

model IdentityVerification {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  provider   String   // NICE | KCB
  ciHash     String
  diHash     String
  birthYmd   String
  gender     String
  rawPayload Bytes    // 암호화 저장
  verifiedAt DateTime @default(now())
  @@index([ciHash])
}
```

### 3.2 차주·차량·주소

```prisma
model CustomerProfile {
  userId           String   @id
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  marketingOptIn   Boolean  @default(false)
  marketingOptInAt DateTime?
  vehicles         Vehicle[]
  addresses        CustomerAddress[]
  orders           Order[]
}

model CustomerAddress {
  id            String   @id @default(cuid())
  customerId    String
  customer      CustomerProfile @relation(fields: [customerId], references: [userId], onDelete: Cascade)
  label         String?  // "집", "회사"
  address       String
  addressDetail String?
  district      String   // "강남구"
  dong          String?
  zipCode       String?
  lat           Decimal  @db.Decimal(10, 7)
  lng           Decimal  @db.Decimal(10, 7)
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  orders        Order[]  @relation("OrderAddress")
  @@index([customerId])
}

enum FuelType { GASOLINE  DIESEL  LPG  HYBRID  ELECTRIC }
enum VehicleCategory { COMPACT  SEDAN  LARGE_SEDAN  SUV  MINIVAN  IMPORTED  ELECTRIC_NA }

model VehicleManufacturer {
  id     String @id            // "hyundai"
  name   String                 // 한글
  nameEn String
  models VehicleModel[]
}

model VehicleModel {
  id                 String   @id @default(cuid())
  manufacturerId     String
  manufacturer       VehicleManufacturer @relation(fields: [manufacturerId], references: [id])
  name               String   // "쏘나타 DN8"
  modelYearFrom      Int
  modelYearTo        Int?
  category           VehicleCategory
  defaultFuel        FuelType?
  recommendedOilSpec String?
  vehicles           Vehicle[]
  @@index([manufacturerId, name])
}

model Vehicle {
  id          String   @id @default(cuid())
  customerId  String
  customer    CustomerProfile @relation(fields: [customerId], references: [userId], onDelete: Cascade)
  modelId     String?
  model       VehicleModel?   @relation(fields: [modelId], references: [id])
  customModel String?           // 마스터에 없을 때
  plate       String             // 정규화된 차량번호
  year        Int
  fuel        FuelType
  category    VehicleCategory
  oilSpec     String?
  mileage     Int?
  isPrimary   Boolean  @default(false)
  createdAt   DateTime @default(now())
  deletedAt   DateTime?
  orders      Order[]
  @@unique([customerId, plate])
  @@index([customerId])
}
```

### 3.3 카탈로그·정찰제

```prisma
model OilProduct {
  id          String   @id @default(cuid())
  name        String   // "기본형 합성유 5W-30"
  description String
  oilSpec     String   // "5W-30 합성유"
  brand       String?
  recommended Boolean  @default(false)
  active      Boolean  @default(true)
  prices      OilProductPrice[]
}

// 차종 카테고리별 정찰제
model OilProductPrice {
  id            String   @id @default(cuid())
  productId     String
  product       OilProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  category      VehicleCategory
  price         Int      // 원
  effectiveFrom DateTime
  effectiveTo   DateTime?
  @@unique([productId, category, effectiveFrom])
}

model AddOnProduct {
  id     String   @id @default(cuid())
  name   String   // "에어 필터 교체"
  active Boolean  @default(true)
  prices AddOnProductPrice[]
}

model AddOnProductPrice {
  id            String   @id @default(cuid())
  productId     String
  product       AddOnProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  category      VehicleCategory
  price         Int
  effectiveFrom DateTime
  effectiveTo   DateTime?
  @@unique([productId, category, effectiveFrom])
}
```

### 3.4 정비소·서비스영역

```prisma
enum ShopState { PENDING  ACTIVE  SUSPENDED  TERMINATED }

model Shop {
  id              String   @id @default(cuid())
  ownerUserId     String
  owner           User     @relation("ShopOwner", fields: [ownerUserId], references: [id])
  name            String
  businessNumber  String   @unique  // 사업자등록번호
  representative  String
  contactPhone    String
  address         String
  district        String
  lat             Decimal  @db.Decimal(10, 7)
  lng             Decimal  @db.Decimal(10, 7)
  state           ShopState @default(PENDING)
  acceptanceRate  Decimal? @db.Decimal(5, 2)  // 표시용 캐시
  averageRating   Decimal? @db.Decimal(3, 2)

  bankCode        String?
  bankAccount     String?  // 정산 계좌 (암호화)
  bankHolder      String?

  appliedAt       DateTime @default(now())
  approvedAt      DateTime?
  suspendedAt     DateTime?

  documents       ShopDocument[]
  serviceAreas    ShopServiceArea[]
  businessHours   ShopBusinessHour[]
  holidays        ShopHoliday[]
  mechanics       MechanicProfile[]
  orders          Order[]
  settlements     Settlement[]
  @@index([state])
}

enum ShopDocumentType { BUSINESS_LICENSE  MECHANIC_LICENSE  INSURANCE  BANK_BOOK }
enum DocReviewStatus { PENDING  APPROVED  REJECTED }

model ShopDocument {
  id           String   @id @default(cuid())
  shopId       String
  shop         Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  type         ShopDocumentType
  fileUrl      String   // S3 private key
  fileName     String
  reviewStatus DocReviewStatus @default(PENDING)
  reviewNote   String?
  reviewedBy   String?
  reviewedAt   DateTime?
  uploadedAt   DateTime @default(now())
  @@index([shopId, type])
}

model ShopServiceArea {
  id          String  @id @default(cuid())
  shopId      String
  shop        Shop    @relation(fields: [shopId], references: [id], onDelete: Cascade)
  district    String  // "강남구"
  dong        String?
  maxRadiusKm Decimal @db.Decimal(5, 2)
  @@unique([shopId, district, dong])
}

model ShopBusinessHour {
  id        String  @id @default(cuid())
  shopId    String
  shop      Shop    @relation(fields: [shopId], references: [id], onDelete: Cascade)
  weekday   Int     // 0=일 ~ 6=토
  openTime  String  // "09:00"
  closeTime String  // "18:00"
  closed    Boolean @default(false)
  @@unique([shopId, weekday])
}

model ShopHoliday {
  id     String   @id @default(cuid())
  shopId String
  shop   Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  date   DateTime @db.Date
  reason String?
  @@unique([shopId, date])
}
```

### 3.5 정비사·실시간 위치

```prisma
model MechanicProfile {
  userId      String   @id
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  shopId      String
  shop        Shop     @relation(fields: [shopId], references: [id])
  rating      Decimal  @db.Decimal(3, 2)
  active      Boolean  @default(true)
  joinedAt    DateTime @default(now())
  assignments OrderAssignment[]
  locations   MechanicLocation[]
  @@index([shopId])
}

// 실시간 위치 (시계열 — 일정 보존 후 archive)
model MechanicLocation {
  id          String   @id @default(cuid())
  mechanicId  String
  mechanic    MechanicProfile @relation(fields: [mechanicId], references: [userId], onDelete: Cascade)
  lat         Decimal  @db.Decimal(10, 7)
  lng         Decimal  @db.Decimal(10, 7)
  accuracy    Decimal? @db.Decimal(8, 2)
  recordedAt  DateTime @default(now())
  orderId     String?
  @@index([mechanicId, recordedAt])
  @@index([orderId])
}
```

### 3.6 주문 (가장 중요)

```prisma
enum OrderStatus {
  CREATED              // 결제 직전
  PAYMENT_PENDING
  PAYMENT_FAILED
  PAID                 // 매칭 대기
  MATCHING
  MATCHED              // 정비소 배정 완료
  ASSIGNED             // 정비사 지정
  EN_ROUTE
  ARRIVED
  IN_PROGRESS
  COMPLETED
  CANCELED_BY_CUSTOMER
  CANCELED_BY_SHOP
  CANCELED_BY_SYSTEM
  REFUND_REQUESTED
  REFUNDED
  DISPUTED
}

enum AccessMethod { WITH_OWNER  REMOTE_UNLOCK  KEY_DROPOFF  CALL_ON_ARRIVAL }
enum TimePreference { ASAP  TOMORROW_AM  TOMORROW_PM  SCHEDULED }

model Order {
  id          String @id @default(cuid())
  orderNumber String @unique  // OR-20260505-0014 (표시용)

  customerId String
  customer   CustomerProfile @relation(fields: [customerId], references: [userId])
  vehicleId  String
  vehicle    Vehicle @relation(fields: [vehicleId], references: [id])

  // ─── 차량 snapshot (영수증 무결성)
  vehiclePlate    String
  vehicleModel    String
  vehicleCategory VehicleCategory
  vehicleFuel     FuelType

  // ─── 메뉴 snapshot
  oilProductId   String?
  oilProductName String
  oilSpec        String
  oilUnitPrice   Int

  // ─── 주소 snapshot
  addressId     String?
  address       CustomerAddress? @relation("OrderAddress", fields: [addressId], references: [id])
  addressLine   String
  addressDetail String?
  district      String
  lat           Decimal @db.Decimal(10, 7)
  lng           Decimal @db.Decimal(10, 7)

  // ─── 일정
  timePreference TimePreference
  scheduledStart DateTime?
  scheduledEnd   DateTime?

  // ─── 출입
  accessMethod AccessMethod
  accessNote   String?

  // ─── 매칭 결과
  shopId      String?
  shop        Shop?  @relation(fields: [shopId], references: [id])
  mechanicId  String?

  // ─── 금액 (모두 snapshot)
  subtotal         Int
  travelFee        Int     @default(0)
  discount         Int     @default(0)
  totalAmount      Int
  commissionRate   Decimal @db.Decimal(5, 2)
  commissionAmount Int
  payoutAmount     Int

  status      OrderStatus
  matchedAt   DateTime?
  arrivedAt   DateTime?
  startedAt   DateTime?
  completedAt DateTime?
  canceledAt  DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  addOns      OrderAddOn[]
  events      OrderEvent[]
  assignments OrderAssignment[]
  payment     Payment?
  refunds     Refund[]
  review      Review?

  @@index([customerId, createdAt])
  @@index([shopId, status])
  @@index([status, scheduledStart])
}

model OrderAddOn {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  addOnId   String?
  name      String  // snapshot
  unitPrice Int
  @@index([orderId])
}

model OrderEvent {
  id         String   @id @default(cuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  fromStatus OrderStatus?
  toStatus   OrderStatus
  actorType  String   // CUSTOMER | SHOP | MECHANIC | SYSTEM | ADMIN
  actorId    String?
  payload    Json?
  createdAt  DateTime @default(now())
  @@index([orderId, createdAt])
}

enum AssignmentStatus { OFFERED  ACCEPTED  DECLINED  EXPIRED }

model OrderAssignment {
  id            String   @id @default(cuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  shopId        String
  mechanicId    String?
  mechanic      MechanicProfile? @relation(fields: [mechanicId], references: [userId])
  status        AssignmentStatus
  offeredAt     DateTime @default(now())
  respondedAt   DateTime?
  declineReason String?
  expiresAt     DateTime
  @@index([orderId])
  @@index([shopId, status])
}
```

### 3.7 결제·환불·정산

```prisma
enum PaymentStatus { REQUESTED  AUTHORIZED  CAPTURED  CANCELED  FAILED }
enum PaymentMethod { CARD  KAKAOPAY  NAVERPAY  TOSSPAY  BANK_TRANSFER }

model Payment {
  id            String   @id @default(cuid())
  orderId       String   @unique
  order         Order    @relation(fields: [orderId], references: [id])
  provider      String   // toss | portone
  providerTxId  String?
  method        PaymentMethod
  amount        Int
  status        PaymentStatus
  approvedAt    DateTime?
  rawResponse   Json?
  failureReason String?
  receiptUrl    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  refunds       Refund[]
  @@index([providerTxId])
}

enum RefundStatus { REQUESTED  APPROVED  REJECTED  COMPLETED  FAILED }

model Refund {
  id               String   @id @default(cuid())
  orderId          String
  order            Order    @relation(fields: [orderId], references: [id])
  paymentId        String
  payment          Payment  @relation(fields: [paymentId], references: [id])
  amount           Int
  reason           String
  reasonCode       String?  // CUSTOMER_CANCEL | SHOP_NO_SHOW | DISPUTE
  status           RefundStatus
  requestedBy      String
  approvedBy       String?
  providerRefundId String?
  createdAt        DateTime @default(now())
  completedAt      DateTime?
  @@index([orderId])
}

enum SettlementStatus { DRAFT  PENDING  PROCESSING  PAID  FAILED }

model Settlement {
  id               String   @id @default(cuid())
  shopId           String
  shop             Shop     @relation(fields: [shopId], references: [id])
  periodStart      DateTime @db.Date
  periodEnd        DateTime @db.Date
  grossAmount      Int      // GMV
  commissionAmount Int
  refundAmount     Int
  adjustmentAmount Int      @default(0)
  payoutAmount     Int
  status           SettlementStatus
  scheduledAt      DateTime?
  paidAt           DateTime?
  invoiceNumber    String?  // 세금계산서
  createdAt        DateTime @default(now())
  items            SettlementItem[]
  @@unique([shopId, periodStart, periodEnd])
  @@index([status])
}

model SettlementItem {
  id           String   @id @default(cuid())
  settlementId String
  settlement   Settlement @relation(fields: [settlementId], references: [id], onDelete: Cascade)
  orderId      String
  amount       Int
  commission   Int
  payout       Int
  @@index([settlementId])
}
```

### 3.8 알림·CS·리뷰·감사

```prisma
model Review {
  id         String   @id @default(cuid())
  orderId    String   @unique
  order      Order    @relation(fields: [orderId], references: [id])
  customerId String
  shopId     String
  mechanicId String?
  rating     Int      // 1-5
  body       String?
  hidden     Boolean  @default(false)
  createdAt  DateTime @default(now())
  @@index([shopId, createdAt])
}

enum NotificationChannel { KAKAO_ALIMTALK  SMS  PUSH  EMAIL }
enum NotificationStatus  { QUEUED  SENT  DELIVERED  FAILED  BOUNCED }

model NotificationLog {
  id            String   @id @default(cuid())
  userId        String?
  channel       NotificationChannel
  templateCode  String   // 알림톡 템플릿
  destination   String
  payload       Json
  status        NotificationStatus
  providerMsgId String?
  errorMessage  String?
  orderId       String?
  createdAt     DateTime @default(now())
  sentAt        DateTime?
  deliveredAt   DateTime?
  @@index([userId, createdAt])
  @@index([orderId])
}

enum TicketCategory { DELIVERY  PAYMENT  REFUND  SERVICE  OTHER }
enum TicketStatus   { OPEN  IN_PROGRESS  WAITING_USER  CLOSED }

model SupportTicket {
  id           String   @id @default(cuid())
  ticketNumber String   @unique  // TK-201
  customerId   String?
  orderId      String?
  subject      String
  category     TicketCategory
  status       TicketStatus @default(OPEN)
  priority     Int      @default(0)
  assignedTo   String?
  createdAt    DateTime @default(now())
  closedAt     DateTime?
  messages     TicketMessage[]
  @@index([status, createdAt])
}

model TicketMessage {
  id             String   @id @default(cuid())
  ticketId       String
  ticket         SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  authorType     String   // CUSTOMER | ADMIN | SYSTEM
  authorId       String?
  body           String
  attachmentUrls String[]
  createdAt      DateTime @default(now())
  @@index([ticketId, createdAt])
}

model AdminProfile {
  userId      String   @id
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  department  String?
  permissions String[] // 세분화 권한
}

model AuditLog {
  id          String   @id @default(cuid())
  actorUserId String
  action      String   // SHOP_APPROVED | ORDER_CANCELED ...
  targetType  String
  targetId    String
  before      Json?
  after       Json?
  ipAddress   String?
  createdAt   DateTime @default(now())
  @@index([actorUserId, createdAt])
  @@index([targetType, targetId])
}

model AppConfig {
  key       String   @id  // commission_rate | matching_timeout_sec | ...
  value     Json
  updatedAt DateTime @updatedAt
}
```

---

## 4. 핵심 invariant (DB 또는 앱에서 강제)

1. `Order.status` 변경 시 반드시 `OrderEvent` row 1개 추가 (트리거 또는 transaction)
2. `Order.status >= MATCHED`이기 전엔 API 응답에서 `mechanicId`, `shop` 마스킹
3. `Payment.status = CAPTURED` 없이 `Order.status >= MATCHING` 불가
4. `Settlement.payoutAmount = grossAmount - commissionAmount - refundAmount + adjustmentAmount` (체크 제약)
5. `commissionRate`는 주문 생성 시점 `AppConfig`에서 snapshot, 정산 시 절대 미변경
6. `Vehicle.deletedAt` 후에도 `Order.vehicleId` FK 유지 (snapshot 컬럼이 표시 담당)

---

## 5. 인덱스·성능 노트

- **자주 조회**: `Order(customerId, createdAt DESC)`, `Order(shopId, status)`, `Order(status, scheduledStart)` — 모두 추가됨
- **위치 검색** (정비소 매칭): MVP는 단순 `district` 매칭, Phase 2부터 PostGIS `geography` + GIST 인덱스
- **MechanicLocation**: 시계열 누적 → 1주일 후 cold storage로 archive (또는 TimescaleDB 고려)
- **NotificationLog, AuditLog, OrderEvent**: 파티셔닝 (월별) 권장 — 1년 후 사이즈 폭증

---

## 6. 미해결 결정 항목

| # | 질문 | 영향 컬럼 |
|---|---|---|
| 1 | 출장비 (`travelFee`) 정책 — 거리 기반? 정액? 무료? | `Order.travelFee` |
| 2 | 수수료율 — 고정 X%? 정비소별 차등? | `AppConfig.commission_rate` 또는 `Shop.commissionRate` |
| 3 | 정산 주기 — 주간(현 mock대로)? 월간? | `Settlement.periodStart/End` |
| 4 | 매칭 알고리즘 — 거리순? 수락률 가중? 선착순 broadcast? | `OrderAssignment` 생성 로직 |
| 5 | 매칭 timeout — 정비소 응답 N초? | `OrderAssignment.expiresAt` 기본값 |
| 6 | 정비사 단위? — 정비소-단위 배정 vs 정비사 직접 배정 | `OrderAssignment.mechanicId` 의무 vs 옵션 |
| 7 | 영수증·세금계산서 발행 정책 | `Settlement.invoiceNumber` 의무 여부 |
| 8 | 차량번호 전체 vs 마스킹 저장? | `Vehicle.plate` 암호화 여부 |
| 9 | 결제→매칭실패 시 자동환불 정책 | `Refund` 자동 생성 로직 |

---

## 7. 다음 단계 후보

- **A1**: `prisma/schema.prisma` 파일을 실제로 생성하고 `prisma migrate dev` 가능 상태로
- **A2**: seed 스크립트 — 현재 `lib/mock-data.ts` → DB seed 변환
- **A3**: ER 다이어그램 SVG (dbdocs.io 또는 Mermaid)
- **B**: MVP API 명세 (OpenAPI)
- **C**: 주문 상태머신 다이어그램 (edge case 포함)
- **D**: 1호 사장님 미팅 질문지
