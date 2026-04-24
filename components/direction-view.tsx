"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { store, type Direction, type Armoire, type Dossier, type DocFile } from "@/lib/store"
import {
  Building2, MoreHorizontal, Plus, X, ChevronRight,
  Archive, Folder, FolderOpen, FileText, Download,
  Trash2, Pencil, Search, LayoutGrid, List, ArrowLeft,
  File, FileSpreadsheet, Image,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Types are imported from store

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countDocs(direction: Direction) {
  return direction.armoires.reduce((a, arm) =>
    a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0)
}

function FileTypeIcon({ type }: { type: DocFile["type"] }) {
  if (type === "pdf") return <FileText className="h-4 w-4 text-red-500" />
  if (type === "xlsx") return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
  if (type === "img") return <Image className="h-4 w-4 text-blue-500" />
  return <File className="h-4 w-4 text-blue-600" />
}

// ─── Slide-in panel ───────────────────────────────────────────────────────────

function SlidePanel({
  open,
  onClose,
  title,
  onSave,
  placeholder,
}: {
  open: boolean
  onClose: () => void
  title: string
  onSave: (name: string) => void
  placeholder: string
}) {
  const [name, setName] = useState("")

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim())
    setName("")
    onClose()
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-card border-l border-border z-50 flex flex-col shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nom</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={placeholder}
              className="h-9 text-sm rounded"
              onKeyDown={e => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1 h-9 text-sm rounded" onClick={handleSave} disabled={!name.trim()}>
            Creer
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Direction Grid ───────────────────────────────────────────────────────────

function DirectionGrid({
  directions,
  onOpen,
  onCreate,
  onEdit,
  onDelete,
}: {
  directions: Direction[]
  onOpen: (d: Direction) => void
  onCreate: (name: string) => void
  onEdit: (d: Direction, name: string) => void
  onDelete: (id: string) => void
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Direction | null>(null)
  const [editName, setEditName] = useState("")

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded bg-muted text-sm font-medium text-foreground">
          Directions
        </span>
        <Button
          className="h-9 gap-2 text-sm rounded"
          onClick={() => setPanelOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nouvelle Direction
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {directions.map(dir => (
          <div
            key={dir.id}
            onClick={() => onOpen(dir)}
            className="group relative bg-card border border-border rounded-lg p-5 cursor-pointer hover:border-foreground/20 hover:shadow-sm transition-all"
          >
            {/* Three-dot menu */}
            <div
              className="absolute top-4 right-4"
              onClick={e => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditTarget(dir)
                      setEditName(dir.name)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(dir.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Icon + Name */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                <Building2 className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-base font-semibold text-foreground">{dir.name}</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{dir.date}</span>
              <span>{dir.armoires.length} {dir.armoires.length <= 1 ? "armoire" : "armoires"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create panel */}
      <SlidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Nouvelle Direction"
        placeholder="Ex: Finance, RH..."
        onSave={onCreate}
      />

      {/* Edit dialog (inline slide panel) */}
      {editTarget && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setEditTarget(null)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-card border-l border-border z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Modifier la Direction</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditTarget(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nom</label>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="h-9 text-sm rounded"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-5 border-t border-border flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={() => setEditTarget(null)}>
                Annuler
              </Button>
              <Button className="flex-1 h-9 text-sm rounded" onClick={() => {
                if (editName.trim()) {
                  onEdit(editTarget, editName.trim())
                  setEditTarget(null)
                }
              }}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Armoire + Dossier + Files view ──────────────────────────────────────────

function DirectionDetail({
  direction,
  onBack,
  onAddArmoire,
  onAddDossier,
}: {
  direction: Direction
  onBack: () => void
  onAddArmoire: (dirId: string, name: string) => void
  onAddDossier: (dirId: string, armoireId: string, name: string) => void
}) {
  const searchParams = useSearchParams()
  const [selectedArmoire, setSelectedArmoire] = useState<Armoire | null>(
    direction.armoires[0] ?? null
  )
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [armoirePanelOpen, setArmoirePanelOpen] = useState(false)
  const [dossierPanelOpen, setDossierPanelOpen] = useState(false)

  // Auto-select armoire from query params
  useEffect(() => {
    const armoireParam = searchParams.get('armoire')
    if (armoireParam && direction.armoires.length > 0) {
      const armoire = direction.armoires.find(a => a.name.toLowerCase().includes(armoireParam.toLowerCase()))
      if (armoire) {
        setSelectedArmoire(armoire)
        setSelectedDossier(null)
        setSearch("")
      }
    }
  }, [searchParams, direction.armoires])

  // When armoire changes, reset dossier
  const handleSelectArmoire = (arm: Armoire) => {
    setSelectedArmoire(arm)
    setSelectedDossier(null)
    setSearch("")
  }

  // Breadcrumb
  const breadcrumb = [
    { label: "Directions", onClick: onBack },
    { label: direction.name, onClick: () => { setSelectedDossier(null) } },
    ...(selectedArmoire ? [{ label: selectedArmoire.name, onClick: () => setSelectedDossier(null) }] : []),
    ...(selectedDossier ? [{ label: selectedDossier.name, onClick: () => {} }] : []),
  ]

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left: Armoires list */}
      <div className="w-56 border-r border-border flex flex-col flex-shrink-0 bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setArmoirePanelOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {direction.armoires.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center mt-6 px-4">Aucune armoire</p>
          ) : (
            direction.armoires.map(arm => {
              const isActive = selectedArmoire?.id === arm.id
              return (
                <button
                  key={arm.id}
                  onClick={() => handleSelectArmoire(arm)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors text-sm",
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {isActive
                    ? <FolderOpen className="h-4 w-4 flex-shrink-0 text-foreground" />
                    : <Archive className="h-4 w-4 flex-shrink-0" />
                  }
                  <span className="flex-1 truncate">{arm.name}</span>
                  <MoreHorizontal className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right: content area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Sub-header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm min-w-0">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                <button
                  onClick={crumb.onClick}
                  className={cn(
                    "truncate transition-colors",
                    i === breadcrumb.length - 1
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
          </nav>

          {/* Actions */}
          {selectedArmoire && !selectedDossier && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 w-44 text-xs bg-muted/50 border-0 rounded"
                />
              </div>
              <Button
                className="h-8 gap-1.5 text-xs rounded"
                onClick={() => setDossierPanelOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Nouveau Dossier
              </Button>
            </div>
          )}

          {selectedDossier && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 w-44 text-xs bg-muted/50 border-0 rounded"
                />
              </div>
              <div className="flex border border-border rounded overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-none", view === "list" && "bg-muted")}
                  onClick={() => setView("list")}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-none", view === "grid" && "bg-muted")}
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button className="h-8 gap-1.5 text-xs rounded">
                <Plus className="h-3.5 w-3.5" />
                Nouveau Document
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!selectedArmoire ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Archive className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Selectionnez une armoire</p>
            </div>
          ) : !selectedDossier ? (
            <DossierList
              armoire={selectedArmoire}
              search={search}
              onOpen={setSelectedDossier}
            />
          ) : (
            <FileList
              dossier={selectedDossier}
              search={search}
              view={view}
            />
          )}
        </div>
      </div>

      {/* Slide panels */}
      <SlidePanel
        open={armoirePanelOpen}
        onClose={() => setArmoirePanelOpen(false)}
        title="Nouvelle Armoire"
        placeholder="Ex: Finance, Archives..."
        onSave={name => onAddArmoire(direction.id, name)}
      />
      <SlidePanel
        open={dossierPanelOpen}
        onClose={() => setDossierPanelOpen(false)}
        title="Nouveau Dossier"
        placeholder="Ex: Dossier Finance #6..."
        onSave={name => selectedArmoire && onAddDossier(direction.id, selectedArmoire.id, name)}
      />
    </div>
  )
}

// ─── Dossier list ─────────────────────────────────────────────────────────────

function DossierList({
  armoire,
  search,
  onOpen,
}: {
  armoire: Armoire
  search: string
  onOpen: (d: Dossier) => void
}) {
  const filtered = armoire.dossiers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Folder className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-sm">Aucun dossier</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-4">
        Dossiers ({filtered.length})
      </p>
      <div className="rounded border border-border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_160px_160px_120px] gap-4 px-4 py-2.5 bg-muted/50 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Dossier</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Date de creation</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Documents</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide"></span>
        </div>
        {filtered.map((dos, i) => (
          <div
            key={dos.id}
            className={cn(
              "grid grid-cols-[1fr_160px_160px_120px] gap-4 px-4 py-3.5 items-center hover:bg-muted/30 transition-colors cursor-pointer group",
              i < filtered.length - 1 && "border-b border-border"
            )}
            onClick={() => onOpen(dos)}
          >
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" fill="currentColor" />
              <span className="text-sm font-medium text-foreground">{dos.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{dos.date}</span>
            <span className="text-sm text-muted-foreground">{dos.files.length} document{dos.files.length !== 1 ? "s" : ""}</span>
            <div
              className="flex items-center gap-1 justify-end"
              onClick={e => e.stopPropagation()}
            >
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── File list ────────────────────────────────────────────────────────────────

function FileList({
  dossier,
  search,
  view,
}: {
  dossier: Dossier
  search: string
  view: "list" | "grid"
}) {
  const filtered = dossier.files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <FileText className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-sm">Aucun fichier</p>
      </div>
    )
  }

  if (view === "grid") {
    return (
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">
          Fichiers ({filtered.length})
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(file => (
            <div
              key={file.id}
              className="group border border-border rounded bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center justify-center h-16 mb-3 bg-muted/50 rounded">
                <FileTypeIcon type={file.type} />
              </div>
              <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{file.size} · {file.date}</p>
              <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" className="h-6 w-6 rounded">
                  <Download className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-6 w-6 rounded text-red-500 hover:text-red-600 border-red-200">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-4">
        Fichiers ({filtered.length})
      </p>
      <div className="rounded border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_120px_100px] gap-4 px-4 py-2.5 bg-muted/50 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Fichier</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Taille</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Date</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide"></span>
        </div>
        {filtered.map((file, i) => (
          <div
            key={file.id}
            className={cn(
              "grid grid-cols-[1fr_100px_120px_100px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors group",
              i < filtered.length - 1 && "border-b border-border"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileTypeIcon type={file.type} />
              <span className="text-sm text-foreground truncate">{file.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{file.size}</span>
            <span className="text-sm text-muted-foreground">{file.date}</span>
            <div
              className="flex items-center gap-1 justify-end"
              onClick={e => e.stopPropagation()}
            >
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function DirectionView() {
  const searchParams = useSearchParams()
  const [directions, setDirections] = useState<Direction[]>([])
  const [openDirection, setOpenDirection] = useState<Direction | null>(null)

  useEffect(() => {
    setDirections(store.getDirections())
    return store.subscribe(() => {
      setDirections(store.getDirections())
      // Refresh openDirection if it changed
      if (openDirection) {
        const updated = store.getDirections().find(d => d.id === openDirection.id)
        if (updated) setOpenDirection(updated)
      }
    })
  }, [openDirection])

  // Handle query parameters to auto-open direction
  useEffect(() => {
    const directionParam = searchParams.get('direction')
    if (directionParam && directions.length > 0) {
      const direction = directions.find(d => d.name.toLowerCase().includes(directionParam.toLowerCase()))
      if (direction && !openDirection) {
        setOpenDirection(direction)
      }
    }
  }, [searchParams, directions, openDirection])

  const handleCreate = (name: string) => {
    store.addDirection(name)
  }

  const handleEdit = (dir: Direction, newName: string) => {
    store.updateDirection(dir.id, { name: newName })
  }

  const handleDelete = (id: string) => {
    store.deleteDirection(id)
  }

  const handleAddArmoire = (dirId: string, name: string) => {
    store.addArmoire(dirId, name)
  }

  const handleAddDossier = (dirId: string, armoireId: string, name: string) => {
    store.addDossier(dirId, armoireId, name)
  }

  if (openDirection) {
    return (
      <DirectionDetail
        direction={openDirection}
        onBack={() => setOpenDirection(null)}
        onAddArmoire={handleAddArmoire}
        onAddDossier={handleAddDossier}
      />
    )
  }

  return (
    <DirectionGrid
      directions={directions}
      onOpen={setOpenDirection}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
