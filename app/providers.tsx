"use client"

import { Toaster } from "sonner"
import React from "react"
import { DataCacheProvider } from "@/lib/data-cache"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DataCacheProvider>
      {children}
      <Toaster position="top-right" richColors />
    </DataCacheProvider>
  )
}
