"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search, FileText, Download, Eye, Bookmark, BookmarkCheck,
  X, Mail, GitBranch, Calendar, ChevronDown, SlidersHorizontal,
  ExternalLink, Clock, CheckCircle2, AlertCircle, XCircle,
  Building2, Tag, Hash, User, Filter, Folder,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { store, type DocFile } from "@/lib/store"

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = DocFile["status"]

// Extended Doc interface for search display (adds direction/armoire info)
interface Doc extends DocFile {
  title: string
  direction: string
  armoire: string
}

interface RecentDoc {
  id: string
  name: string
  type: string
  size: string
  date: string
  status: "En attente" | "En validation" | "Approuve" | "Rejete"
}

interface DirectionItem {
  id: string
  name: string
  count: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<DocStatus, { label: string; icon: React.ElementType; cls: string }> = {
  "Approuve":      { label: "Approuve",      icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" },
  "En validation": { label: "En validation", icon: Clock,        cls: "text-amber-600 bg-amber-50 dark:bg-amber-950" },
  "En attente":    { label: "En attente",    icon: AlertCircle,  cls: "text-muted-foreground bg-muted" },
  "Rejete":        { label: "Rejete",        icon: XCircle,      cls: "text-red-600 bg-red-50 dark:bg-red-950" },
}

const typeColor: Record<string, string> = {
  pdf:  "bg-red-500 text-white",
  docx: "bg-blue-500 text-white",
  xlsx: "bg-emerald-500 text-white",
  img:  "bg-purple-500 text-white",
}

function SourceBadge({ doc }: { doc: Doc }) {
  return (
    <div className="flex flex-wrap gap-1">
      {doc.source === "email" && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          <Mail className="h-2.5 w-2.5" /> Email
        </span>
      )}
      {doc.source === "workflow" && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
          <GitBranch className="h-2.5 w-2.5" /> Workflow
        </span>
      )}
      {doc.linkedWorkflow && doc.source !== "workflow" && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
          <GitBranch className="h-2.5 w-2.5" /> {doc.linkedWorkflow}
        </span>
      )}
    </div>
  )
}

// ─── Detail Panel (slides from right) ─────────────────────────────────────────

