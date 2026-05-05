@AGENTS.md
# OilRun Prototype

## What this is
한국 출장 오일교환 플랫폼의 미팅용 프로토타입. 1호 정비소 사장님과의 미팅에서 시연할 데모. 실제 DB·API 연동 없음, 모든 데이터 mock. 흐름·UX 시연이 목적.

## Three User Roles
1. **차주 (Customer)** at /order/* — 모바일 우선 8단계 결제 흐름
2. **정비소 (Shop)** at /shop/* — 데스크톱+모바일 반응형, 지도 중심
3. **운영자 (Admin)** at /admin — 데스크톱 대시보드

## Critical Business Rules (시연 시 강조 포인트)
- 차주는 정비소를 선택하지 않음 (자동 매칭)
- 차주는 배정 완료 후에만 정비사 정보 봄
- 정비소는 새 주문을 자유롭게 수락/거부 (페널티 없음)
- 정비소가 직접 본인 동선 결정 (AI 매칭 없음)
- 메뉴 가격은 차종 카테고리별 정찰제

## Tech Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui (Nova preset, Radix primitives)
- lucide-react icons
- recharts (admin charts)
- framer-motion (페이지 전환)
- All mock data, no DB

## Design System
- Primary: #1E40AF (deep blue)
- Accent: #F97316 (warm orange) — CTA buttons only
- Background: white / gray-50
- Cards: white + shadow-sm + rounded-xl
- Font: Pretendard (한국어 친화적)
- Currency format: "89,000원" (천 단위 콤마 + 원)
- Min button height on mobile: 48px
- All text in Korean

## File Structure
- /app/page.tsx — 랜딩
- /app/order/* — 차주 흐름 (8 pages)
- /app/shop/* — 정비소 화면
- /app/admin/* — 어드민 대시보드
- /components/ui/* — shadcn 컴포넌트
- /components/order/* — 차주 흐름 전용 컴포넌트
- /components/shop/* — 정비소 전용 컴포넌트
- /lib/mock-data.ts — 모든 가짜 데이터 한 곳에
- /lib/utils.ts — 화폐 포맷팅, 날짜 포맷팅 등

## Mock Data Conventions
- 차주 이름: 김OO, 이OO 등 가명
- 정비사 이름: "김기사", "박기사" 등
- 전화번호: 010-1234-5678 (모두 동일하게)
- 주소: 실제 강남·서초·송파 동 이름 사용
- 차종: 카니발 4세대, 쏘나타 DN8, 아반떼 CN7 등 실제 모델

## Code Style
- 컴포넌트는 함수형
- Props는 TypeScript interface로 명시
- 한 컴포넌트당 한 파일
- 화면당 한 page.tsx
- mock 데이터는 컴포넌트 안에 두지 말고 /lib/mock-data.ts에서 import

## What NOT to do
- 실제 DB·API 연동 절대 시도하지 말 것
- 실제 결제 연동 시도하지 말 것
- 카카오맵 SDK 키가 없으니, 지도는 styled placeholder로 처리
- localStorage·sessionStorage 사용 금지 (상태는 React state)

## Demo Scenarios (시연 시 강조할 흐름)
1. 차주 흐름: 차량번호 → 메뉴 → 위치 → 시간 → 결제 → 배정 → 완료
2. 정비소 흐름: 새 주문 알림 → 수락 → 출발/도착/작업/완료 상태 변경
3. 어드민 흐름: 대시보드 한 눈에 보기