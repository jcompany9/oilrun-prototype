import { notFound } from "next/navigation"
import { findPublicShopBySlug, findVideoById } from "@/lib/mock-data"
import { BookingFlow } from "@/components/book/BookingFlow"
import { Toaster } from "sonner"

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { shopSlug } = await params
  const { ref } = await searchParams

  const shop = findPublicShopBySlug(shopSlug)
  if (!shop) {
    notFound()
  }
  const sourceVideo = findVideoById(ref)

  return (
    <>
      <BookingFlow shop={shop} sourceVideo={sourceVideo} />
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
