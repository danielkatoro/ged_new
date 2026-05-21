"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { store, type Direction, type Agence, type Armoire, type Dossier, type DocFile } from "@/lib/store"
import {
  Building2, MoreHorizontal, Plus, X, ChevronRight,
  Archive, Folder, FolderOpen, FileText, Download,
  Trash2, Pencil, Search, LayoutGrid, List, ArrowLeft,
  File, FileSpreadsheet, Image, Upload, Users, Check,
  FolderPlus, FilePlus, FolderUp, FileUp, CheckSquare, Square,
  Eye, Camera, RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DocumentDetailPanel } from "@/components/document-detail-panel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countDocs(direction: Direction) {
  const agences = direction.agences.length > 0 ? direction.agences : [{ id: 'fallback', name: 'Agence Principale', armoires: direction.armoires }]
  return agences.reduce((sum, agence) =>
    sum + agence.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0), 0)
}

function FileTypeIcon({ type }: { type: DocFile["type"] }) {
  if (type === "pdf") return <FileText className="h-4 w-4 text-red-500" />
  if (type === "xlsx") return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
  if (type === "img") return <Image className="h-4 w-4 text-blue-500" />
  return <File className="h-4 w-4 text-blue-600" />
}

const ICON_OPTIONS = [
  { value: "archive", icon: Archive, label: "Archive" },
  { value: "folder", icon: Folder, label: "Dossier" },
  { value: "file-text", icon: FileText, label: "Document" },
  { value: "users", icon: Users, label: "Utilisateurs" },
  { value: "building", icon: Building2, label: "Batiment" },
]

function getIconComponent(iconName: string) {
  const found = ICON_OPTIONS.find(o => o.value === iconName)
  return found ? found.icon : Archive
}

// ─── Direction Create/Edit Panel ──────────────────────────────────────────────

function DirectionPanel({
  open,
  onClose,
  direction,
  onSave,
}: {
  open: boolean
  onClose: () => void
  direction?: Direction | null
  onSave: (data: { name: string; description: string; directeur: string }) => void
}) {
  const [name, setName] = useState(direction?.name ?? "")
  const [description, setDescription] = useState(direction?.description ?? "")
  const [directeur, setDirecteur] = useState("")

  useEffect(() => {
    if (open) {
      setName(direction?.name ?? "")
      setDescription(direction?.description ?? "")
      setDirecteur("")
    }
  }, [open, direction])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim(), directeur: directeur.trim() })
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
          "fixed top-0 right-0 h-full w-96 bg-card border-l border-border z-50 flex flex-col shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            {direction ? "Modifier la Direction" : "Nouvelle Direction"}
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nom *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Direction Finance"
              className="h-9 text-sm rounded"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description de la direction..."
              className="text-sm rounded resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Directeur</label>
            <Input
              value={directeur}
              onChange={e => setDirecteur(e.target.value)}
              placeholder="Nom du directeur"
              className="h-9 text-sm rounded"
            />
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1 h-9 text-sm rounded" onClick={handleSave} disabled={!name.trim()}>
            {direction ? "Sauvegarder" : "Creer"}
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Armoire Create/Edit Panel ────────────────────────────────────────────────

function ArmoirePanel({
  open,
  onClose,
  armoire,
  onSave,
}: {
  open: boolean
  onClose: () => void
  armoire?: Armoire | null
  onSave: (data: { name: string; icon: string; admins: string[] }) => void
}) {
  const [name, setName] = useState(armoire?.name ?? "")
  const [icon, setIcon] = useState(armoire?.icon ?? "archive")
  const [adminsText, setAdminsText] = useState("")

  useEffect(() => {
    if (open) {
      setName(armoire?.name ?? "")
      setIcon(armoire?.icon ?? "archive")
      setAdminsText("")
    }
  }, [open, armoire])

  const handleSave = () => {
    if (!name.trim()) return
    const admins = adminsText.split(",").map(a => a.trim()).filter(Boolean)
    onSave({ name: name.trim(), icon, admins })
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
          "fixed top-0 right-0 h-full w-96 bg-card border-l border-border z-50 flex flex-col shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            {armoire ? "Modifier l'Armoire" : "Nouvelle Armoire"}
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nom *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Armoire Comptabilite"
              className="h-9 text-sm rounded"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Icone</label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map(opt => {
                  const IconComp = opt.icon
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <IconComp className="h-4 w-4" />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Administrateurs</label>
            <Input
              value={adminsText}
              onChange={e => setAdminsText(e.target.value)}
              placeholder="Emails separes par des virgules"
              className="h-9 text-sm rounded"
            />
            <p className="text-[10px] text-muted-foreground">Ex: admin@exemple.com, autre@exemple.com</p>
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1 h-9 text-sm rounded" onClick={handleSave} disabled={!name.trim()}>
            {armoire ? "Sauvegarder" : "Creer"}
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Agence Create/Edit Panel ─────────────────────────────────────────────────────

function AgencePanel({
  open,
  onClose,
  agence,
  onSave,
}: {
  open: boolean
  onClose: () => void
  agence?: Agence | null
  onSave: (data: { name: string; location: string; description: string }) => void
}) {
  const [name, setName] = useState(agence?.name ?? "")
  const [location, setLocation] = useState(agence?.location ?? "")
  const [description, setDescription] = useState(agence?.description ?? "")

  useEffect(() => {
    if (open) {
      setName(agence?.name ?? "")
      setLocation(agence?.location ?? "")
      setDescription(agence?.description ?? "")
    }
  }, [open, agence])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), location: location.trim(), description: description.trim() })
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
          "fixed top-0 right-0 h-full w-96 bg-card border-l border-border z-50 flex flex-col shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            {agence ? "Modifier l'Agence" : "Nouvelle Agence"}
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nom *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Agence Centre"
              className="h-9 text-sm rounded"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Quartier / Ville</label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ex: Plateau, Abidjan"
              className="h-9 text-sm rounded"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optionnel"
              className="text-sm rounded resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1 h-9 text-sm rounded" onClick={handleSave} disabled={!name.trim()}>
            {agence ? "Sauvegarder" : "Creer"}
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Dossier Create Panel ─────────────────────────────────────────────────────

function DossierPanel({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (name: string) => void
}) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (open) setName("")
  }, [open])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim())
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
          <h3 className="text-sm font-semibold text-foreground">Nouveau Dossier</h3>
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
              placeholder="Ex: Dossier Finance #6..."
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

