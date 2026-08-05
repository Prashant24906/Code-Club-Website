"use client"

import { Toaster } from "sonner"
import React from "react"
import { DataCacheProvider } from "@/lib/data-cache"
import { GoogleOAuthProvider } from "@react-oauth/google"

export default function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID 

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <DataCacheProvider>
        {children}
        <Toaster position="top-right" richColors />
      </DataCacheProvider>
    </GoogleOAuthProvider>
  )
}
