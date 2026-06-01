"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search, FileText, Download, Eye, X, Mail, GitBranch,
  CheckCircle2, Clock, AlertCircle, XCircle, Building2,
  Tag, Hash, User, Filter, ChevronDown, ChevronUp,
  FileSpreadsheet, FileImage, ArrowUpDown,
  Bookmark, BookmarkCheck, Calendar, Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { store } from "@/lib/store"
import { DocumentDetailPanel } from "@/components/document-detail-panel"
import { type DocFile } from "@/lib/store"

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "En attente" | "En validation" | "Approuve" | "Rejete"

type SearchDoc = {
  id: string
  name: string
  type: "pdf" | "docx" | "xlsx" | "img"
  size: string
  date: string
  status: DocStatus
  confidence: number
  author: string
  description: string
  tags: string[]
  source: string
  linkedEmail?: string
  linkedWorkflow?: string
  fournisseur?: string
  montant?: number
  numero?: string
  ocrContent?: string
  directionId: string
  directionName: string
  armoireId: string
  armoireName: string
  dossierId: string
  dossierName: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DocStatus, { label: string; icon: React.ElementType; cls: string; dot: string }> = {
  
  "En attente":    { label: "En attente",    icon: AlertCircle,  cls: "text-slate-600 bg-slate-100 border border-slate-200",    dot: "bg-slate-400" },
  "En validation": { label: "En validation", icon: Clock,        cls: "text-amber-700 bg-amber-50 border border-amber-200",     dot: "bg-amber-500" },
  "Approuve":      { label: "Approuvé",      icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500" },
  "Rejete":        { label: "Rejeté",        icon: XCircle,      cls: "text-red-700 bg-red-50 border border-red-200",           dot: "bg-red-500" },
}

const TYPE_COLOR: Record<string, string> = {
  pdf:  "bg-red-100 text-red-700",
  docx: "bg-blue-100 text-blue-700",
  xlsx: "bg-emerald-100 text-emerald-700",
  img:  "bg-purple-100 text-purple-700",
}

const TYPE_ICON: Record<string, React.ElementType> = {
  pdf:  FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  img:  FileImage,
}

const RECENT_SEARCHES = ["TOTAL Energie", "Orange CI", "Contrats RH 2026", "Audit Q1", "NDA Partenaire"]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(d: string): Date | null {
  // Accepts dd-MM-yyyy
  const parts = d.split("-")
  if (parts.length !== 3) return null
  return new Date(+parts[2], +parts[1] - 1, +parts[0])
}

function formatMontant(v: number) {
  return new Intl.NumberFormat("fr-FR").format(v) + " FCFA"
}

// Highlight matching terms in text
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </span>
  )
}