// ─── Import Files Panel ───────────────────────────────────────────────────────

import { CameraScannerModal } from "@/components/camera-scanner-modal"

// ─── Import Files Panel ───────────────────────────────────────────────────────

function ImportFilesPanel({
  open,
  onClose,
  onImport,
}: {
  open: boolean
  onClose: () => void
  onImport: (files: { file: File; source: "upload" | "scan" }[]) => void
}) {
  type PendingFile = { file: File; source: "upload" | "scan" }
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<PendingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [scannerOpen, setScannerOpen] = useState(false)

  useEffect(() => {
    if (open) setFiles([])
  }, [open])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles.map(file => ({ file, source: "upload" }))])
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      setFiles(prev => [...prev, ...Array.from(selectedFiles).map(file => ({ file, source: "upload" }))])
    }
  }

  const handleScanCapture = (file: File) => {
    setFiles(prev => [...prev, { file, source: "scan" }])
  }

  const handleImport = () => {
    if (files.length > 0) {
      onImport(files)
      onClose()
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
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
          "fixed top-0 right-0 h-full w-[480px] bg-card border-l border-border z-50 flex flex-col shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Importer des fichiers</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
            )}
          >
            <Upload className={cn("h-10 w-10 mx-auto mb-3", isDragging ? "text-primary" : "text-muted-foreground")} />
            <p className="text-sm font-medium text-foreground mb-1">
              Glissez vos fichiers ici
            </p>
            <p className="text-xs text-muted-foreground">
              ou cliquez pour selectionner
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4" />
              Importer des fichiers
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() => setScannerOpen(true)}
            >
              <Camera className="h-4 w-4" />
              Scanner un document
            </Button>
          </div>

          {/* Files list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{files.length} fichier(s) selectionne(s)</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {files.map((pending, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    {pending.source === "scan" ? (
                      <Camera className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm text-foreground flex-1 truncate">{pending.file.name}</span>
                    <span className="text-xs text-muted-foreground">{(pending.file.size / 1024).toFixed(0)} KB</span>
                    <span className={cn(
                      "text-xs uppercase px-1.5 py-0.5 rounded",
                      pending.source === "scan" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}>
                      {pending.source}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1 h-9 text-sm rounded" onClick={handleImport} disabled={files.length === 0}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Importer {files.length > 0 && `(${files.length})`}
          </Button>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleScanCapture}
      />
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
  onCreateAgence,
}: {
  directions: Direction[]
  onOpen: (d: Direction) => void
  onCreate: (data: { name: string; description: string; directeur: string }) => void
  onEdit: (d: Direction, data: { name: string; description: string; directeur: string }) => void
  onDelete: (id: string) => void
  onCreateAgence: (directionId: string, data: { name: string; location?: string; description?: string }) => void
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Direction | null>(null)
  const [agencyTarget, setAgencyTarget] = useState<Direction | null>(null)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = directions.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded bg-muted text-sm font-medium text-foreground">
            Directions
          </span>
          <span className="text-sm text-muted-foreground">{filtered.length} resultat(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 w-48 text-sm bg-muted/50 border-0 rounded"
            />
          </div>
          <div className="flex border border-border rounded overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 rounded-none", view === "grid" && "bg-muted")}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 rounded-none", view === "list" && "bg-muted")}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button className="h-9 gap-2 text-sm rounded" onClick={() => setPanelOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle Direction
          </Button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(dir => (
            <div
              key={dir.id}
              onClick={() => onOpen(dir)}
              className="group relative bg-card border border-border rounded-lg p-5 cursor-pointer hover:border-foreground/20 hover:shadow-sm transition-all"
            >
              {/* Three-dot menu */}
              <div className="absolute top-4 right-4" onClick={e => e.stopPropagation()}>
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
                    <DropdownMenuItem onClick={() => setEditTarget(dir)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAgencyTarget(dir)}>
                      <Building2 className="h-3.5 w-3.5 mr-2" />
                      Nouvelle agence
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
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                  <Building2 className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-base font-semibold text-foreground">{dir.name}</span>
              </div>

              {/* Description */}
              {dir.description && (
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{dir.description}</p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{dir.date}</span>
                <span>{dir.agences.length} {dir.agences.length <= 1 ? "agence" : "agences"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Direction</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Description</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Agences</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dir, i) => (
                <tr
                  key={dir.id}
                  onClick={() => onOpen(dir)}
                  className={cn(
                    "hover:bg-muted/30 transition-colors cursor-pointer",
                    i < filtered.length - 1 && "border-b border-border"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{dir.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-muted-foreground truncate max-w-xs block">{dir.description || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground">{dir.agences.length}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-muted-foreground">{dir.date}</span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditTarget(dir)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(dir.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create panel */}
      <DirectionPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSave={onCreate}
      />

      <AgencePanel
        open={!!agencyTarget}
        onClose={() => setAgencyTarget(null)}
        onSave={data => {
          if (agencyTarget) {
            onCreateAgence(agencyTarget.id, data)
            setAgencyTarget(null)
          }
        }}
      />

      {/* Edit panel */}
      <DirectionPanel
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        direction={editTarget}
        onSave={data => {
          if (editTarget) {
            onEdit(editTarget, data)
            setEditTarget(null)
          }
        }}
      />
    </div>
  )
}

// ─── Direction Overview (new layout matching the design) ──────────────────────

function DirectionOverview({
  direction,
  onBack,
  onAddAgence,
  onAddArmoire,
  onOpenArmoire,
  onEditDirection,
}: {
  direction: Direction
  onBack: () => void
  onAddAgence: (dirId: string, data: { name: string; location?: string; description?: string }) => void
  onAddArmoire: (dirId: string, agenceId: string | null, data: { name: string; icon: string; admins: string[] }) => void
  onOpenArmoire: (agence: Agence, armoire: Armoire) => void
  onEditDirection: (dir: Direction, data: { name: string; description: string; directeur: string }) => void
}) {
  const [agencePanelOpen, setAgencePanelOpen] = useState(false)
  const [armoirePanelTarget, setArmoirePanelTarget] = useState<Agence | null>(null)
  const [editingResponsable, setEditingResponsable] = useState(false)
  const [responsable, setResponsable] = useState(direction.description?.split("Responsable: ")[1] || "Non defini")
  const [importPanelOpen, setImportPanelOpen] = useState(false)

  // Calculate stats
  const totalDocs = direction.agences.reduce((sum, ag) =>
    sum + ag.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0), 0
  ) + direction.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0)

  const totalAgences = direction.agences.length || (direction.armoires.length > 0 ? 1 : 0)

  const pendingDocs = direction.agences.reduce((sum, ag) =>
    sum + ag.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.filter(f => f.status === "En validation").length, 0), 0), 0
  ) + direction.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.filter(f => f.status === "En validation").length, 0), 0)

  // Get all agences (or create a default one if only armoires exist)
  const agences: Agence[] = direction.agences.length > 0
    ? direction.agences
    : direction.armoires.length > 0
      ? [{
          id: `ag-${direction.id}-default`,
          name: "Agence Principale",
          location: "Siege",
          description: "Agence principale",
          armoires: direction.armoires,
        }]
      : []

  const countAgenceDocs = (agence: Agence) => {
    return agence.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0)
  }

  const countArmoireDocs = (armoire: Armoire) => {
    return armoire.dossiers.reduce((sum, dos) => sum + dos.files.length, 0)
  }

  const handleSaveResponsable = () => {
    onEditDirection(direction, {
      name: direction.name,
      description: `Responsable: ${responsable}`,
      directeur: responsable
    })
    setEditingResponsable(false)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Building2 className="h-7 w-7 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{direction.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {editingResponsable ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={responsable}
                      onChange={e => setResponsable(e.target.value)}
                      className="h-7 text-sm w-48"
                      autoFocus
                      onKeyDown={e => e.key === "Enter" && handleSaveResponsable()}
                    />
                    <Button size="sm" className="h-7 text-xs" onClick={handleSaveResponsable}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingResponsable(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    onClick={() => setEditingResponsable(true)}
                  >
                    Responsable : {responsable}
                    <Pencil className="h-3 w-3 opacity-50" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <Button className="h-9 gap-2 text-sm" onClick={() => setImportPanelOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter un document
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-center text-foreground">{totalDocs}</p>
            <p className="text-xs text-muted-foreground text-center">Documents</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-center text-foreground">{direction.members}</p>
            <p className="text-xs text-muted-foreground text-center">Membres</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-center text-foreground">{totalAgences}</p>
            <p className="text-xs text-muted-foreground text-center">Agences</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className={cn("text-2xl font-semibold text-center", pendingDocs > 0 ? "text-orange-500" : "text-foreground")}>{pendingDocs}</p>
            <p className={cn("text-xs text-center", pendingDocs > 0 ? "text-orange-500" : "text-muted-foreground")}>En validation</p>
          </div>
        </div>

        {/* Agences Section */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Agences</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{totalAgences}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAgencePanelOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Ajouter une agence
            </Button>
          </div>

          <div className="p-5">
            {agences.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Aucune agence dans cette direction</p>
                <Button onClick={() => setAgencePanelOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une agence
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {agences.map(agence => (
                  <div key={agence.id} className="border border-border rounded-lg overflow-hidden bg-background">
                    {/* Agency Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{agence.name}</p>
                          {agence.location && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground" />
                              {agence.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-foreground">{countAgenceDocs(agence)}</p>
                        <p className="text-[10px] text-muted-foreground">documents</p>
                      </div>
                    </div>

                    {/* Armoires list */}
                    <div className="p-3 space-y-1">
                      {agence.armoires.map(armoire => {
                        const IconComp = getIconComponent(armoire.icon || "archive")
                        return (
                          <button
                            key={armoire.id}
                            onClick={() => onOpenArmoire(agence, armoire)}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-muted/50 transition-colors text-left group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <IconComp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-foreground truncate">{armoire.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{countArmoireDocs(armoire)} docs</span>
                          </button>
                        )
                      })}

                      {/* Add armoire button */}
                      <button
                        onClick={() => setArmoirePanelTarget(agence)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors mt-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter une armoire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panels */}
      <AgencePanel
        open={agencePanelOpen}
        onClose={() => setAgencePanelOpen(false)}
        onSave={data => onAddAgence(direction.id, data)}
      />
      <ArmoirePanel
        open={!!armoirePanelTarget}
        onClose={() => setArmoirePanelTarget(null)}
        onSave={data => {
          if (armoirePanelTarget) {
            const realAgenceId = armoirePanelTarget.id.startsWith('ag-') && armoirePanelTarget.id.includes('-default')
              ? null
              : armoirePanelTarget.id
            onAddArmoire(direction.id, realAgenceId, data)
            setArmoirePanelTarget(null)
          }
        }}
      />
      <ImportFilesPanel
        open={importPanelOpen}
        onClose={() => setImportPanelOpen(false)}
        onImport={() => {}}
      />
    </div>
  )
}

// ─── Armoire + Dossier + Files view ──────────────────────────────────────────

function DirectionDetail({
  direction,
  selectedAgence: initialAgence,
  selectedArmoire: initialArmoire,
  onBack,
  onBackToOverview,
  onAddDossier,
}: {
  direction: Direction
  selectedAgence: Agence
  selectedArmoire: Armoire
  onBack: () => void
  onBackToOverview: () => void
  onAddDossier: (dirId: string, armoireId: string, name: string) => void
}) {
  const searchParams = useSearchParams()
  const [selectedArmoire, setSelectedArmoire] = useState<Armoire>(initialArmoire)
  const [selectedAgence, setSelectedAgence] = useState<Agence>(initialAgence)
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null)
  const [selectedFile, setSelectedFile] = useState<DocFile | null>(null)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [dossierPanelOpen, setDossierPanelOpen] = useState(false)
  const [importPanelOpen, setImportPanelOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  // Sync armoire with direction changes
  useEffect(() => {
    const agence = direction.agences.find(ag => ag.id === selectedAgence.id) ||
      (direction.armoires.length > 0 ? {
        id: `ag-${direction.id}-default`,
        name: "Agence Principale",
        location: "Siege",
        description: "Agence principale",
        armoires: direction.armoires,
      } : null)

    if (agence) {
      setSelectedAgence(agence)
      const armoire = agence.armoires.find(a => a.id === selectedArmoire.id)
      if (armoire) {
        setSelectedArmoire(armoire)
        if (selectedDossier) {
          const dossier = armoire.dossiers.find(d => d.id === selectedDossier.id)
          setSelectedDossier(dossier || null)
        }
      }
    }
  }, [direction])

  const handleImportFiles = (pendingFiles: { file: File; source: "upload" | "scan" }[]) => {
    if (!selectedArmoire) return

    let targetDossier = selectedDossier
    if (!targetDossier) {
      targetDossier = store.addDossier(direction.id, selectedArmoire.id, "Documents importes")
      setSelectedDossier(targetDossier)
    }

    store.addDocuments(
      direction.id,
      selectedArmoire.id,
      targetDossier.id,
      pendingFiles
    )
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  const selectAllFiles = () => {
    if (!selectedDossier) return
    if (selectedFiles.size === selectedDossier.files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(selectedDossier.files.map(f => f.id)))
    }
  }

  // Breadcrumb
  const breadcrumb = [
    { label: "Directions", onClick: onBack },
    { label: direction.name, onClick: onBackToOverview },
    { label: selectedAgence.name, onClick: onBackToOverview },
    { label: selectedArmoire.name, onClick: () => setSelectedDossier(null) },
    ...(selectedDossier ? [{ label: selectedDossier.name, onClick: () => {} }] : []),
  ]

  return (
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
        {!selectedDossier && (
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 gap-1.5 text-xs rounded">
                  <Plus className="h-3.5 w-3.5" />
                  Nouveau
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDossierPanelOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Nouveau Dossier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportPanelOpen(true)}>
                  <FolderUp className="h-4 w-4 mr-2" />
                  Importer un dossier
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {selectedDossier && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs text-muted-foreground">{selectedFiles.size} selectionne(s)</span>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Download className="h-3 w-3" />
                  Telecharger
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </Button>
              </div>
            )}
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
            <Button className="h-8 gap-1.5 text-xs rounded" onClick={() => setImportPanelOpen(true)}>
              <FilePlus className="h-3.5 w-3.5" />
              Importer
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {!selectedDossier ? (
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
            onFileOpen={setSelectedFile}
            selectedFiles={selectedFiles}
            onToggleSelect={toggleFileSelection}
            onSelectAll={selectAllFiles}
          />
        )}
      </div>

      {/* Slide panels */}
      <DossierPanel
        open={dossierPanelOpen}
        onClose={() => setDossierPanelOpen(false)}
        onSave={name => onAddDossier(direction.id, selectedArmoire.id, name)}
      />
      <ImportFilesPanel
        open={importPanelOpen}
        onClose={() => setImportPanelOpen(false)}
        onImport={handleImportFiles}
      />

      {selectedFile && selectedDossier && (
        <DocumentDetailPanel
          file={selectedFile}
          context={{
            direction: direction.name,
            armoire: selectedArmoire.name,
            dossier: selectedDossier.name,
          }}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}

// ─── Direction List Sidebar (left panel) ──────────────────────────────────────

function DirectionListSidebar({
  directions,
  selectedDirection,
  onSelectDirection,
  onCreateDirection,
}: {
  directions: Direction[]
  selectedDirection: Direction | null
  onSelectDirection: (d: Direction) => void
  onCreateDirection: () => void
}) {
  const [search, setSearch] = useState("")

  const filtered = directions.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const countDirDocs = (dir: Direction) => {
    const agenceDocs = dir.agences.reduce((sum, ag) =>
      sum + ag.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0), 0)
    const directDocs = dir.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0)
    return agenceDocs + directDocs
  }

  const countDirAgences = (dir: Direction) => {
    return dir.agences.length || (dir.armoires.length > 0 ? 1 : 0)
  }

  return (
    <div className="w-72 border-r border-border flex flex-col flex-shrink-0 bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Directions</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCreateDirection}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-muted/50 border-0 rounded"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map(dir => {
          const isActive = selectedDirection?.id === dir.id
          const docCount = countDirDocs(dir)
          const agenceCount = countDirAgences(dir)

          return (
            <button
              key={dir.id}
              onClick={() => onSelectDirection(dir)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-3 mb-1 text-left transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              )}
            >
              <div className={cn(
                "h-9 w-9 rounded flex items-center justify-center flex-shrink-0",
                isActive ? "bg-background/20" : "bg-muted"
              )}>
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{dir.name}</p>
                <p className={cn(
                  "text-xs",
                  isActive ? "text-background/70" : "text-muted-foreground"
                )}>
                  {docCount} docs - {agenceCount} {agenceCount <= 1 ? "agence" : "agences"}
                </p>
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 flex-shrink-0",
                isActive ? "text-background/70" : "text-muted-foreground"
              )} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Old DirectionDetail for backward compat ────────────────────────────────────

function OldDirectionDetail({
  direction,
  onBack,
  onAddAgence,
  onAddArmoire,
  onAddDossier,
}: {
  direction: Direction
  onBack: () => void
  onAddAgence: (dirId: string, data: { name: string; location?: string; description?: string }) => void
  onAddArmoire: (dirId: string, agenceId: string | null, data: { name: string; icon: string; admins: string[] }) => void
  onAddDossier: (dirId: string, armoireId: string, name: string) => void
}) {
  const searchParams = useSearchParams()
  const defaultAgence = direction.agences.length > 0
    ? direction.agences[0]
    : direction.armoires.length > 0
      ? {
          id: `ag-${direction.id}-default`,
          name: "Agence principale",
          location: "Siege",
          description: "Agence principale",
          armoires: direction.armoires,
        }
      : null
  const [selectedAgence, setSelectedAgence] = useState<Agence | null>(defaultAgence)
  const [selectedArmoire, setSelectedArmoire] = useState<Armoire | null>(
    defaultAgence?.armoires[0] ?? null
  )
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null)
  const [selectedFile, setSelectedFile] = useState<DocFile | null>(null)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [agencePanelOpen, setAgencePanelOpen] = useState(false)
  const [armoirePanelOpen, setArmoirePanelOpen] = useState(false)
  const [dossierPanelOpen, setDossierPanelOpen] = useState(false)
  const [importPanelOpen, setImportPanelOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    const selectedAgenceId = selectedAgence?.id
    const selectedArmoireId = selectedArmoire?.id
    const selectedDossierId = selectedDossier?.id

    let nextAgence: Agence | null = null
    let nextArmoire: Armoire | null = null
    let nextDossier: Dossier | null = null

    if (direction.agences.length > 0) {
      nextAgence = selectedAgenceId
        ? direction.agences.find(ag => ag.id === selectedAgenceId) ?? direction.agences[0]
        : direction.agences[0]
    } else if (direction.armoires.length > 0) {
      nextAgence = {
        id: `ag-${direction.id}-default`,
        name: "Agence principale",
        location: "Siege",
        description: "Agence principale",
        armoires: direction.armoires,
      }
    }

    if (nextAgence) {
      nextArmoire = selectedArmoireId
        ? nextAgence.armoires.find(a => a.id === selectedArmoireId) ?? nextAgence.armoires[0] ?? null
        : nextAgence.armoires[0] ?? null
    }

    if (nextArmoire) {
      nextDossier = selectedDossierId
        ? nextArmoire.dossiers.find(dos => dos.id === selectedDossierId) ?? null
        : null
    }

    setSelectedAgence(nextAgence)
    setSelectedArmoire(nextArmoire)
    setSelectedDossier(nextDossier)
    setSearch("")
    setSelectedFiles(new Set())
  }, [direction])

  // Auto-select armoire from query params
  useEffect(() => {
    const armoireParam = searchParams.get('armoire')
    if (armoireParam && selectedAgence?.armoires.length) {
      const armoire = selectedAgence.armoires.find(a => a.name.toLowerCase().includes(armoireParam.toLowerCase()))
      if (armoire) {
        setSelectedArmoire(armoire)
        setSelectedDossier(null)
        setSearch("")
      }
    }
  }, [searchParams, selectedAgence])

  // When armoire changes, reset dossier
  const handleSelectArmoire = (arm: Armoire) => {
    setSelectedArmoire(arm)
    setSelectedDossier(null)
    setSearch("")
    setSelectedFiles(new Set())
  }

  const handleSelectAgence = (agence: Agence) => {
    setSelectedAgence(agence)
    setSelectedArmoire(agence.armoires[0] ?? null)
    setSelectedDossier(null)
    setSearch("")
    setSelectedFiles(new Set())
  }

  const handleImportFiles = (pendingFiles: { file: File; source: "upload" | "scan" }[]) => {
    if (!selectedArmoire) return

    let targetDossier = selectedDossier
    if (!targetDossier) {
      targetDossier = store.addDossier(direction.id, selectedArmoire.id, "Documents importes")
      setSelectedDossier(targetDossier)
    }

    store.addDocuments(
      direction.id,
      selectedArmoire.id,
      targetDossier.id,
      pendingFiles
    )
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  const selectAllFiles = () => {
    if (!selectedDossier) return
    if (selectedFiles.size === selectedDossier.files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(selectedDossier.files.map(f => f.id)))
    }
  }

  // Breadcrumb
  const breadcrumb = [
    { label: "Directions", onClick: onBack },
    { label: direction.name, onClick: () => { setSelectedDossier(null) } },
    ...(selectedAgence ? [{ label: selectedAgence.name, onClick: () => { setSelectedDossier(null) } }] : []),
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setAgencePanelOpen(true)}
            >
              <Building2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setArmoirePanelOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {(!direction.agences || direction.agences.length === 0) ? (
            <div className="space-y-4 px-4 py-6">
              <p className="text-xs text-muted-foreground">Aucune agence definie pour cette direction.</p>
              <Button className="w-full h-9 text-sm" onClick={() => setAgencePanelOpen(true)}>
                Ajouter une agence
              </Button>
            </div>
          ) : (
            <>
              <div className="px-4 pb-3 border-b border-border">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">Agences</p>
                {direction.agences.map(ag => {
                  const isActive = selectedAgence?.id === ag.id
                  return (
                    <button
                      key={ag.id}
                      onClick={() => handleSelectAgence(ag)}
                      className={cn(
                        "w-full text-left rounded px-3 py-2 mb-2 transition-colors text-sm",
                        isActive
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="truncate">{ag.name}</p>
                          {ag.location && <p className="text-[11px] text-muted-foreground">{ag.location}</p>}
                        </div>
                        <span className="text-[11px] text-muted-foreground">{ag.armoires.length}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">Armoires</p>
                {selectedAgence && selectedAgence.armoires.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucune armoire pour cette agence.</p>
                ) : (
                  selectedAgence?.armoires.map(arm => {
                    const isActive = selectedArmoire?.id === arm.id
                    const IconComp = getIconComponent(arm.icon || "archive")
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
                          : <IconComp className="h-4 w-4 flex-shrink-0" />
                        }
                        <span className="flex-1 truncate">{arm.name}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-8 gap-1.5 text-xs rounded">
                    <Plus className="h-3.5 w-3.5" />
                    Nouveau
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDossierPanelOpen(true)}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Nouveau Dossier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setImportPanelOpen(true)}>
                    <FolderUp className="h-4 w-4 mr-2" />
                    Importer un dossier
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {selectedDossier && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {selectedFiles.size > 0 && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-xs text-muted-foreground">{selectedFiles.size} selectionne(s)</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Download className="h-3 w-3" />
                    Telecharger
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                    Supprimer
                  </Button>
                </div>
              )}
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
              <Button className="h-8 gap-1.5 text-xs rounded" onClick={() => setImportPanelOpen(true)}>
                <FilePlus className="h-3.5 w-3.5" />
                Importer
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
              onFileOpen={setSelectedFile}
              selectedFiles={selectedFiles}
              onToggleSelect={toggleFileSelection}
              onSelectAll={selectAllFiles}
            />
          )}
        </div>
      </div>

      {/* Slide panels */}
      <AgencePanel
        open={agencePanelOpen}
        onClose={() => setAgencePanelOpen(false)}
        onSave={data => onAddAgence(direction.id, data)}
      />
      <ArmoirePanel
        open={armoirePanelOpen}
        onClose={() => setArmoirePanelOpen(false)}
        onSave={data => onAddArmoire(direction.id, selectedAgence?.id ?? null, data)}
      />
      <DossierPanel
        open={dossierPanelOpen}
        onClose={() => setDossierPanelOpen(false)}
        onSave={name => selectedArmoire && onAddDossier(direction.id, selectedArmoire.id, name)}
      />
      <ImportFilesPanel
        open={importPanelOpen}
        onClose={() => setImportPanelOpen(false)}
        onImport={handleImportFiles}
      />

      {selectedFile && selectedDossier && selectedArmoire && (
        <DocumentDetailPanel
          file={selectedFile}
          context={{
            direction: direction.name,
            armoire: selectedArmoire.name,
            dossier: selectedDossier.name,
          }}
          onClose={() => setSelectedFile(null)}
        />
      )}
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
  onFileOpen,
  selectedFiles,
  onToggleSelect,
  onSelectAll,
}: {
  dossier: Dossier
  search: string
  view: "list" | "grid"
  onFileOpen: (file: DocFile) => void
  selectedFiles: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
}) {
  const filtered = dossier.files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  const allSelected = filtered.length > 0 && selectedFiles.size === filtered.length

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
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">
            Fichiers ({filtered.length})
          </p>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={onSelectAll}>
            {allSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            {allSelected ? "Deselectioner tout" : "Tout selectionner"}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(file => {
            const isSelected = selectedFiles.has(file.id)
            return (
              <div
                key={file.id}
                className={cn(
                  "group relative border rounded bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                {/* Checkbox */}
                <button
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id) }}
                >
                  {isSelected
                    ? <CheckSquare className="h-4 w-4 text-primary" />
                    : <Square className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  }
                </button>
                <div onClick={() => onFileOpen(file)}>
                  <div className="flex items-center justify-center h-16 mb-3 bg-muted/50 rounded">
                    <FileTypeIcon type={file.type} />
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{file.size} - {file.date}</p>
                </div>
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  {/* <Button variant="outline" size="icon" className="h-6 w-6 rounded">
                    <Eye className="h-3 w-3" />
                  </Button> */}
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded text-red-500 hover:text-red-600 border-red-200">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
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
        <div className="grid grid-cols-[32px_1fr_100px_120px_100px] gap-4 px-4 py-2.5 bg-muted/50 border-b border-border">
          <button onClick={onSelectAll} className="flex items-center justify-center">
            {allSelected
              ? <CheckSquare className="h-4 w-4 text-primary" />
              : <Square className="h-4 w-4 text-muted-foreground" />
            }
          </button>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Fichier</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Taille</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Date</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide"></span>
        </div>
        {filtered.map((file, i) => {
          const isSelected = selectedFiles.has(file.id)
          return (
            <div
              key={file.id}
              className={cn(
                "grid grid-cols-[32px_1fr_100px_120px_100px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer group",
                i < filtered.length - 1 && "border-b border-border",
                isSelected && "bg-primary/5"
              )}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id) }}
                className="flex items-center justify-center"
              >
                {isSelected
                  ? <CheckSquare className="h-4 w-4 text-primary" />
                  : <Square className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                }
              </button>
              <div className="flex items-center gap-2.5 min-w-0" onClick={() => onFileOpen(file)}>
                <FileTypeIcon type={file.type} />
                <span className="text-sm text-foreground truncate">{file.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{file.size}</span>
              <span className="text-sm text-muted-foreground">{file.date}</span>
              <div
                className="flex items-center gap-1 justify-end"
                onClick={e => e.stopPropagation()}
              >
                <Button variant="ghost" size="icon" onClick={() => onFileOpen(file)} className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

type ViewState =
  | { type: "overview"; direction: Direction }
  | { type: "armoire"; direction: Direction; agence: Agence; armoire: Armoire }

export function DirectionView() {
  const searchParams = useSearchParams()
  const [directions, setDirections] = useState<Direction[]>([])
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
  const [viewState, setViewState] = useState<ViewState | null>(null)
  const [createPanelOpen, setCreatePanelOpen] = useState(false)

  useEffect(() => {
    setDirections(store.getDirections())
    return store.subscribe(() => {
      const dirs = store.getDirections()
      setDirections(dirs)
      // Refresh selected direction if it changed
      if (selectedDirection) {
        const updated = dirs.find(d => d.id === selectedDirection.id)
        if (updated) {
          setSelectedDirection(updated)
          // Also refresh view state
          if (viewState) {
            if (viewState.type === "overview") {
              setViewState({ type: "overview", direction: updated })
            } else if (viewState.type === "armoire") {
              const agence = updated.agences.find(ag => ag.id === viewState.agence.id) ||
                (updated.armoires.length > 0 ? {
                  id: `ag-${updated.id}-default`,
                  name: "Agence Principale",
                  location: "Siege",
                  description: "Agence principale",
                  armoires: updated.armoires,
                } : null)
              if (agence) {
                const armoire = agence.armoires.find(a => a.id === viewState.armoire.id)
                if (armoire) {
                  setViewState({ type: "armoire", direction: updated, agence, armoire })
                }
              }
            }
          }
        }
      }
    })
  }, [selectedDirection, viewState])

  // Handle query parameters to auto-open direction
  useEffect(() => {
    const directionParam = searchParams.get('direction')
    if (directionParam && directions.length > 0) {
      const direction = directions.find(d => d.name.toLowerCase().includes(directionParam.toLowerCase()))
      if (direction && !selectedDirection) {
        setSelectedDirection(direction)
        setViewState({ type: "overview", direction })
      }
    }
  }, [searchParams, directions, selectedDirection])

  // Auto-select first direction if none selected
  useEffect(() => {
    if (directions.length > 0 && !selectedDirection) {
      setSelectedDirection(directions[0])
      setViewState({ type: "overview", direction: directions[0] })
    }
  }, [directions, selectedDirection])

  const handleCreate = (data: { name: string; description: string; directeur: string }) => {
    store.addDirection(data.name)
    const dirs = store.getDirections()
    const newDir = dirs.find(d => d.name === data.name)
    if (newDir) {
      if (data.description) {
        store.updateDirection(newDir.id, { description: data.description })
      }
      setSelectedDirection(newDir)
      setViewState({ type: "overview", direction: newDir })
    }
  }

  const handleEdit = (dir: Direction, data: { name: string; description: string; directeur: string }) => {
    store.updateDirection(dir.id, { name: data.name, description: data.description })
  }

  const handleAddAgence = (dirId: string, data: { name: string; location?: string; description?: string }) => {
    store.addAgence(dirId, data)
  }

  const handleAddArmoire = (dirId: string, agenceId: string | null, data: { name: string; icon: string; admins: string[] }) => {
    store.addArmoire(dirId, data.name, agenceId || undefined)
  }

  const handleAddDossier = (dirId: string, armoireId: string, name: string) => {
    store.addDossier(dirId, armoireId, name)
  }

  const handleSelectDirection = (dir: Direction) => {
    setSelectedDirection(dir)
    setViewState({ type: "overview", direction: dir })
  }

  const handleOpenArmoire = (agence: Agence, armoire: Armoire) => {
    if (selectedDirection) {
      setViewState({ type: "armoire", direction: selectedDirection, agence, armoire })
    }
  }

  const handleBackToList = () => {
    setSelectedDirection(null)
    setViewState(null)
  }

  const handleBackToOverview = () => {
    if (selectedDirection) {
      setViewState({ type: "overview", direction: selectedDirection })
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left sidebar: Directions list */}
      <DirectionListSidebar
        directions={directions}
        selectedDirection={selectedDirection}
        onSelectDirection={handleSelectDirection}
        onCreateDirection={() => setCreatePanelOpen(true)}
      />

      {/* Right content area */}
      {viewState?.type === "overview" && selectedDirection && (
        <DirectionOverview
          direction={selectedDirection}
          onBack={handleBackToList}
          onAddAgence={handleAddAgence}
          onAddArmoire={handleAddArmoire}
          onOpenArmoire={handleOpenArmoire}
          onEditDirection={handleEdit}
        />
      )}

      {viewState?.type === "armoire" && selectedDirection && (
        <DirectionDetail
          direction={selectedDirection}
          selectedAgence={viewState.agence}
          selectedArmoire={viewState.armoire}
          onBack={handleBackToList}
          onBackToOverview={handleBackToOverview}
          onAddDossier={handleAddDossier}
        />
      )}

      {!viewState && (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">Selectionnez une direction</p>
          </div>
        </div>
      )}

      {/* Create direction panel */}
      <DirectionPanel
        open={createPanelOpen}
        onClose={() => setCreatePanelOpen(false)}
        onSave={handleCreate}
      />
    </div>
  )
}
