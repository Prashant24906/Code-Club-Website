import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Providers from "./providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Code Club - University Tech Community",
  description: "Join our vibrant community of developers, designers, and tech enthusiasts",
  icons: {
    icon: "/codeclub1.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
