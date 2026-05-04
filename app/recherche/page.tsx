"use client"

import { Suspense } from "react"
import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { SearchPage } from "@/components/search-page"

export default function RecherchePage() {
  return (
    <Shell>
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Chargement...</div>}>
        <SearchPage />
      </Suspense>
    </Shell>
  )
}
