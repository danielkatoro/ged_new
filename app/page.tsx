import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { UploadZone } from "@/components/upload-zone"
import { DocumentsTable } from "@/components/documents-table"
import { CabinetsPanel } from "@/components/cabinets-panel"
import { PendingPanel } from "@/components/pending-panel"
import { UploadDrawer } from "@/components/upload-drawer"

export default function DashboardPage() {
  return (
    <Shell>
      <Header />
      <main className="p-4 space-y-4">
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <UploadZone />
            <DocumentsTable />
          </div>
          <div className="space-y-4">
            <CabinetsPanel />
            <PendingPanel />
          </div>
        </div>
      </main>
      <UploadDrawer />
    </Shell>
  )
}
