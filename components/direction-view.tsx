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
  FolderPlus, FilePlus, FolderUp, CheckSquare, Square,
  MapPin, ScanLine, Camera,
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
  return direction.armoires.reduce((a, arm) =>
    a + arm.dossiers.reduce((b, dos) => b + dos.files.length, 0), 0)
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

// ─── Agence Create/Edit Panel ─────────────────────────────────────────────────

function AgencePanel({
  open,
  onClose,
  agence,
  onSave,
}: {
  open: boolean
  onClose: () => void
  agence?: Agence | null
  onSave: (data: { name: string; ville: string; quartier: string; description: string; responsable: string }) => void
}) {
  const [name, setName] = useState(agence?.name ?? "")
  const [ville, setVille] = useState(agence?.ville ?? "")
  const [quartier, setQuartier] = useState(agence?.quartier ?? "")
  const [description, setDescription] = useState(agence?.description ?? "")
  const [responsable, setResponsable] = useState(agence?.responsable ?? "")

  useEffect(() => {
    if (open) {
      setName(agence?.name ?? "")
      setVille(agence?.ville ?? "")
      setQuartier(agence?.quartier ?? "")
      setDescription(agence?.description ?? "")
      setResponsable(agence?.responsable ?? "")
    }
  }, [open, agence])

  const handleSave = () => {
    if (!name.trim() || !ville.trim()) return
    onSave({ name: name.trim(), ville: ville.trim(), quartier: quartier.trim(), description: description.trim(), responsable: responsable.trim() })
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
              placeholder="Ex: Agence Plateau"
              className="h-9 text-sm rounded"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Ville *</label>
            <Input
              value={ville}
              onChange={e => setVille(e.target.value)}
              placeholder="Ex: Abidjan"
              className="h-9 text-sm rounded"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Quartier</label>
            <Input
              value={quartier}
              onChange={e => setQuartier(e.target.value)}
              placeholder="Ex: Cocody, Marcory..."
              className="h-9 text-sm rounded"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Responsable</label>
            <Input
              value={responsable}
              onChange={e => setResponsable(e.target.value)}
              placeholder="Nom du responsable"
              className="h-9 text-sm rounded"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description de l'agence..."
              className="text-sm rounded resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1 h-9 text-sm rounded" onClick={handleSave} disabled={!name.trim() || !ville.trim()}>
            {agence ? "Sauvegarder" : "Creer"}
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Import Files Panel ───────────────────────────────────────────────────────

function ImportFilesPanel({
  open,
  onClose,
  onImport,
}: {
  open: boolean
  onClose: () => void
  onImport: (files: File[]) => void
}) {
  const [tab, setTab] = useState<"upload" | "scan">("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "done">("idle")
  const [scannedPages, setScannedPages] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setFiles([])
      setTab("upload")
      setScanStatus("idle")
      setScannedPages(0)
    }
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
    setFiles(prev => [...prev, ...droppedFiles])
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      setFiles(prev => [...prev, ...Array.from(selectedFiles)])
    }
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

  const handleStartScan = () => {
    setScanStatus("scanning")
    setScannedPages(0)
    // Simulate scanning progress
    let count = 0
    const interval = setInterval(() => {
      count++
      setScannedPages(count)
      if (count >= 3) {
        clearInterval(interval)
        setScanStatus("done")
      }
    }, 1200)
  }

  const handleImportScan = () => {
    // Create a mock scanned file
    const blob = new Blob(["scanned document content"], { type: "application/pdf" })
    const fileName = `Scan_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}_${scannedPages}p.pdf`
    const scannedFile = new window.File([blob], fileName, { type: "application/pdf" })
    onImport([scannedFile])
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

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("upload")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === "upload"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="h-4 w-4" />
            Telecharger
          </button>
          <button
            onClick={() => setTab("scan")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === "scan"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ScanLine className="h-4 w-4" />
            Scanner
          </button>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          {tab === "upload" ? (
            <>
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

              {/* Files list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{files.length} fichier(s) selectionne(s)</p>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
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
            </>
          ) : (
            /* Scanner tab */
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-6 flex flex-col items-center gap-4 bg-muted/20">
                <div className={cn(
                  "h-20 w-20 rounded-2xl flex items-center justify-center transition-all",
                  scanStatus === "scanning" ? "bg-primary/10 animate-pulse" : "bg-muted"
                )}>
                  {scanStatus === "scanning"
                    ? <ScanLine className="h-10 w-10 text-primary" />
                    : scanStatus === "done"
                      ? <Check className="h-10 w-10 text-emerald-600" />
                      : <Camera className="h-10 w-10 text-muted-foreground" />
                  }
                </div>
                <div className="text-center">
                  {scanStatus === "idle" && (
                    <>
                      <p className="text-sm font-medium text-foreground">Pret a scanner</p>
                      <p className="text-xs text-muted-foreground mt-1">Placez le document dans le scanner puis lancez la numerisation</p>
                    </>
                  )}
                  {scanStatus === "scanning" && (
                    <>
                      <p className="text-sm font-medium text-foreground">Numerisation en cours...</p>
                      <p className="text-xs text-muted-foreground mt-1">{scannedPages} page{scannedPages > 1 ? "s" : ""} numerisee{scannedPages > 1 ? "s" : ""}</p>
                    </>
                  )}
                  {scanStatus === "done" && (
                    <>
                      <p className="text-sm font-medium text-foreground text-emerald-600">Numerisation terminee</p>
                      <p className="text-xs text-muted-foreground mt-1">{scannedPages} page{scannedPages > 1 ? "s" : ""} prete{scannedPages > 1 ? "s" : ""} a l&apos;import</p>
                    </>
                  )}
                </div>
                {scanStatus === "idle" && (
                  <Button className="gap-2 rounded" onClick={handleStartScan}>
                    <ScanLine className="h-4 w-4" />
                    Lancer la numerisation
                  </Button>
                )}
                {scanStatus === "scanning" && (
                  <Button variant="outline" className="gap-2 rounded" onClick={() => setScanStatus("idle")}>
                    <X className="h-4 w-4" />
                    Annuler
                  </Button>
                )}
                {scanStatus === "done" && (
                  <Button variant="outline" className="gap-2 rounded" onClick={() => { setScanStatus("idle"); setScannedPages(0) }}>
                    Nouvelle numerisation
                  </Button>
                )}
              </div>

              {/* Scanner settings */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Parametres</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded border border-border bg-muted/20">
                    <p className="text-muted-foreground">Resolution</p>
                    <p className="font-medium text-foreground mt-0.5">300 DPI</p>
                  </div>
                  <div className="p-3 rounded border border-border bg-muted/20">
                    <p className="text-muted-foreground">Format</p>
                    <p className="font-medium text-foreground mt-0.5">PDF / A4</p>
                  </div>
                  <div className="p-3 rounded border border-border bg-muted/20">
                    <p className="text-muted-foreground">Couleur</p>
                    <p className="font-medium text-foreground mt-0.5">Noir & Blanc</p>
                  </div>
                  <div className="p-3 rounded border border-border bg-muted/20">
                    <p className="text-muted-foreground">OCR</p>
                    <p className="font-medium text-foreground mt-0.5">Actif</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={onClose}>
            Annuler
          </Button>
          {tab === "upload" ? (
            <Button className="flex-1 h-9 text-sm rounded" onClick={handleImport} disabled={files.length === 0}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Importer {files.length > 0 && `(${files.length})`}
            </Button>
          ) : (
            <Button className="flex-1 h-9 text-sm rounded" onClick={handleImportScan} disabled={scanStatus !== "done"}>
              <ScanLine className="h-3.5 w-3.5 mr-1.5" />
              Importer le scan
            </Button>
          )}
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
  onAddAgence,
}: {
  directions: Direction[]
  onOpen: (d: Direction) => void
  onCreate: (data: { name: string; description: string; directeur: string }) => void
  onEdit: (d: Direction, data: { name: string; description: string; directeur: string }) => void
  onDelete: (id: string) => void
  onAddAgence: (d: Direction) => void
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Direction | null>(null)
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

              {/* Stats row */}
              <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                <span>{dir.armoires.length} armoire{dir.armoires.length !== 1 ? "s" : ""}</span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {(dir.agences ?? []).length} agence{(dir.agences ?? []).length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{dir.date}</span>
                <button
                  onClick={e => { e.stopPropagation(); onAddAgence(dir) }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Agence
                </button>
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Armoires</th>
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
                    <span className="text-muted-foreground">{dir.armoires.length}</span>
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

// ─── Armoire + Dossier + Files view ──────────────────────────────────────────

function DirectionDetail({
  direction,
  onBack,
  onAddArmoire,
  onAddDossier,
  onAddAgence,
  onDeleteAgence,
}: {
  direction: Direction
  onBack: () => void
  onAddArmoire: (dirId: string, data: { name: string; icon: string; admins: string[] }) => void
  onAddDossier: (dirId: string, armoireId: string, name: string) => void
  onAddAgence: (dirId: string, data: { name: string; ville: string; quartier: string; description: string; responsable: string }) => void
  onDeleteAgence: (dirId: string, agenceId: string) => void
}) {
  const searchParams = useSearchParams()
  const [selectedAgence, setSelectedAgence] = useState<Agence | null>(null)
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null)
  const [selectedFile, setSelectedFile] = useState<DocFile | null>(null)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [armoirePanelOpen, setArmoirePanelOpen] = useState(false)
  const [dossierPanelOpen, setDossierPanelOpen] = useState(false)
  const [importPanelOpen, setImportPanelOpen] = useState(false)
  const [agencePanelOpen, setAgencePanelOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

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
    // Armoires are now displayed as cards only
  }

  const handleImportFiles = (_files: File[]) => {
    // Files would be uploaded to the server in a real implementation
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left: Agences sidebar */}
      <div className="w-64 border-r border-border flex flex-col flex-shrink-0 bg-card">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour
            </button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setAgencePanelOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Agences</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {(direction.agences ?? []).length === 0 ? (
            <div className="flex flex-col items-center mt-8 px-4 gap-3">
              <MapPin className="h-6 w-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground text-center">Aucune agence</p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 w-full"
                onClick={() => setAgencePanelOpen(true)}
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </Button>
            </div>
          ) : (
            (direction.agences ?? []).map(agence => (
              <div key={agence.id} className="group relative">
                <button
                  onClick={() => setSelectedAgence(agence)}
                  className={cn(
                    "w-full flex items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    selectedAgence?.id === agence.id ? "bg-muted" : ""
                  )}
                >
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{agence.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {agence.quartier ? `${agence.quartier}, ` : ""}{agence.ville}
                    </p>
                    {agence.responsable && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{agence.responsable}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                    onClick={e => { e.stopPropagation(); onDeleteAgence(direction.id, agence.id) }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Armoires grid */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{direction.name}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {direction.armoires.length} armoire{direction.armoires.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 text-sm rounded"
              onClick={() => setImportPanelOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Importer
            </Button>
            <Button
              className="gap-2 h-9 text-sm rounded"
              onClick={() => setArmoirePanelOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Armoire
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setArmoirePanelOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Nouvelle armoire
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportPanelOpen(true)}>
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Importer des fichiers
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Exporter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Armoires Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {direction.armoires.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Archive className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-muted-foreground text-center">Aucune armoire creee</p>
              <Button onClick={() => setArmoirePanelOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Creer la premiere armoire
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {direction.armoires.map(armoire => {
                const IconComp = getIconComponent(armoire.icon || "archive")
                const dossierCount = armoire.dossiers.length
                const fileCount = armoire.dossiers.reduce((sum, dos) => sum + dos.files.length, 0)
                
                return (
                  <div
                    key={armoire.id}
                    className="group relative bg-card border border-border rounded-lg p-4 hover:border-foreground/30 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <IconComp className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">{armoire.name}</h3>
                          <p className="text-[10px] text-muted-foreground">{armoire.date}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Editer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="font-semibold text-foreground">{dossierCount}</p>
                        <p className="text-[9px] text-muted-foreground">
                          Dossier{dossierCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="font-semibold text-foreground">{fileCount}</p>
                        <p className="text-[9px] text-muted-foreground">
                          Fichier{fileCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="font-semibold text-foreground text-xs">{armoire.dossiers.reduce((sum, dos) => sum + dos.files.length, 0) > 0 ? "100%" : "0%"}</p>
                        <p className="text-[9px] text-muted-foreground">Complet</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Slide panels */}
      <ArmoirePanel
        open={armoirePanelOpen}
        onClose={() => setArmoirePanelOpen(false)}
        onSave={data => onAddArmoire(direction.id, data)}
      />
      <DossierPanel
        open={dossierPanelOpen}
        onClose={() => setDossierPanelOpen(false)}
        onSave={name => selectedAgence ? onAddDossier(direction.id, selectedAgence.id, name) : null}
      />
      <AgencePanel
        open={agencePanelOpen}
        onClose={() => setAgencePanelOpen(false)}
        onSave={data => onAddAgence(direction.id, data)}
      />
      <ImportFilesPanel
        open={importPanelOpen}
        onClose={() => setImportPanelOpen(false)}
        onImport={handleImportFiles}
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

  const handleCreate = (data: { name: string; description: string; directeur: string }) => {
    store.addDirection(data.name)
    // Update with description if store supports it
    const dirs = store.getDirections()
    const newDir = dirs.find(d => d.name === data.name)
    if (newDir && data.description) {
      store.updateDirection(newDir.id, { description: data.description })
    }
  }

  const handleEdit = (dir: Direction, data: { name: string; description: string; directeur: string }) => {
    store.updateDirection(dir.id, { name: data.name, description: data.description })
  }

  const handleDelete = (id: string) => {
    store.deleteDirection(id)
  }

  const handleAddArmoire = (dirId: string, data: { name: string; icon: string; admins: string[] }) => {
    store.addArmoire(dirId, data.name)
  }

  const handleAddDossier = (dirId: string, armoireId: string, name: string) => {
    store.addDossier(dirId, armoireId, name)
  }

  const handleAddAgenceFromGrid = (dir: Direction) => {
    setOpenDirection(dir)
    // Will open the agence panel — handled inside DirectionDetail
  }

  const handleAddAgence = (dirId: string, data: { name: string; ville: string; quartier: string; description: string; responsable: string }) => {
    store.addAgence(dirId, data)
  }

  const handleDeleteAgence = (dirId: string, agenceId: string) => {
    store.deleteAgence(dirId, agenceId)
  }

  if (openDirection) {
    return (
      <DirectionDetail
        direction={openDirection}
        onBack={() => setOpenDirection(null)}
        onAddArmoire={handleAddArmoire}
        onAddDossier={handleAddDossier}
        onAddAgence={handleAddAgence}
        onDeleteAgence={handleDeleteAgence}
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
      onAddAgence={handleAddAgenceFromGrid}
    />
  )
}