function DetailPanel({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const status = statusConfig[doc.status]
  const StatusIcon = status.icon

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
              <p className="text-[11px] text-muted-foreground">{doc.id} · {doc.size}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Preview zone */}
          <div className="bg-muted/50 flex items-center justify-center p-6" style={{ minHeight: 180 }}>
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-14 w-14 rounded bg-background border border-border flex items-center justify-center">
                <FileText className="h-7 w-7" />
              </div>
              <p className="text-xs text-center max-w-[200px]">{doc.title}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-3 border-b border-border">
            <Button className="flex-1 h-9 gap-2 text-sm rounded" size="sm" asChild>
              <Link href={`/document/${doc.id}`}>
                <Eye className="h-4 w-4" />
                Ouvrir
              </Link>
            </Button>
            <Button variant="outline" className="flex-1 h-9 gap-2 text-sm rounded" size="sm">
              <Download className="h-4 w-4" />
              Telecharger
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded flex-shrink-0" asChild>
              <Link href={`/document/${doc.id}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Metadata */}
          <div className="p-3 space-y-3">
            {/* Status + Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium", status.cls)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
              <span className={cn("inline-flex items-center rounded px-2 py-1 text-[11px] font-medium", typeColor[doc.type] ?? "bg-muted text-foreground")}>
                {doc.type.toUpperCase()}
              </span>
            </div>

            {/* Source / Liens */}
            {(doc.linkedEmail || doc.linkedWorkflow || doc.source !== "upload") && (
              <div className="space-y-2 p-3 bg-muted/50 rounded">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source & Liens</p>
                <SourceBadge doc={doc} />
                {doc.linkedEmail && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> {doc.linkedEmail}
                  </p>
                )}
                {doc.linkedWorkflow && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <GitBranch className="h-3 w-3" /> {doc.linkedWorkflow}
                  </p>
                )}
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Building2, label: "Direction",  value: doc.direction },
                { icon: Folder,    label: "Armoire",    value: doc.armoire },
                { icon: Calendar,  label: "Date",       value: doc.date },
                { icon: User,      label: "Auteur",     value: doc.author },
                { icon: Hash,      label: "OCR",        value: `${doc.confidence}%` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-2 bg-muted/40 rounded">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{doc.description}</p>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-1">
                {doc.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
        </div>
      </div>
    </>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function SearchPage() {
  const router = useRouter()
  const [allDocs, setAllDocs] = useState<Doc[]>([])
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([])
  const [query, setQuery]             = useState("")
  const [armoireFilter, setArmoireFilter] = useState("all")
  const [typeFilter, setTypeFilter]   = useState("all")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [savedList, setSavedList]     = useState<string[]>(savedSearches)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Load data from store and localStorage
  useEffect(() => {
    const loadData = () => {
      // Build docs with direction/armoire info from store
      const docs: Doc[] = []
      const dirs = store.getDirections()
      for (const dir of dirs) {
        for (const arm of dir.armoires) {
          for (const dos of arm.dossiers) {
            for (const file of dos.files) {
              docs.push({
                ...file,
                title: file.name,
                direction: dir.name,
                armoire: arm.id,
              })
            }
          }
        }
      }

      // Load recent documents from localStorage
      const saved = localStorage.getItem('recentDocuments')
      if (saved) {
        try {
          const recent = JSON.parse(saved) as RecentDoc[]
          // Convert recent docs to Doc format for display
          const recentAsDocs: Doc[] = recent.map(r => ({
            id: r.id,
            name: r.name,
            title: r.name,
            type: r.type.toLowerCase() as DocFile["type"],
            size: r.size,
            date: r.date,
            status: r.status,
            confidence: 0,
            author: "Utilisateur",
            description: `Document uploadé récemment - ${r.name}`,
            tags: [],
            source: "upload" as const,
            direction: "Documents récents",
            armoire: "uploads",
            versions: [{ version: 1, date: r.date, author: "Utilisateur" }],
            activity: [{ action: "Upload", user: "Utilisateur", date: r.date }]
          }))
          docs.push(...recentAsDocs)
          setRecentDocs(recent)
        } catch (e) {
          console.error('Failed to parse recent documents', e)
        }
      }

      setAllDocs(docs)
    }

    loadData()
    return store.subscribe(loadData)
  }, [])

  const activeFilters = [armoireFilter, typeFilter, periodFilter, statusFilter].filter(f => f !== "all").length

  const filtered = allDocs.filter(doc => {
    const q = query.toLowerCase()
    const matchQuery = !q || doc.title.toLowerCase().includes(q) || doc.id.toLowerCase().includes(q) || doc.tags.some(t => t.toLowerCase().includes(q))
    const matchArmoire = armoireFilter === "all" || doc.armoire === armoireFilter
    const matchType   = typeFilter   === "all" || doc.type.toUpperCase() === typeFilter
    const matchStatus = statusFilter === "all" || doc.status === statusFilter
    return matchQuery && matchArmoire && matchType && matchStatus
  })

  const handleSave = () => {
    if (!query.trim()) return
    if (!savedList.includes(query)) {
      setSavedList(prev => [query, ...prev])
    }
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const clearAllFilters = () => {
    setArmoireFilter("all"); setTypeFilter("all"); setPeriodFilter("all"); setStatusFilter("all"); setQuery("")
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Center: search + results */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Search bar */}
        <div className="px-4 pt-4 pb-3 border-b border-border space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setQuery("")}
                placeholder="Rechercher un document..."
                className="pl-9 h-9 text-sm bg-muted/50 border-0 focus-visible:ring-1 rounded"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className={cn("h-9 gap-2 text-xs rounded relative", showFilters && "bg-muted")}
              onClick={() => setShowFilters(v => !v)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtres
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-bold">
                  {activeFilters}
                </span>
              )}
            </Button>
            <Button
              variant={saveSuccess ? "default" : "outline"}
              className="h-9 gap-2 text-xs rounded"
              onClick={handleSave}
              disabled={!query.trim()}
            >
              {saveSuccess ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{saveSuccess ? "OK" : "Sauver"}</span>
            </Button>
          </div>

          {/* Filters panel */}
          <div className={cn("overflow-hidden transition-all duration-200", showFilters ? "max-h-32 opacity-100" : "max-h-0 opacity-0")}>
            <div className="flex items-center gap-2 flex-wrap py-1">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Filter className="h-3 w-3" />
              </span>

              <Select value={armoireFilter} onValueChange={setArmoireFilter}>
                <SelectTrigger className="h-7 text-[11px] w-auto min-w-[110px] rounded">
                  <Folder className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Armoire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="rh">RH</SelectItem>
                  <SelectItem value="juridique">Juridique</SelectItem>
                  <SelectItem value="dg">Direction Generale</SelectItem>
                  <SelectItem value="it">Informatique</SelectItem>
                  <SelectItem value="logistique">Logistique</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-7 text-[11px] w-auto min-w-[90px] rounded">
                  <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCX">DOCX</SelectItem>
                  <SelectItem value="XLSX">XLSX</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="h-7 text-[11px] w-auto min-w-[120px] rounded">
                  <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="7j">7 derniers jours</SelectItem>
                  <SelectItem value="30j">30 derniers jours</SelectItem>
                  <SelectItem value="90j">3 derniers mois</SelectItem>
                  <SelectItem value="annee">Cette annee</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 text-[11px] w-auto min-w-[110px] rounded">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Approuve">Approuve</SelectItem>
                  <SelectItem value="En validation">En validation</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Rejete">Rejete</SelectItem>
                </SelectContent>
              </Select>

              {activeFilters > 0 && (
                <button onClick={clearAllFilters} className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1">
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Saved searches */}
          {savedList.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">Sauvegardes:</span>
              {savedList.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bookmark className="h-2.5 w-2.5" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> document{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground">
              <Download className="h-3 w-3" /> Exporter
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground">
              Trier <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Search className="h-10 w-10 opacity-20" />
              <p className="text-sm">Aucun document trouve</p>
              <button onClick={clearAllFilters} className="text-xs underline underline-offset-2 hover:text-foreground">Effacer les filtres</button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((doc) => {
                const isActive = selectedDoc?.id === doc.id
                const status = statusConfig[doc.status]
                const StatusIcon = status.icon
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(isActive ? null : doc)}
                    onDoubleClick={() => router.push(`/document/${doc.id}`)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 cursor-pointer transition-all group",
                      isActive ? "bg-muted/60" : "hover:bg-muted/30"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive ? "bg-foreground text-background" : "bg-muted group-hover:bg-foreground/10"
                    )}>
                      <FileText className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground leading-tight line-clamp-1">{doc.title}</p>
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-lg flex-shrink-0", status.cls)}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-muted-foreground">
                        <span className="font-mono">{doc.id}</span>
                        <span>·</span>
                        <span>{doc.direction}</span>
                        <span>·</span>
                        <span>{doc.date}</span>
                        <span>·</span>
                        <span>{doc.size}</span>
                        <span className={cn("font-medium px-1 rounded", typeColor[doc.type] ?? "bg-muted text-foreground")}>{doc.type}</span>
                      </div>

                      <SourceBadge doc={doc} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail panel (overlay) */}
      {selectedDoc && (
        <DetailPanel doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  )
}

