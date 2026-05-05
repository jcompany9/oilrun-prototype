import "leaflet/dist/leaflet.css"
import { Toaster } from "sonner"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
