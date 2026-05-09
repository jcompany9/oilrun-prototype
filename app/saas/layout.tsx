import { Toaster } from "sonner"
import { SaasShell } from "@/components/saas/SaasShell"

export default function SaasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SaasShell>{children}</SaasShell>
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
