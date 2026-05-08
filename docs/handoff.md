# 작업 인계 노트

> 마지막 업데이트: 2026-05-08
> 다른 PC에서 이어서 작업할 때 참고. `git pull` 후 이 문서부터 읽기.

## 이번 세션에서 한 것 (commit `bdd3da7`)

- **차량번호 조회**: `/api/vehicle/lookup` + plate validator + UI 연결 (mock fallback)
- **카카오맵 통합**: SDK 로더, 검색·역지오코딩 API, 지도 컴포넌트, location 페이지 진짜 지도
- 키 없이도 mock 모드로 동작 (placeholder + 더미 데이터)

## 미해결 — 수동 작업 (코드 외)

### Vercel
- [ ] Deployment Protection 비활성화 — Settings → Deployment Protection → Vercel Authentication → **Disabled**
- [ ] 환경변수 추가 — Settings → Environment Variables:
  - `NEXT_PUBLIC_KAKAO_JS_KEY` (Production ✅, Preview ❌)
  - `KAKAO_REST_API_KEY` (Production ✅, Preview ✅)
- [ ] Redeploy (env 반영)

### 카카오 개발자 콘솔 (developers.kakao.com)
- [ ] 앱 만들기 (이름: OilRun)
- [ ] 플랫폼 키 페이지에서 JavaScript 키 + REST API 키 복사
- [ ] JavaScript SDK 도메인 등록:
  - `https://oilrun-prototype.vercel.app`
  - `http://localhost:3000`
- [ ] 제품 설정 → **카카오맵 → 활성화** 토글 ON

## 배포

- **URL**: https://oilrun-prototype.vercel.app
- **레포**: https://github.com/jcompany9/oilrun-prototype
- main 푸시하면 Vercel 자동 배포

## 다음 코드 작업 후보

수동 셋업(Vercel/카카오) 끝나면 우선순위 순:

1. **결제 진짜로** — 토스페이먼츠 테스트 모드 → `/order/payment` PaymentModal 교체
2. **휴대폰 OTP 진짜로** — NHN/알리고 SMS, 현재 `1234` 하드코딩 ([app/order/payment/page.tsx:31](../app/order/payment/page.tsx#L31))
3. **DB 셋업** — Prisma + Postgres (Supabase) — `docs/db-schema-v1.md` 그대로 사용
4. **사장님 미팅 질문지** — `docs/production-roadmap.md` 5장 7개 항목 정리

## 핵심 파일

| 파일 | 역할 |
|---|---|
| `.env.example` | 필요한 환경변수 가이드 |
| `lib/kakao.ts` | 카카오 REST API helper |
| `lib/utils.ts` | plate validator/normalizer 추가됨 |
| `app/api/vehicle/lookup/route.ts` | 차량번호 조회 (mock + apick/datahub hook) |
| `app/api/kakao/search-address/route.ts` | 주소·키워드 검색 |
| `app/api/kakao/reverse-geocode/route.ts` | 좌표→주소 |
| `components/order/KakaoMap.tsx` | SDK 동적 로드 + placeholder fallback |
| `app/order/vehicle/page.tsx` | 차량번호 입력 (API 연결) |
| `app/order/location/page.tsx` | 진짜 지도 + 디바운스 검색 + GPS |

## 알려진 제약

- 한국 차량번호 → 차종 자동조회는 **개인정보법 때문에 차주명 + 동의 필수**. 합법 API 모두 동일.
- 에이픽 `차량 정보 조회` 상품은 현재 단종 상태. 대안: 데이터허브, 국토부 공공데이터, Codef.
- 카카오맵 도메인 와일드카드 미지원 → Vercel preview 배포는 placeholder fallback 사용.
