"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { useState, useEffect } from "react"
import { store, type AuditLog } from "@/lib/store"
import { ClipboardList, Download, Filter, FileText, Folder, User, GitBranch, Building2, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const targetTypeIcons: Record<string, typeof FileText> = {
  document: FileText,
  dossier: Folder,
  armoire: Archive,
  direction: Building2,
  user: User,
  workflow: GitBranch,
}

const targetTypeColors: Record<string, string> = {
  document: "bg-blue-100 text-blue-700",
  dossier: "bg-amber-100 text-amber-700",
  armoire: "bg-emerald-100 text-emerald-700",
  direction: "bg-purple-100 text-purple-700",
  user: "bg-pink-100 text-pink-700",
  workflow: "bg-cyan-100 text-cyan-700",
}

export default function JournalAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    setLogs(store.getAuditLogs())
    return store.subscribe(() => setLogs(store.getAuditLogs()))
  }, [])

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || log.targetType === typeFilter
    return matchSearch && matchType
  })

  return (
    <Shell>
      <Header />
      <main className="p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded bg-muted text-sm font-medium text-foreground">
              <ClipboardList className="h-4 w-4 mr-2" />
              Journal d&apos;Audit
            </span>
            <span className="text-xs text-muted-foreground">{logs.length} entrees</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 w-48 text-xs rounded"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-36 text-xs rounded">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="dossier">Dossier</SelectItem>
                <SelectItem value="armoire">Armoire</SelectItem>
                <SelectItem value="direction">Direction</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="workflow">Workflow</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-8 gap-2 text-xs rounded">
              <Download className="h-3.5 w-3.5" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="border border-border rounded bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map(log => {
              const Icon = targetTypeIcons[log.targetType] || FileText
              return (
                <div key={log.id} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded flex-shrink-0 mt-0.5",
                    targetTypeColors[log.targetType] || "bg-muted text-foreground"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground">{log.action}</span>
                      <Badge variant="outline" className="text-[10px] rounded px-1.5 py-0">
                        {log.targetType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">{log.user}</span>
                      {" sur "}
                      <span className="font-medium text-foreground">{log.target}</span>
                    </p>
                    {log.details && (
                      <p className="text-[11px] text-muted-foreground italic">{log.details}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-foreground">{log.date}</p>
                    <p className="text-[10px] text-muted-foreground">IP: {log.ip}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Aucune entree trouvee
          </div>
        )}
      </main>
    </Shell>
  )
}
