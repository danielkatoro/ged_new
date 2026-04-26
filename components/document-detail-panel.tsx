"use client"

import React, { useState } from "react"
import {
  X, FileText, File, FileSpreadsheet, Image,
  Download, Pencil, Send, Trash2, ExternalLink,
  CheckCircle2, Clock, AlertCircle, XCircle,
  Building2, Folder, Calendar, User, Hash, Tag,
  GitBranch, Mail, History, Activity, Info,
  ChevronRight, Eye, RotateCcw, GitCompare,
  Lock, Unlock, MessageSquare, ThumbsUp, ThumbsDown,
  AlertTriangle, Shield, Stamp, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type DocFile } from "@/lib/store"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentDetailPanelProps {
  file: DocFile
  context: { direction: string; armoire: string; dossier: string }
  onClose: () => void
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig = {
  "Approuve":      { label: "Approuvé",      icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "En validation": { label: "En validation", icon: Clock,        cls: "text-amber-700 bg-amber-50 border-amber-200" },
  "En attente":    { label: "En attente",    icon: AlertCircle,  cls: "text-muted-foreground bg-muted border-border" },
  "Rejete":        { label: "Rejeté",        icon: XCircle,      cls: "text-red-700 bg-red-50 border-red-200" },
} as const

const typeConfig: Record<DocFile["type"], { label: string; icon: React.ElementType; cls: string }> = {
  pdf:  { label: "PDF",  icon: FileText,       cls: "text-red-500 bg-red-50" },
  docx: { label: "DOCX", icon: File,           cls: "text-blue-500 bg-blue-50" },
  xlsx: { label: "XLSX", icon: FileSpreadsheet, cls: "text-emerald-500 bg-emerald-50" },
  img:  { label: "IMG",  icon: Image,           cls: "text-purple-500 bg-purple-50" },
}

const TABS = [
  { id: "info",     label: "Informations", icon: Info },
  { id: "versions", label: "Versions",     icon: History },
  { id: "workflow", label: "Workflow",     icon: GitBranch },
  { id: "activity", label: "Activités",   icon: Activity },
] as const

type TabId = typeof TABS[number]["id"]

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number }) {
  const cfg =
    score >= 85 ? { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Élevé" } :
    score >= 60 ? { cls: "bg-amber-50 text-amber-700 border-amber-200",       label: "Moyen" } :
                  { cls: "bg-red-50 text-red-700 border-red-200",             label: "Faible" }
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border", cfg.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full",
        score >= 85 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
      )} />
      {score}% — {cfg.label}
    </span>
  )
}

// ─── Tab: Informations ────────────────────────────────────────────────────────

