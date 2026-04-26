"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { Mail, Plus, CheckCircle2, AlertCircle, Inbox, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AddSourceDrawer } from "@/components/add-source-drawer"
import { SourceContextMenu } from "@/components/source-context-menu"
import { useState } from "react"
import { toast } from "sonner"

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
  const [editingSource, setEditingSource] = useState<number | null>(null)
  const [syncingSourceId, setSyncingSourceId] = useState<number | null>(null)
  const [sources, setSources] = useState([
    {
      id: 1,
      address: "factures@akieni.com",
      label: "Factures & Comptabilite",
      connected: true,
      received: 134,
      docsCreated: 131,
      errors: 3,
      lastSync: "Il y a 5min",
      direction: "Finance",
      armoire: "Factures",
      isPaused: false,
      autoTrigger: true,
    },
    {
      id: 2,
      address: "rh@akieni.com",
      label: "Ressources Humaines",
      connected: true,
      received: 89,
      docsCreated: 89,
      errors: 0,
      lastSync: "Il y a 12min",
      direction: "RH",
      armoire: "Contrats",
      isPaused: false,
      autoTrigger: true,
    },
    {
      id: 3,
      address: "legal@akieni.com",
      label: "Documents Juridiques",
      connected: true,
      received: 56,
      docsCreated: 54,
      errors: 2,
      lastSync: "Il y a 1h",
      direction: "Juridique",
      armoire: "Contrats",
      isPaused: false,
      autoTrigger: false,
    },
    {
      id: 4,
      address: "documents@akieni.com",
      label: "Documents Generaux",
      connected: false,
      received: 0,
      docsCreated: 0,
      errors: 0,
      lastSync: "Jamais connecte",
      direction: "Direction Generale",
      armoire: "Divers",
      isPaused: false,
      autoTrigger: true,
    },
  ])
  const totalReceived = sources.reduce((a, s) => a + s.received, 0)
  const totalDocs = sources.reduce((a, s) => a + s.docsCreated, 0)
  const totalErrors = sources.reduce((a, s) => a + s.errors, 0)

  const handleForceSync = (id: number) => {
    setSyncingSourceId(id)
    toast.success("Synchronisation en cours...", {
      description: "Vérification des nouveaux emails",
    })
    setTimeout(() => setSyncingSourceId(null), 3000)
  }

  const handlePause = (id: number) => {
    setSources(sources.map(s => s.id === id ? { ...s, isPaused: true } : s))
    toast.info("Source mise en pause", {
      description: "L'importation automatique a été suspendue",
    })
  }

  const handleResume = (id: number) => {
    setSources(sources.map(s => s.id === id ? { ...s, isPaused: false } : s))
    toast.success("Source réactivée", {
      description: "L'importation automatique est relancée",
    })
  }

  const handleViewLogs = (id: number) => {
    // Le modal est géré dans le composant SourceContextMenu
  }

  const handleModifyConfig = (id: number) => {
    setEditingSource(id)
    setShowAddSource(true)
  }

  const handleManageAlerts = (id: number) => {
    toast.info("Gestion des alertes", {
      description: "Ouverture du gestionnaire d'alertes",
    })
  }

  const handleTestConnection = (id: number) => {
    toast.success("Connexion valide", {
      description: "Les identifiants et paramètres sont correctes",
    })
  }

  const handleDelete = (id: number) => {
    toast.error("Source supprimée", {
      description: "Le connecteur a été définitivement supprimé",
    })
    setSources(sources.filter(s => s.id !== id))
  }

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
            {sources.map((source) => (
              <div
                key={source.id}
                className={cn(
                  "px-4 py-3 flex items-start justify-between group",
                  syncingSourceId === source.id && "bg-muted/40 animate-pulse"
                )}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                    source.connected ? "bg-blue-500/10" : "bg-muted"
                  )}>
                    <Mail className={cn("h-5 w-5", source.connected ? "text-blue-500" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{source.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{source.address}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px]">
                      <span className="text-muted-foreground">Derniere sync:</span>
                      <span className="font-medium text-foreground">{source.lastSync}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 ml-4 flex-shrink-0 hidden sm:flex text-[11px]">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{source.received}</p>
                    <p className="text-muted-foreground">reçus</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{source.docsCreated}</p>
                    <p className="text-muted-foreground">créés</p>
                  </div>
                  {source.errors > 0 && (
                    <div className="text-center">
                      <p className="font-semibold text-amber-600">{source.errors}</p>
                      <p className="text-muted-foreground">erreurs</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Badge className={cn(
                    "gap-1 text-[10px]",
                    source.isPaused
                      ? "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                      : source.connected
                      ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {source.isPaused
                      ? <>En pause</>
                      : source.connected
                      ? <><CheckCircle2 className="h-3 w-3" /> Connectee</>
                      : <><AlertCircle className="h-3 w-3" /> Inactive</>
                    }
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleForceSync(source.id)}
                    disabled={syncingSourceId === source.id}
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", syncingSourceId === source.id && "animate-spin")} />
                  </Button>
                  <SourceContextMenu
                    source={source}
                    isPaused={source.isPaused}
                    onForceSync={() => handleForceSync(source.id)}
                    onPause={() => handlePause(source.id)}
                    onResume={() => handleResume(source.id)}
                    onViewLogs={() => handleViewLogs(source.id)}
                    onModifyConfig={() => handleModifyConfig(source.id)}
                    onManageAlerts={() => handleManageAlerts(source.id)}
                    onTestConnection={() => handleTestConnection(source.id)}
                    onDelete={() => handleDelete(source.id)}
                  />
                </div>
              </div>
            ))}
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
                    source.connected 
                      ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {source.connected
                      ? <><CheckCircle2 className="h-3 w-3" /> Connectee</>
                      : <><AlertCircle className="h-3 w-3" /> Inactive</>
                    }
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleForceSync(source.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <SourceContextMenu
                    source={source}
                    isPaused={source.isPaused}
                    onForceSync={() => handleForceSync(source.id)}
                    onPause={() => handlePause(source.id)}
                    onResume={() => handleResume(source.id)}
                    onViewLogs={() => handleViewLogs(source.id)}
                    onModifyConfig={() => handleModifyConfig(source.id)}
                    onManageAlerts={() => handleManageAlerts(source.id)}
                    onTestConnection={() => handleTestConnection(source.id)}
                    onDelete={() => handleDelete(source.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add/Edit Source Drawer */}
      <AddSourceDrawer
        isOpen={showAddSource}
        onClose={() => {
          setShowAddSource(false)
          setEditingSource(null)
        }}
        editingSource={editingSource ? sources.find(s => s.id === editingSource) : undefined}
      />
    </Shell>
  )
}
