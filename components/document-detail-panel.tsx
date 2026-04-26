"use client"

import React, { useState } from "react"
import {
  X, FileText, File, FileSpreadsheet, Image,
  Download, Pencil, Send, Stamp, Trash2, ExternalLink,
  CheckCircle2, Clock, AlertCircle, XCircle,
  Building2, Folder, Calendar, User, Hash, Tag,
  GitBranch, Mail, History, Activity, Info,
  ChevronRight, Shield, Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type DocFile } from "@/lib/store"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentDetailPanelProps {
  file: DocFile
  context: {
    direction: string
    armoire: string
    dossier: string
  }
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig = {
  "Approuve":      { label: "Approuvé",      icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" },
  "En validation": { label: "En validation", icon: Clock,        cls: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800" },
  "En attente":    { label: "En attente",    icon: AlertCircle,  cls: "text-muted-foreground bg-muted border-border" },
  "Rejete":        { label: "Rejeté",        icon: XCircle,      cls: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" },
} as const

const typeConfig: Record<DocFile["type"], { label: string; icon: React.ElementType; cls: string }> = {
  pdf:  { label: "PDF",  icon: FileText,        cls: "text-red-500 bg-red-50 dark:bg-red-950" },
  docx: { label: "DOCX", icon: File,            cls: "text-blue-500 bg-blue-50 dark:bg-blue-950" },
  xlsx: { label: "XLSX", icon: FileSpreadsheet,  cls: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950" },
  img:  { label: "IMG",  icon: Image,            cls: "text-purple-500 bg-purple-50 dark:bg-purple-950" },
}

const TABS = [
  { id: "info",      label: "Informations", icon: Info },
  { id: "versions",  label: "Versions",     icon: History },
  { id: "workflow",  label: "Workflow",     icon: GitBranch },
  { id: "activity",  label: "Activités",    icon: Activity },
] as const

type TabId = typeof TABS[number]["id"]

// ─── Tab: Informations ────────────────────────────────────────────────────────

function TabInfo({ file, context }: { file: DocFile; context: DocumentDetailPanelProps["context"] }) {
  const fields = [
    { icon: Building2, label: "Direction",    value: context.direction },
    { icon: Folder,    label: "Armoire",      value: context.armoire },
    { icon: Folder,    label: "Dossier",      value: context.dossier },
    { icon: Calendar,  label: "Date",         value: file.date },
    { icon: User,      label: "Auteur",       value: file.author },
    { icon: Hash,      label: "Confiance OCR",value: `${file.confidence}%` },
    { icon: Hash,      label: "Taille",       value: file.size },
  ]

  return (
    <div className="space-y-5">
      {/* Metadata grid */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Métadonnées</p>
        <div className="grid grid-cols-2 gap-2">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-2.5 bg-muted/40 rounded border border-border/50">
              <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
              <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {file.description && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</p>
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded p-3 border border-border/50">
            {file.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {file.tags.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {file.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground">
                <Tag className="h-2.5 w-2.5" /> {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Source</p>
        <div className="flex flex-wrap gap-1.5">
          {file.source === "email" && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground">
              <Mail className="h-2.5 w-2.5" /> Email
            </span>
          )}
          {file.source === "workflow" && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-violet-50 border border-violet-200 text-violet-600 dark:bg-violet-950 dark:border-violet-800">
              <GitBranch className="h-2.5 w-2.5" /> Workflow
            </span>
          )}
          {file.source === "upload" && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground">
              <User className="h-2.5 w-2.5" /> Upload manuel
            </span>
          )}
          {file.source === "scan" && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground">
              <Hash className="h-2.5 w-2.5" /> Scan
            </span>
          )}
          {file.linkedWorkflow && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-violet-50 border border-violet-200 text-violet-600 dark:bg-violet-950 dark:border-violet-800">
              <GitBranch className="h-2.5 w-2.5" /> {file.linkedWorkflow}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Versions ────────────────────────────────────────────────────────────

function TabVersions({ file }: { file: DocFile }) {
  const versions = file.versions.length > 0
    ? file.versions
    : [
        { version: 1, date: file.date, author: file.author },
      ]

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {versions.length} version{versions.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-2">
        {[...versions].reverse().map((v, i) => (
          <div
            key={v.version}
            className={cn(
              "flex items-center gap-3 p-3 rounded border transition-colors",
              i === 0
                ? "bg-muted/60 border-border"
                : "bg-card border-border hover:bg-muted/30"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold",
              i === 0 ? "bg-foreground text-background" : "bg-muted text-foreground"
            )}>
              v{v.version}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">Version {v.version}</span>
                {i === 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground text-background font-medium">
                    Actuelle
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                <span>{v.author}</span>
                <span>·</span>
                <span>{v.date}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0"
              onClick={() => toast.success(`Version ${v.version} téléchargée`)}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Workflow ────────────────────────────────────────────────────────────

function TabWorkflow({ file }: { file: DocFile }) {
  const steps = [
    { label: "Soumission",   user: file.author,       date: file.date,          done: true },
    { label: "Vérification", user: "Chef de service",  date: "",                 done: file.status !== "En attente" },
    { label: "Validation",   user: "Directeur",        date: "",                 done: file.status === "Approuve" },
    { label: "Archivage",    user: "Système",          date: "",                 done: file.status === "Approuve" },
  ]

  return (
    <div className="space-y-4">
      {file.linkedWorkflow && (
        <div className="flex items-center gap-2 p-3 rounded border border-border bg-muted/40">
          <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs font-medium text-foreground">{file.linkedWorkflow}</span>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 relative">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 bg-background z-10",
                step.done
                  ? "border-emerald-500 text-emerald-500"
                  : i === steps.findIndex(s => !s.done)
                  ? "border-amber-400 text-amber-400"
                  : "border-border text-muted-foreground"
              )}>
                {step.done
                  ? <CheckCircle2 className="h-4 w-4" />
                  : i === steps.findIndex(s => !s.done)
                  ? <Clock className="h-4 w-4" />
                  : <div className="h-2 w-2 rounded-full bg-border" />
                }
              </div>
              <div className="flex-1 pb-1 pt-1">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {step.user}{step.date ? ` · ${step.date}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Activités ───────────────────────────────────────────────────────────

function TabActivity({ file }: { file: DocFile }) {
  const activities = file.activity.length > 0
    ? file.activity
    : [
        { action: "Document uploadé",    user: file.author,       date: file.date, ip: "192.168.1.1" },
        { action: "Document consulté",   user: "Marie Dupont",    date: file.date },
        { action: "Envoyé en validation",user: file.author,       date: file.date, ip: "192.168.1.1" },
      ]

  const actionIcon: Record<string, React.ElementType> = {
    "uploadé": Download,
    "consulté": Eye,
    "validat": CheckCircle2,
    "rejeté": XCircle,
    "modifié": Pencil,
    "tampon": Stamp,
  }

  const getIcon = (action: string) => {
    const key = Object.keys(actionIcon).find(k => action.toLowerCase().includes(k))
    return key ? actionIcon[key] : Activity
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Journal des activités
      </p>
      <div className="space-y-0 rounded border border-border overflow-hidden divide-y divide-border">
        {activities.map((a, i) => {
          const Icon = getIcon(a.action)
          return (
            <div key={i} className="flex items-start gap-3 px-3 py-3 bg-card hover:bg-muted/30 transition-colors">
              <div className="h-6 w-6 rounded bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{a.action}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                  <span>{a.user}</span>
                  <span>·</span>
                  <span>{a.date}</span>
                  {a.ip && <><span>·</span><span className="font-mono">{a.ip}</span></>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocumentDetailPanel({ file, context, onClose }: DocumentDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("info")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const status = statusConfig[file.status]
  const StatusIcon = status.icon
  const typeInfo = typeConfig[file.type]
  const TypeIcon = typeInfo.icon

  const actions = [
    {
      label: "Ouvrir le fichier",
      icon: ExternalLink,
      variant: "default" as const,
      onClick: () => toast.info("Ouverture du fichier..."),
    },
    {
      label: "Télécharger",
      icon: Download,
      variant: "outline" as const,
      onClick: () => toast.success(`${file.name} téléchargé`),
    },
    {
      label: "Modifier",
      icon: Pencil,
      variant: "outline" as const,
      onClick: () => toast.info("Ouverture de l'éditeur..."),
    },
    {
      label: "Envoyer pour validation",
      icon: Send,
      variant: "outline" as const,
      onClick: () => toast.success("Document envoyé pour validation"),
    },
    {
      label: "Apposer un tampon",
      icon: Stamp,
      variant: "outline" as const,
      onClick: () => toast.info("Sélection du tampon..."),
    },
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Panel — wider than search (max-w-2xl) */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", typeInfo.cls)}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight truncate">{file.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
              <span>{context.direction}</span>
              <ChevronRight className="h-3 w-3" />
              <span>{context.armoire}</span>
              <ChevronRight className="h-3 w-3" />
              <span>{context.dossier}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border",
              status.cls
            )}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Preview banner ── */}
        <div className="bg-muted/50 border-b border-border flex items-center justify-center py-8 flex-shrink-0">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className={cn("h-16 w-16 rounded-xl flex items-center justify-center", typeInfo.cls)}>
              <TypeIcon className="h-8 w-8" />
            </div>
            <p className="text-xs font-medium text-foreground">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">{file.size} · {typeInfo.label}</p>
          </div>
        </div>

        {/* ── Action bar ── */}
        <div className="px-5 py-3 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {actions.map(action => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                className="h-8 gap-1.5 text-xs rounded"
                onClick={action.onClick}
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            ))}
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs rounded text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-border flex-shrink-0 bg-card">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "info"     && <TabInfo     file={file} context={context} />}
          {activeTab === "versions" && <TabVersions file={file} />}
          {activeTab === "workflow" && <TabWorkflow file={file} />}
          {activeTab === "activity" && <TabActivity file={file} />}
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60]" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border rounded-lg shadow-2xl z-[70] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Supprimer le document ?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cette action est irréversible.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-3 mb-4 truncate">
              {file.name}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
              <Button
                className="flex-1 h-9 text-sm rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={() => {
                  toast.error("Document supprimé")
                  setShowDeleteConfirm(false)
                  onClose()
                }}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
