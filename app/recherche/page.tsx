import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { SearchPage } from "@/components/search-page"
import { Suspense } from "react"

export default function RecherchePage() {
  return (
    <Shell>
      <Header />
      <Suspense fallback={null}>
        <SearchPage />
      </Suspense>
    </Shell>
  )
}