function TabInfo({ file, context }: { file: DocFile; context: DocumentDetailPanelProps["context"] }) {
  // Simulated OCR extracted index fields depending on doc type
  const indexFields: { label: string; value: string; confidence: number }[] = file.type === "pdf"
    ? [
        { label: "N° de document",    value: `FAC-2024-${file.id.slice(-4).toUpperCase()}`, confidence: 97 },
        { label: "Date du document",  value: file.date,                                      confidence: 94 },
        { label: "Montant HT",        value: "12 450 000 FCFA",                              confidence: 88 },
        { label: "Montant TTC",       value: "14 691 000 FCFA",                              confidence: 88 },
        { label: "Fournisseur",       value: "AKIENI Technologies SARL",                     confidence: 72 },
      ]
    : file.type === "docx"
    ? [
        { label: "Titre",             value: file.name.replace(/\.[^.]+$/, ""),              confidence: 95 },
        { label: "Date",              value: file.date,                                      confidence: 90 },
        { label: "Parties",           value: "Akieni / Client X",                            confidence: 65 },
      ]
    : [
        { label: "Titre",             value: file.name.replace(/\.[^.]+$/, ""),              confidence: 92 },
        { label: "Date",              value: file.date,                                      confidence: 91 },
      ]

  return (
    <div className="space-y-6">

      {/* Champs d'index extraits par OCR */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Champs d&apos;index extraits (OCR)
        </p>
        <div className="rounded border border-border overflow-hidden divide-y divide-border">
          {indexFields.map(field => (
            <div key={field.label} className="flex items-center justify-between px-3 py-2.5 bg-card hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">{field.label}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{field.value}</p>
              </div>
              <ConfidenceBadge score={field.confidence} />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          Les champs en orange ou rouge peuvent nécessiter une vérification manuelle.
        </p>
      </div>

      {/* Score de confiance global */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Score de confiance global
        </p>
        <div className="flex items-center gap-3 p-3 rounded border border-border bg-muted/40">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-2 rounded-full transition-all",
                  file.confidence >= 85 ? "bg-emerald-500" :
                  file.confidence >= 60 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${file.confidence}%` }}
              />
            </div>
          </div>
          <ConfidenceBadge score={file.confidence} />
        </div>
      </div>

      {/* Localisation */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Localisation
        </p>
        <div className="flex items-center gap-1.5 flex-wrap text-xs px-3 py-2.5 rounded border border-border bg-muted/40">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{context.direction}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <Folder className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{context.armoire}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <Folder className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{context.dossier}</span>
        </div>
      </div>

      {/* Propriétés techniques */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Propriétés techniques
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Hash,     label: "Taille",        value: file.size },
            { icon: FileText, label: "Format",         value: file.type.toUpperCase() },
            { icon: User,     label: "Importé par",   value: file.author },
            { icon: Calendar, label: "Date d'import", value: file.date },
            { icon: Mail,     label: "Source",         value: file.source === "email" ? "Email" : file.source === "upload" ? "Upload" : file.source === "scan" ? "Scan" : "Workflow" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-2.5 rounded border border-border/50 bg-muted/40">
              <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
              <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {file.tags.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {file.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-border bg-muted text-muted-foreground">
                <Tag className="h-2.5 w-2.5" /> {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {file.description && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Description</p>
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded border border-border/50 p-3">
            {file.description}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Versions ────────────────────────────────────────────────────────────

function TabVersions({ file }: { file: DocFile }) {
  const [checkedOut, setCheckedOut] = useState(false)

  const versions = file.versions.length > 0
    ? file.versions
    : [
        { version: 1, date: file.date, author: file.author, note: "Version initiale importée" },
      ]

  const enriched = versions.map((v, i) => ({
    ...v,
    note: (v as typeof v & { note?: string }).note ?? (i === 0 ? "Version initiale" : "Mise à jour"),
    isCurrent: i === versions.length - 1,
  }))

  return (
    <div className="space-y-5">

      {/* Statut de verrouillage */}
      <div className={cn(
        "flex items-center gap-3 p-3 rounded border",
        checkedOut ? "bg-amber-50 border-amber-200" : "bg-muted/40 border-border"
      )}>
        <div className={cn("h-8 w-8 rounded flex items-center justify-center flex-shrink-0",
          checkedOut ? "bg-amber-100" : "bg-muted"
        )}>
          {checkedOut ? <Lock className="h-4 w-4 text-amber-600" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">
            {checkedOut ? "Document verrouillé pour édition" : "Document disponible"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {checkedOut ? `Check-out par ${file.author} — en cours d'édition` : "Aucun check-out actif"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs rounded flex-shrink-0"
          onClick={() => {
            setCheckedOut(!checkedOut)
            toast.info(checkedOut ? "Document déverrouillé" : "Document verrouillé pour édition")
          }}
        >
          {checkedOut ? "Check-in" : "Check-out"}
        </Button>
      </div>

      {/* Liste des versions */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          {enriched.length} version{enriched.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-2">
          {[...enriched].reverse().map((v) => (
            <div
              key={v.version}
              className={cn(
                "rounded border p-3 transition-colors",
                v.isCurrent ? "bg-muted/50 border-border" : "bg-card border-border hover:bg-muted/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-8 w-8 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold",
                  v.isCurrent ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                )}>
                  v{v.version}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-foreground">Version {v.version}.0</span>
                    {v.isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground text-background font-medium">
                        Actuelle
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    <User className="h-2.5 w-2.5" /><span>{v.author}</span>
                    <span>·</span>
                    <Calendar className="h-2.5 w-2.5" /><span>{v.date}</span>
                  </div>
                  {v.note && (
                    <div className="flex items-start gap-1 mt-1.5">
                      <MessageSquare className="h-2.5 w-2.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-muted-foreground italic">{v.note}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Télécharger cette version"
                    onClick={() => toast.success(`Version ${v.version} téléchargée`)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  {!v.isCurrent && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Restaurer cette version"
                        onClick={() => toast.success(`Version ${v.version} restaurée comme version actuelle`)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Comparer avec la version actuelle"
                        onClick={() => toast.info(`Comparaison v${v.version} ↔ v${enriched.at(-1)?.version}`)}
                      >
                        <GitCompare className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Workflow ────────────────────────────────────────────────────────────

function TabWorkflow({ file }: { file: DocFile }) {
  const [approving, setApproving] = useState(false)

  const currentStepIndex =
    file.status === "Approuve" ? 3 :
    file.status === "En validation" ? 2 :
    file.status === "Rejete" ? 2 : 1

  const steps = [
    { label: "Soumission",    role: "Contributeur",    user: file.author,    date: file.date,   done: true,  current: false },
    { label: "Vérification",  role: "Chef de service", user: "J. Martin",    date: "",          done: currentStepIndex > 1, current: currentStepIndex === 1 },
    { label: "Validation",    role: "Directeur",       user: "A. Diallo",    date: "",          done: file.status === "Approuve", current: currentStepIndex === 2 && file.status === "En validation" },
    { label: "Archivage",     role: "Système",         user: "Automatique",  date: "",          done: file.status === "Approuve", current: false },
  ]

  const decisions = [
    { user: file.author,  action: "Soumis",   date: file.date,  comment: "" },
    ...(file.status !== "En attente" ? [{ user: "J. Martin", action: "Vérifié", date: file.date, comment: "Document conforme." }] : []),
    ...(file.status === "Rejete" ? [{ user: "A. Diallo", action: "Rejeté", date: file.date, comment: "Montant HT ne correspond pas à la commande." }] : []),
    ...(file.status === "Approuve" ? [{ user: "A. Diallo", action: "Approuvé", date: file.date, comment: "Tout est en ordre." }] : []),
  ]

  const eta = new Date()
  eta.setDate(eta.getDate() + 3)
  const etaStr = eta.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

  return (
    <div className="space-y-6">

      {/* Statut actuel */}
      <div className={cn(
        "flex items-center gap-3 p-3 rounded border",
        file.status === "Approuve" ? "bg-emerald-50 border-emerald-200" :
        file.status === "Rejete"   ? "bg-red-50 border-red-200" :
        file.status === "En validation" ? "bg-amber-50 border-amber-200" :
        "bg-muted/40 border-border"
      )}>
        {file.status === "Approuve" && <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />}
        {file.status === "Rejete"   && <XCircle      className="h-5 w-5 text-red-600 flex-shrink-0" />}
        {file.status === "En validation" && <Clock  className="h-5 w-5 text-amber-600 flex-shrink-0" />}
        {file.status === "En attente"    && <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">
            {file.status === "Approuve"      ? "Document approuvé"          :
             file.status === "Rejete"        ? "Document rejeté"            :
             file.status === "En validation" ? "En attente de validation"   :
             "Non soumis au workflow"}
          </p>
          {file.status !== "Approuve" && file.status !== "Rejete" && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Date limite d&apos;escalade : <span className="font-medium">{etaStr}</span>
            </p>
          )}
        </div>
        {file.linkedWorkflow && (
          <span className="text-[10px] px-2 py-1 rounded border border-border bg-background text-muted-foreground flex items-center gap-1">
            <GitBranch className="h-2.5 w-2.5" /> {file.linkedWorkflow}
          </span>
        )}
      </div>

      {/* Circuit de validation */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Circuit de validation
        </p>
        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border" />
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 bg-background z-10",
                  step.done    ? "border-emerald-500" :
                  step.current ? "border-amber-400"   :
                                 "border-border"
                )}>
                  {step.done
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    : step.current
                    ? <Clock className="h-4 w-4 text-amber-400" />
                    : <div className="h-2 w-2 rounded-full bg-border" />
                  }
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground">
                      Étape {i + 1} — {step.label}
                    </p>
                    {step.current && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 font-medium">
                        En cours
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {step.role} — {step.user}{step.date ? ` · ${step.date}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historique des décisions */}
      {decisions.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Historique des décisions
          </p>
          <div className="rounded border border-border overflow-hidden divide-y divide-border">
            {decisions.map((d, i) => (
              <div key={i} className="px-3 py-2.5 bg-card">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border",
                    d.action === "Approuvé" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    d.action === "Rejeté"   ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-muted text-muted-foreground border-border"
                  )}>
                    {d.action === "Approuvé" ? <ThumbsUp className="h-2.5 w-2.5" /> :
                     d.action === "Rejeté"   ? <ThumbsDown className="h-2.5 w-2.5" /> :
                     <CheckCircle2 className="h-2.5 w-2.5" />}
                    {d.action}
                  </span>
                  <span className="text-[10px] text-foreground font-medium">{d.user}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{d.date}</span>
                </div>
                {d.comment && (
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-start gap-1">
                    <MessageSquare className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                    <span className="italic">{d.comment}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions validateur */}
      {file.status === "En validation" && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Actions (Validateur)
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs rounded flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              onClick={() => { setApproving(true); toast.success("Document approuvé") }}
              disabled={approving}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Approuver
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs rounded flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => toast.error("Document rejeté — commentaire requis")}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              Rejeter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs rounded flex-1"
              onClick={() => toast.info("Demande de modification envoyée")}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Modifier
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Activités ───────────────────────────────────────────────────────────

function TabActivity({ file }: { file: DocFile }) {
  const activities = file.activity.length > 0
    ? file.activity
    : [
        { action: "Document uploadé",          user: file.author,    date: file.date, ip: "192.168.1.101" },
        { action: "Document consulté",          user: "J. Martin",   date: file.date, ip: "192.168.1.42"  },
        { action: "Index modifiés",             user: file.author,    date: file.date, ip: "192.168.1.101" },
        { action: "Envoyé en workflow",         user: file.author,    date: file.date, ip: "192.168.1.101" },
        { action: "Document téléchargé",        user: "A. Diallo",   date: file.date, ip: "10.0.0.8"      },
      ]

  const getIconAndColor = (action: string): { icon: React.ElementType; cls: string } => {
    const a = action.toLowerCase()
    if (a.includes("upload"))    return { icon: Download,      cls: "bg-blue-50 text-blue-500" }
    if (a.includes("consult"))   return { icon: Eye,           cls: "bg-muted text-muted-foreground" }
    if (a.includes("télécharg")) return { icon: Download,      cls: "bg-emerald-50 text-emerald-500" }
    if (a.includes("index"))     return { icon: Pencil,        cls: "bg-amber-50 text-amber-500" }
    if (a.includes("workflow"))  return { icon: GitBranch,     cls: "bg-purple-50 text-purple-500" }
    if (a.includes("approuv"))   return { icon: CheckCircle2,  cls: "bg-emerald-50 text-emerald-500" }
    if (a.includes("rejet"))     return { icon: XCircle,       cls: "bg-red-50 text-red-500" }
    if (a.includes("tampon"))    return { icon: Stamp,         cls: "bg-muted text-muted-foreground" }
    if (a.includes("partagé"))   return { icon: Send,          cls: "bg-blue-50 text-blue-500" }
    return { icon: Activity, cls: "bg-muted text-muted-foreground" }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Journal d&apos;audit ({activities.length} événements)
        </p>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Shield className="h-3 w-3" /> Piste immuable
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
        <div className="space-y-0">
          {activities.map((a, i) => {
            const { icon: Icon, cls } = getIconAndColor(a.action)
            return (
              <div key={i} className="flex items-start gap-3 relative pb-4 last:pb-0">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border border-background", cls)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-xs font-medium text-foreground leading-tight">{a.action}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-2.5 w-2.5" />{a.user}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />{a.date}
                    </span>
                    {a.ip && (
                      <>
                        <span>·</span>
                        <span className="font-mono">{a.ip}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocumentDetailPanel({ file, context, onClose }: DocumentDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("info")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const status   = statusConfig[file.status]
  const StatusIcon = status.icon
  const typeInfo = typeConfig[file.type]
  const TypeIcon = typeInfo.icon

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", typeInfo.cls)}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight truncate">{file.name}</p>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
              <span>{context.direction}</span>
              <ChevronRight className="h-2.5 w-2.5" />
              <span>{context.armoire}</span>
              <ChevronRight className="h-2.5 w-2.5" />
              <span>{context.dossier}</span>
            </div>
          </div>
          <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border flex-shrink-0", status.cls)}>
            <StatusIcon className="h-3 w-3" />{status.label}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs rounded"
              onClick={() => toast.info("Ouverture du fichier...")}>
              <ExternalLink className="h-3.5 w-3.5" />Ouvrir
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded"
              onClick={() => toast.success(`${file.name} téléchargé`)}>
              <Download className="h-3.5 w-3.5" />Télécharger
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded"
              onClick={() => toast.info("Ouverture de l'éditeur...")}>
              <Pencil className="h-3.5 w-3.5" />Modifier
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded"
              onClick={() => toast.success("Document envoyé pour validation")}>
              <Send className="h-3.5 w-3.5" />Envoyer pour validation
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded"
              onClick={() => toast.info("Sélection du tampon...")}>
              <Stamp className="h-3.5 w-3.5" />Apposer un tampon
            </Button>
            <Button variant="ghost" size="sm"
              className="h-8 gap-1.5 text-xs rounded text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
              onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-3.5 w-3.5" />Supprimer
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0 bg-card overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
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

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "info"     && <TabInfo     file={file} context={context} />}
          {activeTab === "versions" && <TabVersions file={file} />}
          {activeTab === "workflow" && <TabWorkflow file={file} />}
          {activeTab === "activity" && <TabActivity file={file} />}
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60]" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border rounded-lg shadow-2xl z-[70] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Supprimer le document ?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cette action est irréversible.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-3 mb-4 border border-border/50">
              <span className="font-medium text-foreground">{file.name}</span> sera définitivement supprimé du système GED.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-9 rounded text-sm"
                onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
              <Button size="sm"
                className="flex-1 h-9 rounded text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => { toast.error("Document supprimé"); setShowDeleteConfirm(false); onClose() }}>
                Supprimer
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
