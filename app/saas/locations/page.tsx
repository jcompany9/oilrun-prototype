import { redirect } from "next/navigation"

// 1 Shop = 1 호점 정책으로 다지점 비교 페이지는 제거됨.
// 이전 링크는 캘린더 홈으로 redirect.
export default function LocationsRedirect() {
  redirect("/saas")
}
