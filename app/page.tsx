import Link from "next/link"
import { Car, Wrench, BarChart3, LayoutDashboard, BookOpen } from "lucide-react"

interface RoleCard {
  icon: typeof Car
  title: string
  description: string
  href: string
  badge?: string
  isNew?: boolean
}

const roleCards: RoleCard[] = [
  {
    icon: LayoutDashboard,
    title: "정비소 SaaS 보기",
    description: "통합 캘린더·고객·매출·다지점 운영",
    href: "/saas",
    badge: "Core + Creator",
    isNew: true,
  },
  {
    icon: BookOpen,
    title: "차주 부킹 페이지",
    description: "정비소 퍼블릭 페이지 (메뉴·증상 접수)",
    href: "/book/hyungje",
    isNew: true,
  },
  {
    icon: Car,
    title: "차주 화면 (마켓플레이스)",
    description: "차량번호 입력부터 결제까지",
    href: "/order/start",
  },
  {
    icon: Wrench,
    title: "정비소 화면 (마켓플레이스)",
    description: "주문 수락부터 작업 완료까지",
    href: "/shop",
  },
  {
    icon: BarChart3,
    title: "운영자 화면",
    description: "전체 매출과 주문 모니터링",
    href: "/admin",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex-1 bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <header className="mb-14 text-center">
          <h1
            className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl"
            style={{ color: "#1E40AF" }}
          >
            OilRun
          </h1>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            정비소 통합 운영 SaaS 프로토타입
          </h2>
          <p className="text-base text-gray-600 sm:text-lg">
            모든 채널(전화·카톡·네이버·OilRun) 예약을 한 곳에서, 출장 정비는 그 안의 한 모듈
          </p>
        </header>

        <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roleCards.map(({ icon: Icon, title, description, href, badge, isNew }) => (
            <article
              key={href}
              className="group relative flex flex-col rounded-xl bg-white p-8 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {isNew && (
                <span
                  className="absolute -top-2 -right-2 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: "#F97316" }}
                >
                  NEW
                </span>
              )}
              <Icon
                className="mb-5 h-12 w-12"
                style={{ color: "#1E40AF" }}
                strokeWidth={1.75}
              />
              <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
              {badge && (
                <span
                  className="mb-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
                >
                  {badge}
                </span>
              )}
              <p className="mb-8 flex-1 text-sm text-gray-600">{description}</p>
              <Link
                href={href}
                className="inline-flex h-12 items-center justify-center rounded-lg px-5 text-base font-semibold text-white transition-colors"
                style={{ backgroundColor: "#F97316" }}
              >
                체험하기
              </Link>
            </article>
          ))}
        </section>

        <footer className="mt-16">
          <p className="text-xs text-gray-400">
            모든 데이터는 시연용 가상 데이터입니다
          </p>
        </footer>
      </div>
    </div>
  )
}
