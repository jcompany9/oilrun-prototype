import Link from "next/link"
import { Car, Wrench, BarChart3 } from "lucide-react"

interface RoleCard {
  icon: typeof Car
  title: string
  description: string
  href: string
}

const roleCards: RoleCard[] = [
  {
    icon: Car,
    title: "차주 화면 보기",
    description: "차량번호 입력부터 결제까지",
    href: "/order/start",
  },
  {
    icon: Wrench,
    title: "정비소 화면 보기",
    description: "주문 수락부터 작업 완료까지",
    href: "/shop",
  },
  {
    icon: BarChart3,
    title: "운영자 화면 보기",
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
            출장 오일교환 플랫폼 프로토타입
          </h2>
          <p className="text-base text-gray-600 sm:text-lg">
            차주는 메뉴만 고르고, 정비소는 정비만 합니다
          </p>
        </header>

        <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {roleCards.map(({ icon: Icon, title, description, href }) => (
            <article
              key={href}
              className="group flex flex-col rounded-xl bg-white p-8 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <Icon
                className="mb-5 h-12 w-12"
                style={{ color: "#1E40AF" }}
                strokeWidth={1.75}
              />
              <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
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