// Export to CSV
function exportCSV(docs: SearchDoc[], columns: string[]) {
  const headers = columns
  const rows = docs.map(d => [
    d.numero ?? d.id,
    d.name,
    d.fournisseur ?? "-",
    d.montant != null ? d.montant.toString() : "-",
    d.date,
    d.status,
    d.armoireName,
    d.directionName,
    d.type.toUpperCase(),
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `export_recherche_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Filter Panel (left) ───────────────────────────────────────────────────────

interface Filters {
  query: string
  fournisseur: string
  dateFrom: string
  dateTo: string
  status: string
  type: string
  direction: string
  armoire: string
}

function FilterPanel({
  filters,
  onChange,
  fournisseurs,
  directions,
  armoires,
  onReset,
  activeCount,
}: {
  filters: Filters
  onChange: (k: keyof Filters, v: string) => void
  fournisseurs: string[]
  directions: string[]
  armoires: string[]
  onReset: () => void
  activeCount: number
}) {
  return (
    <aside className="w-60 flex-shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Filtres</span>
          {activeCount > 0 && (
            <span className="h-4 w-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2">
            Effacer
          </button>
        )}
      </div>

      <div className="p-3 space-y-4">
        {/* Supplier */}
        {/* <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fournisseur</label>
          <div className="relative">
            <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={filters.fournisseur}
              onChange={e => onChange("fournisseur", e.target.value)}
              placeholder="Nom du fournisseur..."
              className="pl-7 h-8 text-xs"
            />
          </div>
          {fournisseurs.length > 0 && (
            <div className="flex flex-col gap-0.5 mt-1">
              {fournisseurs.slice(0, 5).map(f => (
                <button
                  key={f}
                  onClick={() => onChange("fournisseur", f)}
                  className={cn(
                    "text-left text-[11px] px-2 py-1 rounded hover:bg-muted transition-colors truncate",
                    filters.fournisseur === f ? "bg-muted text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div> */}

        {/* Date range */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Periode</label>
          <div className="space-y-1.5">
            <div>
              <span className="text-[10px] text-muted-foreground">Du</span>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={e => onChange("dateFrom", e.target.value)}
                className="h-8 text-xs mt-0.5"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Au</span>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={e => onChange("dateTo", e.target.value)}
                className="h-8 text-xs mt-0.5"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {[
              { label: "7j", from: 7 },
              { label: "30j", from: 30 },
              { label: "90j", from: 90 },
              { label: "1an", from: 365 },
            ].map(({ label, from }) => {
              const d = new Date()
              const f = new Date(); f.setDate(d.getDate() - from)
              const toStr = d.toISOString().slice(0, 10)
              const fromStr = f.toISOString().slice(0, 10)
              const active = filters.dateFrom === fromStr && filters.dateTo === toStr
              return (
                <button
                  key={label}
                  onClick={() => { onChange("dateFrom", fromStr); onChange("dateTo", toStr) }}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded border transition-colors",
                    active ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Statut</label>
          <div className="space-y-0.5">
            {(["all", "Approuve", "En validation", "En attente", "Rejete"] as const).map(s => {
              const cfg = s !== "all" ? STATUS_CONFIG[s as DocStatus] : null
              return (
                <button
                  key={s}
                  onClick={() => onChange("status", s)}
                  className={cn(
                    "w-full text-left text-[11px] px-2 py-1.5 rounded flex items-center gap-2 transition-colors",
                    filters.status === s ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {cfg ? <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />}
                  {s === "all" ? "Tous" : s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type de document</label>
          <div className="flex flex-wrap gap-1">
            {["all", "pdf", "docx", "xlsx", "img"].map(t => (
              <button
                key={t}
                onClick={() => onChange("type", t)}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded border font-medium transition-colors",
                  filters.type === t
                    ? t === "all" ? "bg-foreground text-background border-foreground" : cn(TYPE_COLOR[t], "border-transparent")
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {t === "all" ? "Tous" : t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Direction */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Direction</label>
          <Select value={filters.direction} onValueChange={v => onChange("direction", v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {directions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Armoire */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Armoire</label>
          <Select value={filters.armoire} onValueChange={v => onChange("armoire", v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {armoires.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  )
}

// ─── Results Table ─────────────────────────────────────────────────────────────

type SortKey = "date" | "name" | "montant" | "status" | "fournisseur"

function ResultsTable({
  docs,
  query,
  selectedId,
  onSelect,
}: {
  docs: SearchDoc[]
  query: string
  selectedId: string | null
  onSelect: (doc: SearchDoc | null) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...docs].sort((a, b) => {
    let cmp = 0
    if (sortKey === "date") {
      const da = parseDate(a.date)?.getTime() ?? 0
      const db = parseDate(b.date)?.getTime() ?? 0
      cmp = da - db
    } else if (sortKey === "montant") {
      cmp = (a.montant ?? 0) - (b.montant ?? 0)
    } else if (sortKey === "name") {
      cmp = a.name.localeCompare(b.name)
    } else if (sortKey === "status") {
      cmp = a.status.localeCompare(b.status)
    } else if (sortKey === "fournisseur") {
      cmp = (a.fournisseur ?? "").localeCompare(b.fournisseur ?? "")
    }
    return sortAsc ? cmp : -cmp
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      : <ArrowUpDown className="h-3 w-3 opacity-30" />
  )

  const ColHeader = ({ k, label, className }: { k: SortKey; label: string; className?: string }) => (
    <th
      className={cn("px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none group", className)}
      onClick={() => toggleSort(k)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon k={k} />
      </div>
    </th>
  )

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-card border-b border-border z-10">
          <tr>
            <ColHeader k="name" label="Document" />
            <ColHeader k="fournisseur" label="Fournisseur" className="hidden lg:table-cell" />
            <ColHeader k="montant" label="Montant" className="hidden md:table-cell" />
            <ColHeader k="date" label="Date" />
            <ColHeader k="status" label="Statut" />
            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">Armoire</th>
            <th className="px-3 py-2.5 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map(doc => {
            const isActive = selectedId === doc.id
            const status = STATUS_CONFIG[doc.status]
            const TypeIcon = TYPE_ICON[doc.type] ?? FileText
            return (
              <tr
                key={doc.id}
                onClick={() => onSelect(isActive ? null : doc)}
                onDoubleClick={() => window.location.href = `/document/${doc.id}`}
                className={cn(
                  "cursor-pointer transition-colors group",
                  isActive ? "bg-muted/70" : "hover:bg-muted/30"
                )}
              >
                {/* Document name */}
                <td className="px-3 py-2.5 max-w-[260px]">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("h-7 w-7 rounded flex items-center justify-center flex-shrink-0", TYPE_COLOR[doc.type] ?? "bg-muted text-muted-foreground")}>
                      <TypeIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate leading-tight">
                        <Highlight text={doc.name} query={query} />
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">{doc.numero ?? doc.id}</p>
                    </div>
                  </div>
                </td>
                {/* Fournisseur */}
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <span className="text-xs text-foreground">
                    {doc.fournisseur
                      ? <Highlight text={doc.fournisseur} query={query} />
                      : <span className="text-muted-foreground">—</span>
                    }
                  </span>
                </td>
                {/* Montant */}
                <td className="px-3 py-2.5 hidden md:table-cell">
                  <span className="text-xs font-medium text-foreground tabular-nums">
                    {doc.montant != null ? formatMontant(doc.montant) : <span className="text-muted-foreground">—</span>}
                  </span>
                </td>
                {/* Date */}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-xs text-muted-foreground">{doc.date}</span>
                </td>
                {/* Status */}
                <td className="px-3 py-2.5">
                  <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap", status.cls)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", status.dot)} />
                    {status.label}
                  </span>
                </td>
                {/* Armoire */}
                <td className="px-3 py-2.5 hidden xl:table-cell">
                  <span className="text-[11px] text-muted-foreground">{doc.armoireName}</span>
                </td>
                {/* Actions */}
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => onSelect(isActive ? null : doc)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Zero state ───────────────────────────────────────────────────────────────

function ZeroState({ query, fournisseur, onReset }: { query: string; fournisseur: string; onReset: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground mb-1">Aucun document trouve</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {query || fournisseur
            ? <>Aucun resultat pour <span className="font-medium text-foreground">&ldquo;{query || fournisseur}&rdquo;</span>.</>
            : "Lancez une recherche ou selectionnez des filtres."
          }
        </p>
      </div>
      {(query || fournisseur) && (
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Suggestions :</p>
          <ul className="text-left space-y-1 list-disc list-inside">
            <li>Verifiez l&apos;orthographe du fournisseur</li>
            <li>Elargissez la plage de dates</li>
            <li>Essayez un terme plus general</li>
            <li>Retirez un ou plusieurs filtres</li>
          </ul>
        </div>
      )}
      {(query || fournisseur) && (
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onReset}>
          Effacer les filtres
        </Button>
      )}
    </div>
  )
}

// ─── Auto-suggest dropdown ────────────────────────────────────────────────────

function SearchSuggest({
  query,
  fournisseurs,
  recentSearches,
  onSelect,
}: {
  query: string
  fournisseurs: string[]
  recentSearches: string[]
  onSelect: (v: string) => void
}) {
  if (!query) {
    // Show recent searches
    if (recentSearches.length === 0) return null
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
        <div className="px-3 py-1.5 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recherches recentes</p>
        </div>
        {recentSearches.map(s => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted flex items-center gap-2"
          >
            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            {s}
          </button>
        ))}
      </div>
    )
  }

  const suggestions = [
    ...fournisseurs.filter(f => f.toLowerCase().includes(query.toLowerCase())),
  ].slice(0, 6)

  if (suggestions.length === 0) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" /> Suggestions
        </p>
      </div>
      {suggestions.map(s => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted flex items-center gap-2"
        >
          <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <Highlight text={s} query={query} />
        </button>
      ))}
    </div>
  )
}

// ─── Main SearchPage ──────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = {
  query: "",
  fournisseur: "",
  dateFrom: "",
  dateTo: "",
  status: "all",
  type: "all",
  direction: "all",
  armoire: "all",
}

export function SearchPage() {
  const searchParams = useSearchParams()
  const [allDocs, setAllDocs] = useState<SearchDoc[]>([])
  const [fournisseurs, setFournisseurs] = useState<string[]>([])
  const [directions, setDirections] = useState<string[]>([])
  const [armoires, setArmoires] = useState<string[]>([])
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS, query: searchParams.get("q") ?? "" })
  const [selectedDoc, setSelectedDoc] = useState<SearchDoc | null>(null)
  const [selectedDocFile, setSelectedDocFile] = useState<DocFile | null>(null)
  const [showSuggest, setShowSuggest] = useState(false)
  const [savedList, setSavedList] = useState<string[]>(RECENT_SEARCHES)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Load from store
  useEffect(() => {
    const load = () => {
      const docs = store.getAllDocumentsWithContext() as SearchDoc[]
      setAllDocs(docs)
      setFournisseurs(store.getFournisseurs())
      const dirs = [...new Set(docs.map(d => d.directionName))].sort()
      const arms = [...new Set(docs.map(d => d.armoireName))].sort()
      setDirections(dirs)
      setArmoires(arms)
    }
    load()
    return store.subscribe(load)
  }, [])

  // Close suggest on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggest(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Load full DocFile when selectedDoc changes
  useEffect(() => {
    if (selectedDoc) {
      const docFile = store.getDocument(selectedDoc.id)
      setSelectedDocFile(docFile || null)
    } else {
      setSelectedDocFile(null)
    }
  }, [selectedDoc])

  const setFilter = useCallback((k: keyof Filters, v: string) => {
    setFilters(prev => ({ ...prev, [k]: v }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setSelectedDoc(null)
  }, [])

  const activeCount = Object.entries(filters).filter(([k, v]) =>
    v && v !== "all" && v !== ""
  ).length

  // Filter docs
  const filtered = allDocs.filter(doc => {
    const q = filters.query.toLowerCase()
    const fq = filters.fournisseur.toLowerCase()

    // Full-text: name, tags, description, ocrContent, fournisseur, numero
    const matchQuery = !q || [
      doc.name,
      doc.description,
      doc.ocrContent ?? "",
      doc.fournisseur ?? "",
      doc.numero ?? "",
      ...(doc.tags ?? []),
    ].some(t => t.toLowerCase().includes(q))

    const matchFournisseur = !fq || (doc.fournisseur ?? "").toLowerCase().includes(fq)
    const matchType = filters.type === "all" || doc.type === filters.type
    const matchStatus = filters.status === "all" || doc.status === filters.status
    const matchDirection = filters.direction === "all" || doc.directionName === filters.direction
    const matchArmoire = filters.armoire === "all" || doc.armoireName === filters.armoire

    let matchDate = true
    if (filters.dateFrom || filters.dateTo) {
      const d = parseDate(doc.date)
      if (d) {
        if (filters.dateFrom && d < new Date(filters.dateFrom)) matchDate = false
        if (filters.dateTo && d > new Date(filters.dateTo + "T23:59:59")) matchDate = false
      }
    }

    return matchQuery && matchFournisseur && matchType && matchStatus && matchDirection && matchArmoire && matchDate
  })

  const totalMontant = filtered.reduce((s, d) => s + (d.montant ?? 0), 0)

  const handleSave = () => {
    const term = filters.query || filters.fournisseur
    if (!term) return
    if (!savedList.includes(term)) setSavedList(prev => [term, ...prev.slice(0, 7)])
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const displayQuery = filters.query || filters.fournisseur

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left: filter panel */}
      <FilterPanel
        filters={filters}
        onChange={setFilter}
        fournisseurs={fournisseurs}
        directions={directions}
        armoires={armoires}
        onReset={resetFilters}
        activeCount={activeCount}
      />

      {/* Center: search bar + results */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search bar */}
        <div className="px-4 pt-3.5 pb-3 border-b border-border space-y-2.5 flex-shrink-0">
          <div className="flex gap-2 items-center">
            {/* Full-text search */}
            <div className="relative flex-1" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.query}
                onChange={e => { setFilter("query", e.target.value); setShowSuggest(true) }}
                onFocus={() => setShowSuggest(true)}
                onKeyDown={e => {
                  if (e.key === "Escape") { setFilter("query", ""); setShowSuggest(false) }
                }}
                placeholder="Recherche full-text (nom, contenu OCR, tags...)"
                className="pl-9 h-9 text-sm bg-muted/50 border-0 focus-visible:ring-1"
              />
              {filters.query && (
                <button onClick={() => setFilter("query", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {showSuggest && (
                <SearchSuggest
                  query={filters.query}
                  fournisseurs={fournisseurs}
                  recentSearches={savedList}
                  onSelect={v => { setFilter("query", v); setShowSuggest(false) }}
                />
              )}
            </div>

            {/* Save */}
            <Button
              variant={saveSuccess ? "default" : "outline"}
              size="sm"
              className="h-9 gap-1.5 text-xs flex-shrink-0"
              onClick={handleSave}
              disabled={!displayQuery}
            >
              {saveSuccess ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{saveSuccess ? "Sauvegarde" : "Sauver"}</span>
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs flex-shrink-0"
              onClick={() => exportCSV(filtered, ["N° Facture", "Document", "Fournisseur", "Montant (FCFA)", "Date", "Statut", "Armoire", "Direction", "Type"])}
              disabled={filtered.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> document{filtered.length !== 1 ? "s" : ""}
            </p>
            {totalMontant > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Total : <span className="font-semibold text-foreground">{formatMontant(totalMontant)}</span>
              </p>
            )}
          </div>
          {displayQuery && (
            <p className="text-[10px] text-muted-foreground hidden sm:block">
              Recherche : <span className="italic">&ldquo;{displayQuery}&rdquo;</span>
            </p>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <ZeroState query={filters.query} fournisseur={filters.fournisseur} onReset={resetFilters} />
        ) : (
          <ResultsTable
            docs={filtered}
            query={filters.query || filters.fournisseur}
            selectedId={selectedDoc?.id ?? null}
            onSelect={setSelectedDoc}
          />
        )}
      </div>

      {/* Right: preview panel */}
      {selectedDoc && selectedDocFile && (
        <DocumentDetailPanel
          file={selectedDocFile}
          context={{ direction: selectedDoc.directionName, armoire: selectedDoc.armoireName, dossier: selectedDoc.dossierName }}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  )
}
