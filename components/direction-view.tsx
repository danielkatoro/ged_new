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
  Eye, Camera, RotateCcw, MapPin,
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
  onCreate: () => void
  onEdit: (d: Direction, data: { name: string; description: string; directeur: string }) => void
  onDelete: (id: string) => void
  onCreateAgence: (directionId: string, data: { name: string; location?: string; description?: string }) => void
}) {
  const [editTarget, setEditTarget] = useState<Direction | null>(null)
  const [agencyTarget, setAgencyTarget] = useState<Direction | null>(null)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = directions.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  )

  const countDocs = (dir: Direction) => {
    return dir.agences.reduce((sum, ag) => sum + ag.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0), 0) +
           dir.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0)
  }

  const countAgences = (dir: Direction) => dir.agences.length || (dir.armoires.length > 0 ? 1 : 0)

  return (
    <div className="p-6 max-w-8xl mx-auto w-full">
      {/* Top bar */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold text-foreground">Directions</span>
        </div>
      </div> */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">{filtered.length} Directions(s)</span>
                  </div>
        <div className="flex items-center gap-2">
          <div className="relative ml-4">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher partout..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 w-64 text-sm bg-muted/30 border-border rounded-lg"
            />
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden ml-2 bg-muted/30 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 rounded-md", view === "grid" && "bg-background shadow-sm")}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 rounded-md", view === "list" && "bg-background shadow-sm")}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button className="h-10 gap-2 text-sm bg-black text-white hover:bg-black/90 rounded-lg" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Nouvelle direction
          </Button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(dir => (
            <div
              key={dir.id}
              onClick={() => onOpen(dir)}
              className="group relative bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-foreground/20 hover:shadow-sm transition-all flex flex-col h-56"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">{dir.name}</span>
                </div>
                {/* Three-dot menu */}
                <div onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground -mt-2 -mr-2"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem onClick={() => setEditTarget(dir)} className="rounded-lg">
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAgencyTarget(dir)} className="rounded-lg">
                        <Building2 className="h-3.5 w-3.5 mr-2" />
                        Nouvelle agence
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive rounded-lg"
                        onClick={() => onDelete(dir.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Description */}
              <div className="flex-1 mt-2">
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {dir.description || "Description lorem"}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm font-medium text-foreground mt-4 pt-4 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{countAgences(dir)} agences</span>
                  <span>{countDocs(dir)} Documents</span>
                </div>
                <div className="flex items-end h-full">
                  <span className="text-muted-foreground text-xs">{dir.members || 8} membres</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Direction</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground hidden md:table-cell">Description</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Agences</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Documents</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground hidden sm:table-cell">Membres</th>
                <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-semibold text-foreground text-base">{dir.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-foreground font-medium truncate max-w-xs block">{dir.description || "Description lorem"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground font-medium">{countAgences(dir)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground font-medium">{countDocs(dir)}</span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-foreground font-medium">{dir.members || 8}</span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => setEditTarget(dir)} className="rounded-lg">Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAgencyTarget(dir)} className="rounded-lg">Nouvelle agence</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg" onClick={() => onDelete(dir.id)}>Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AgencePanel open={!!agencyTarget} onClose={() => setAgencyTarget(null)} onSave={data => { if (agencyTarget) { onCreateAgence(agencyTarget.id, data); setAgencyTarget(null); } }} />
      <DirectionPanel open={!!editTarget} onClose={() => setEditTarget(null)} direction={editTarget} onSave={data => { if (editTarget) { onEdit(editTarget, data); setEditTarget(null); } }} />
    </div>
  )
}

// ─── Agence Sidebar ───────────────────────────────────────────────────────────

function AgenceSidebar({
  direction,
  selectedAgence,
  onSelectAgence,
  onAddAgence,
  onBack,
}: {
  direction: Direction
  selectedAgence: Agence | null
  onSelectAgence: (ag: Agence) => void
  onAddAgence: () => void
  onBack: () => void
}) {
  const [search, setSearch] = useState("")

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

  const filtered = agences.filter(ag =>
    ag.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-80 border-r border-border flex flex-col flex-shrink-0 bg-background h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-bold text-foreground">Agences de {direction.name}</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={onAddAgence}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10 text-sm bg-muted/30 border-border rounded-lg"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.map(ag => {
          const isActive = selectedAgence?.id === ag.id

          return (
            <button
              key={ag.id}
              onClick={() => onSelectAgence(ag)}
              className={cn(
                "w-full flex items-center gap-4 rounded-xl px-4 py-4 mb-2 text-left transition-all border",
                isActive
                  ? "bg-black text-white border-black"
                  : "bg-card border-transparent hover:bg-muted/50 hover:border-border"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                isActive ? "bg-white/20" : "bg-muted"
              )}>
                <Building2 className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold truncate", isActive ? "text-white" : "text-foreground")}>{ag.name}</p>
                {ag.location && (
                  <p className={cn(
                    "text-[11px] mt-0.5 flex items-center gap-1",
                    isActive ? "text-white/70" : "text-muted-foreground"
                  )}>
                    <MapPin className="h-3 w-3" />
                    {ag.location}
                  </p>
                )}
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 flex-shrink-0",
                isActive ? "text-white/50" : "text-muted-foreground"
              )} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Agence Overview ──────────────────────────────────────────────────────────

function AgenceOverview({
  agence,
  direction,
  onAddArmoire,
  onOpenArmoire,
}: {
  agence: Agence
  direction: Direction
  onAddArmoire: (dirId: string, agenceId: string | null, data: { name: string; icon: string; admins: string[] }) => void
  onOpenArmoire: (agence: Agence, armoire: Armoire) => void
}) {
  const [armoirePanelOpen, setArmoirePanelOpen] = useState(false)
  const [importPanelOpen, setImportPanelOpen] = useState(false)

  const countAgenceDocs = (ag: Agence) => ag.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0)
  const countPendingDocs = (ag: Agence) => ag.armoires.reduce((a, arm) => a + arm.dossiers.reduce((b, dos) => b + dos.files.filter(f => f.status === "En validation").length, 0), 0)

  const totalDocs = countAgenceDocs(agence)
  const pendingDocs = countPendingDocs(agence)

  return (
    <div className="flex-1 overflow-y-auto bg-muted/10 h-full">
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Header section inside main content */}
        <div className="flex items-start justify-between gap-4 bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{agence.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-sm font-medium text-muted-foreground">Responsable : {direction.directeur || "Cedric Boka"}</span>
              </div>
            </div>
          </div>
          <Button className="h-10 gap-2 text-sm rounded-lg" variant="outline" onClick={() => setImportPanelOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter un document
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center justify-center">
            <FileText className="h-5 w-5 text-muted-foreground mb-3" />
            <p className="text-3xl font-bold text-foreground">{totalDocs}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">Documents</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center justify-center">
            <Users className="h-5 w-5 text-muted-foreground mb-3" />
            <p className="text-3xl font-bold text-foreground">{direction.members || 8}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">Membres</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center justify-center">
            <Building2 className="h-5 w-5 text-muted-foreground mb-3" />
            <p className="text-3xl font-bold text-foreground">{agence.armoires.length}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">Armoires</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center justify-center">
            <span className="text-orange-500 font-bold text-2xl mb-1">{pendingDocs || 1}</span>
            <p className="text-xs font-medium text-muted-foreground">En validation</p>
          </div>
        </div>

        {/* Armoires Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Armoires</h2>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{agence.armoires.length}</span>
            </div>
            <Button variant="outline" className="h-9 gap-1.5 text-xs rounded-lg" onClick={() => setArmoirePanelOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Ajouter une armoire
            </Button>
          </div>

          {agence.armoires.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <Archive className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-4">Aucune armoire dans cette agence</p>
              <Button onClick={() => setArmoirePanelOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une armoire
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {agence.armoires.map(armoire => {
                const IconComp = getIconComponent(armoire.icon || "archive")
                return (
                  <div
                    key={armoire.id}
                    onClick={() => onOpenArmoire(agence, armoire)}
                    className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-foreground/20 hover:shadow-sm transition-all group h-32"
                  >
                    <IconComp className="h-8 w-8 text-foreground mb-3" />
                    <span className="text-sm font-bold text-foreground text-center truncate w-full">{armoire.name}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ArmoirePanel
        open={armoirePanelOpen}
        onClose={() => setArmoirePanelOpen(false)}
        onSave={data => {
          const realAgenceId = agence.id.startsWith('ag-') && agence.id.includes('-default') ? null : agence.id
          onAddArmoire(direction.id, realAgenceId, data)
          setArmoirePanelOpen(false)
        }}
      />
      <ImportFilesPanel open={importPanelOpen} onClose={() => setImportPanelOpen(false)} onImport={() => {}} />
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

    store.addDocuments(direction.id, selectedArmoire.id, targetDossier.id, pendingFiles)
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
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

  const breadcrumb = [
    { label: "Directions", onClick: onBack },
    { label: direction.name, onClick: onBackToOverview },
    { label: selectedAgence.name, onClick: onBackToOverview },
    { label: selectedArmoire.name, onClick: () => setSelectedDossier(null) },
    ...(selectedDossier ? [{ label: selectedDossier.name, onClick: () => {} }] : []),
  ]

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card gap-4">
        <nav className="flex items-center gap-2 text-sm min-w-0">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              <button
                onClick={crumb.onClick}
                className={cn(
                  "truncate transition-colors",
                  i === breadcrumb.length - 1
                    ? "font-bold text-foreground"
                    : "font-medium text-muted-foreground hover:text-foreground"
                )}
              >
                {crumb.label}
              </button>
            </span>
          ))}
        </nav>

        {!selectedDossier && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-56 text-sm bg-muted/50 border-0 rounded-lg" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-9 gap-2 text-sm rounded-lg">
                  <Plus className="h-4 w-4" />
                  Nouveau
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => setDossierPanelOpen(true)} className="rounded-lg">
                  <FolderPlus className="h-4 w-4 mr-2" /> Nouveau Dossier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportPanelOpen(true)} className="rounded-lg">
                  <FolderUp className="h-4 w-4 mr-2" /> Importer un dossier
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {selectedDossier && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">{selectedFiles.size} selectionne(s)</span>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-lg">
                  <Download className="h-3.5 w-3.5" /> Telecharger
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive rounded-lg">
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                </Button>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-56 text-sm bg-muted/50 border-0 rounded-lg" />
            </div>
            <div className="flex border border-border rounded-lg overflow-hidden bg-muted/30 p-0.5">
              <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-md", view === "list" && "bg-background shadow-sm")} onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-md", view === "grid" && "bg-background shadow-sm")} onClick={() => setView("grid")}><LayoutGrid className="h-4 w-4" /></Button>
            </div>
            <Button className="h-9 gap-1.5 text-sm rounded-lg" onClick={() => setImportPanelOpen(true)}>
              <FilePlus className="h-4 w-4" /> Importer
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
        {!selectedDossier ? (
          <DossierList armoire={selectedArmoire} search={search} onOpen={setSelectedDossier} />
        ) : (
          <FileList dossier={selectedDossier} search={search} view={view} onFileOpen={setSelectedFile} selectedFiles={selectedFiles} onToggleSelect={toggleFileSelection} onSelectAll={selectAllFiles} />
        )}
      </div>

      <DossierPanel open={dossierPanelOpen} onClose={() => setDossierPanelOpen(false)} onSave={name => onAddDossier(direction.id, selectedArmoire.id, name)} />
      <ImportFilesPanel open={importPanelOpen} onClose={() => setImportPanelOpen(false)} onImport={handleImportFiles} />

      {selectedFile && selectedDossier && (
        <DocumentDetailPanel file={selectedFile} context={{ direction: direction.name, armoire: selectedArmoire.name, dossier: selectedDossier.name }} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

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

// ��������� File list ������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������

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


type ViewState =
  | { type: "overview"; direction: Direction; agence: Agence }
  | { type: "armoire"; direction: Direction; agence: Agence; armoire: Armoire }

export function DirectionView() {
  const searchParams = useSearchParams()
  const [directions, setDirections] = useState<Direction[]>([])
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
  const [viewState, setViewState] = useState<ViewState | null>(null)
  const [createPanelOpen, setCreatePanelOpen] = useState(false)
  const [createAgencePanelOpen, setCreateAgencePanelOpen] = useState(false)

  useEffect(() => {
    setDirections(store.getDirections())
    return store.subscribe(() => {
      const dirs = store.getDirections()
      setDirections(dirs)
      if (selectedDirection) {
        const updated = dirs.find(d => d.id === selectedDirection.id)
        if (updated) {
          setSelectedDirection(updated)
          if (viewState) {
            if (viewState.type === "overview") {
              const agence = updated.agences.find(ag => ag.id === viewState.agence.id) ||
                (updated.armoires.length > 0 ? { id: `ag-${updated.id}-default`, name: "Agence Principale", location: "Siege", description: "Agence principale", armoires: updated.armoires } : null)
              if (agence) setViewState({ type: "overview", direction: updated, agence })
            } else if (viewState.type === "armoire") {
              const agence = updated.agences.find(ag => ag.id === viewState.agence.id) ||
                (updated.armoires.length > 0 ? { id: `ag-${updated.id}-default`, name: "Agence Principale", location: "Siege", description: "Agence principale", armoires: updated.armoires } : null)
              if (agence) {
                const armoire = agence.armoires.find(a => a.id === viewState.armoire.id)
                if (armoire) setViewState({ type: "armoire", direction: updated, agence, armoire })
              }
            }
          }
        }
      }
    })
  }, [selectedDirection, viewState])

  useEffect(() => {
    const directionParam = searchParams.get('direction')
    if (directionParam && directions.length > 0 && !selectedDirection) {
      const direction = directions.find(d => d.name.toLowerCase().includes(directionParam.toLowerCase()))
      if (direction) {
        setSelectedDirection(direction)
        const agence = direction.agences[0] || (direction.armoires.length > 0 ? { id: `ag-${direction.id}-default`, name: "Agence Principale", location: "Siege", description: "Agence principale", armoires: direction.armoires } : null)
        if (agence) setViewState({ type: "overview", direction, agence })
      }
    }
  }, [searchParams, directions, selectedDirection])

  const handleCreate = (data: { name: string; description: string; directeur: string }) => {
    store.addDirection(data.name)
    const dirs = store.getDirections()
    const newDir = dirs.find(d => d.name === data.name)
    if (newDir) {
      if (data.description || data.directeur) {
        store.updateDirection(newDir.id, { description: data.description, directeur: data.directeur } as any)
      }
      setSelectedDirection(newDir)
      const agence = newDir.agences[0] || (newDir.armoires.length > 0 ? { id: `ag-${newDir.id}-default`, name: "Agence Principale", location: "Siege", description: "Agence principale", armoires: newDir.armoires } : null)
      if (agence) setViewState({ type: "overview", direction: newDir, agence })
    }
    setCreatePanelOpen(false)
  }

  const handleEdit = (dir: Direction, data: { name: string; description: string; directeur: string }) => {
    store.updateDirection(dir.id, { name: data.name, description: data.description, directeur: data.directeur } as any)
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
    const agence = dir.agences[0] || (dir.armoires.length > 0 ? { id: `ag-${dir.id}-default`, name: "Agence Principale", location: "Siege", description: "Agence principale", armoires: dir.armoires } : null)
    if (agence) {
      setViewState({ type: "overview", direction: dir, agence })
    } else {
      // If no agences at all, create a dummy state so they can add an agence
      const dummyAgence: Agence = { id: `ag-${dir.id}-default`, name: "Nouvelle Agence", location: "", description: "", armoires: [] }
      setViewState({ type: "overview", direction: dir, agence: dummyAgence })
    }
  }

  const handleSelectAgence = (agence: Agence) => {
    if (selectedDirection) {
      setViewState({ type: "overview", direction: selectedDirection, agence })
    }
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
    if (selectedDirection && viewState) {
      setViewState({ type: "overview", direction: selectedDirection, agence: viewState.agence })
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] bg-muted/10">
      {/* Sidebar for Agences shown only when a Direction is selected */}
      {viewState && selectedDirection && (
        <AgenceSidebar
          direction={selectedDirection}
          selectedAgence={viewState.agence}
          onSelectAgence={handleSelectAgence}
          onAddAgence={() => setCreateAgencePanelOpen(true)}
          onBack={handleBackToList}
        />
      )}

      {/* Main content area */}
      {!viewState ? (
        <div className="flex-1 overflow-y-auto">
          <DirectionGrid
            directions={directions}
            onOpen={handleSelectDirection}
            onCreate={() => setCreatePanelOpen(true)}
            onEdit={handleEdit}
            onDelete={store.deleteDirection.bind(store)}
            onCreateAgence={handleAddAgence}
          />
        </div>
      ) : viewState.type === "overview" && selectedDirection ? (
        <AgenceOverview
          agence={viewState.agence}
          direction={selectedDirection}
          onAddArmoire={handleAddArmoire}
          onOpenArmoire={handleOpenArmoire}
        />
      ) : viewState.type === "armoire" && selectedDirection ? (
        <DirectionDetail
          direction={selectedDirection}
          selectedAgence={viewState.agence}
          selectedArmoire={viewState.armoire}
          onBack={handleBackToList}
          onBackToOverview={handleBackToOverview}
          onAddDossier={handleAddDossier}
        />
      ) : null}

      {/* Panels */}
      <DirectionPanel
        open={createPanelOpen}
        onClose={() => setCreatePanelOpen(false)}
        onSave={handleCreate}
      />
      {selectedDirection && (
        <AgencePanel
          open={createAgencePanelOpen}
          onClose={() => setCreateAgencePanelOpen(false)}
          onSave={data => handleAddAgence(selectedDirection.id, data)}
        />
      )}
    </div>
  )
}
