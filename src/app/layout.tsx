import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import "./globals.css"

export const metadata: Metadata = {
  title: "Realtime Chat",
  description: "Realtime chat app with Supabase",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  )
}