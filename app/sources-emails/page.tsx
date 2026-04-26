"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { Mail, Plus, CheckCircle2, AlertCircle, Inbox, RefreshCw, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AddSourceDrawer } from "@/components/add-source-drawer"
import { useState } from "react"

const sources = [
  {
    address: "factures@akieni.com",
    label: "Factures & Comptabilite",
    connected: true,
    received: 134,
    docsCreated: 131,
    errors: 3,
    lastSync: "Il y a 5min",
    direction: "Finance",
  },
  {
    address: "rh@akieni.com",
    label: "Ressources Humaines",
    connected: true,
    received: 89,
    docsCreated: 89,
    errors: 0,
    lastSync: "Il y a 12min",
    direction: "RH",
  },
  {
    address: "legal@akieni.com",
    label: "Documents Juridiques",
    connected: true,
    received: 56,
    docsCreated: 54,
    errors: 2,
    lastSync: "Il y a 1h",
    direction: "Juridique",
  },
  {
    address: "documents@akieni.com",
    label: "Documents Generaux",
    connected: false,
    received: 0,
    docsCreated: 0,
    errors: 0,
    lastSync: "Jamais connecte",
    direction: "Direction Generale",
  },
]

export default function SourcesEmailsPage() {
  const [showAddSource, setShowAddSource] = useState(false)
  const totalReceived = sources.reduce((a, s) => a + s.received, 0)
  const totalDocs = sources.reduce((a, s) => a + s.docsCreated, 0)
  const totalErrors = sources.reduce((a, s) => a + s.errors, 0)

  return (
    <Shell>
      <Header />
      <main className="p-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Sources actives", value: sources.filter(s => s.connected).length, accent: true },
            { label: "Sources inactives", value: sources.filter(s => !s.connected).length },
            { label: "Emails traites", value: totalReceived },
            { label: "Documents crees", value: totalDocs },
          ].map((stat, i) => (
            <div key={i} className={cn(
              "rounded border border-border p-4",
              stat.accent ? "bg-foreground text-background" : "bg-card"
            )}>
              <p className={cn("text-2xl font-bold", stat.accent ? "text-background" : "text-foreground")}>{stat.value}</p>
              <p className={cn("text-xs mt-1", stat.accent ? "text-background/60" : "text-muted-foreground")}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sources list */}
        <div className="rounded border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Sources configurees</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Les pieces jointes valides sont integrees automatiquement en moins de 5 min</p>
            </div>
            <Button size="sm" className="h-8 gap-1.5 text-xs rounded" onClick={() => setShowAddSource(true)}>
              <Plus className="h-3.5 w-3.5" />
              Ajouter une source
            </Button>
          </div>
          <div className="divide-y divide-border">
            {sources.map((source, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors group">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded flex-shrink-0 transition-colors",
                  source.connected
                    ? "bg-muted group-hover:bg-foreground group-hover:text-background"
                    : "bg-muted/50 text-muted-foreground"
                )}>
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{source.address}</p>
                  <p className="text-xs text-muted-foreground">{source.label} · {source.direction}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-right">
                  <div>
                    <div className="flex items-center gap-1 justify-end">
                      <Inbox className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{source.received}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">recus</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground text-right">{source.docsCreated}</p>
                    <p className="text-[10px] text-muted-foreground">integres</p>
                  </div>
                  {source.errors > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-500 text-right">{source.errors}</p>
                      <p className="text-[10px] text-muted-foreground">erreurs</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-muted-foreground">{source.lastSync}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "gap-1 text-[10px]",
                    source.connected ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  )}>
                    {source.connected
                      ? <><CheckCircle2 className="h-3 w-3" /> Connectee</>
                      : <><AlertCircle className="h-3 w-3" /> Inactive</>
                    }
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Source Drawer */}
      <AddSourceDrawer isOpen={showAddSource} onClose={() => setShowAddSource(false)} />
    </Shell>
  )
}
