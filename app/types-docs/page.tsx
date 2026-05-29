"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import {
  Tag, Plus, FileText, Edit, Trash2, X, Check, AlertCircle,
  FolderTree, Sparkles, Eye, ChevronRight, Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import { store } from "@/lib/store"

interface DocumentType {
  id: string
  name: string
  description: string
  armoire: string
  agenceId?: string
  serviceId?: string
  armoireId?: string
  count: number
  fields: Field[]
  hasWorkflow: boolean
  hasOcr: boolean
  status: "active" | "draft"
  dynamicPath?: string
  namingPattern?: string
}

interface Field {
  id: string
  name: string
  type: "text" | "date" | "amount" | "dropdown"
  required: boolean
  ocrEnabled: boolean
}

const initialTypes: DocumentType[] = [
  {
    id: "1",
    name: "Facture Fournisseur",
    description: "Factures clients et fournisseurs — extraction automatique de montants et dates",
    armoire: "Finance",
    count: 843,
    fields: [
      { id: "f1", name: "Numéro de facture", type: "text", required: true, ocrEnabled: true },
      { id: "f2", name: "Date d'émission", type: "date", required: true, ocrEnabled: true },
      { id: "f3", name: "Montant HT", type: "amount", required: true, ocrEnabled: true },
      { id: "f4", name: "Montant TTC", type: "amount", required: true, ocrEnabled: true },
      { id: "f5", name: "Fournisseur", type: "text", required: true, ocrEnabled: true },
      { id: "f6", name: "IBAN", type: "text", required: false, ocrEnabled: true },
    ],
    hasWorkflow: true,
    hasOcr: true,
    status: "active",
    dynamicPath: "Directions / {{Direction}} / {{Agence}} / {{Service}} / {{Year}}",
    namingPattern: "{{Date}}_{{Vendor}}_{{Doc_ID}}",
  },
  {
    id: "2",
    name: "Contrat de Travail",
    description: "Contrats commerciaux et de prestation — circuit signature multi-étapes",
    armoire: "RH",
    count: 247,
    fields: [
      { id: "c1", name: "Nom du salarié", type: "text", required: true, ocrEnabled: false },
      { id: "c2", name: "Date de signature", type: "date", required: true, ocrEnabled: false },
      { id: "c3", name: "Poste occupé", type: "dropdown", required: true, ocrEnabled: false },
      { id: "c4", name: "Salaire brut", type: "amount", required: true, ocrEnabled: false },
      { id: "c5", name: "Date de début", type: "date", required: true, ocrEnabled: false },
      { id: "c6", name: "Durée du contrat", type: "text", required: true, ocrEnabled: false },
      { id: "c7", name: "Type de contrat", type: "dropdown", required: true, ocrEnabled: false },
      { id: "c8", name: "Référence interne", type: "text", required: false, ocrEnabled: false },
    ],
    hasWorkflow: true,
    hasOcr: false,
    status: "active",
  },
  {
    id: "3",
    name: "Note de Frais",
    description: "Déclarations de frais professionnels avec justificatifs",
    armoire: "Finance",
    count: 156,
    fields: [
      { id: "n1", name: "Montant total", type: "amount", required: true, ocrEnabled: true },
      { id: "n2", name: "Date de la dépense", type: "date", required: true, ocrEnabled: true },
      { id: "n3", name: "Type de frais", type: "dropdown", required: true, ocrEnabled: false },
      { id: "n4", name: "Justificatif", type: "text", required: true, ocrEnabled: false },
      { id: "n5", name: "Remarques", type: "text", required: false, ocrEnabled: false },
    ],
    hasWorkflow: false,
    hasOcr: true,
    status: "active",
  },
]

const dataTypeOptions = {
  text: "Texte",
  date: "Date",
  amount: "Montant",
  dropdown: "Liste déroulante",
}

export default function TypesDocsPage() {
  const [types, setTypes] = useState<DocumentType[]>(initialTypes)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleAddType = () => {
    setSelectedType(null)
    setIsEditing(false)
    setShowConfigModal(true)
  }

  const handleEditType = (type: DocumentType) => {
    setSelectedType(type)
    setIsEditing(true)
    setShowConfigModal(true)
  }

  const handleDeleteType = (id: string) => {
    setTypes(types.filter(t => t.id !== id))
  }

  return (
    <Shell>
      <Header />
      <main className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mt-1">{types.length} types configurés — schémas de métadonnées personnalisés</p>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-sm rounded-lg" onClick={handleAddType}>
            <Plus className="h-4 w-4" />
            Nouveau type
          </Button>
        </div>

        {/* Tableau des types */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Nom du type</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Armoire</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Champs actifs</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Documents</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((type, i) => (
                  <tr key={type.id} className={cn("hover:bg-muted/30 transition-colors", i < types.length - 1 && "border-b border-border")}>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center flex-shrink-0">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{type.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{type.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">{type.armoire}</Badge>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        {type.fields.length} champs
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs font-medium">{type.count.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={cn(
                        "text-[10px]",
                        type.status === "active"
                          ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                      )}>
                        {type.status === "active" ? "Activé" : "Brouillon"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditType(type)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteType(type.id)}
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
        </div>
      </main>

      {/* Modal Configuration */}
      {showConfigModal && (
        <ConfigModal
          type={selectedType}
          isEditing={isEditing}
          onClose={() => setShowConfigModal(false)}
          onSave={(updatedType) => {
            if (isEditing && selectedType) {
              setTypes(types.map(t => t.id === updatedType.id ? updatedType : t))
            } else {
              setTypes([...types, updatedType])
            }
            setShowConfigModal(false)
          }}
        />
      )}
    </Shell>
  )
}

interface ConfigModalProps {
  type: DocumentType | null
  isEditing: boolean
  onClose: () => void
  onSave: (type: DocumentType) => void
}

// Available tokens for naming and path
const PATH_TOKENS = [
  { label: "{{Direction}}", desc: "Nom de la direction" },
  { label: "{{Agence}}", desc: "Nom de l'agence" },
  { label: "{{Service}}", desc: "Nom du service" },
  { label: "{{Year}}", desc: "Année courante" },
  { label: "{{Month}}", desc: "Mois courant" },
]

const NAMING_TOKENS = [
  { label: "{{Date}}", mock: "20260529" },
  { label: "{{Vendor}}", mock: "TotalEnergies" },
  { label: "{{Doc_ID}}", mock: "INV-982" },
  { label: "{{Amount}}", mock: "4820EUR" },
  { label: "{{Type}}", mock: "FACTURE" },
  { label: "{{Author}}", mock: "C.Boka" },
  { label: "{{Ref}}", mock: "REF-2026" },
]

function ConfigModal({ type, isEditing, onClose, onSave }: ConfigModalProps) {
  const directions = store.getDirections()

  // State
  const [name, setName] = useState(type?.name ?? "")
  const [description, setDescription] = useState(type?.description ?? "")
  const [status, setStatus] = useState<"active" | "draft">(type?.status ?? "draft")
  const [fields, setFields] = useState<Field[]>(type?.fields ?? [])
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState<Field["type"]>("text")
  const [dynamicPath, setDynamicPath] = useState(type?.dynamicPath ?? "Directions / {{Direction}} / {{Agence}} / {{Service}} / {{Year}}")
  const [namingPattern, setNamingPattern] = useState(type?.namingPattern ?? "{{Date}}_{{Vendor}}_{{Doc_ID}}")

  // Destination cascade
  const [selectedDirectionId, setSelectedDirectionId] = useState<string>(() => {
    if (type?.agenceId) {
      const dir = directions.find(d => d.agences.some(a => a.id === type.agenceId))
      return dir?.id ?? ""
    }
    return ""
  })
  const [selectedAgenceId, setSelectedAgenceId] = useState<string>(type?.agenceId ?? "")
  const [selectedServiceId, setSelectedServiceId] = useState<string>(type?.serviceId ?? "")
  const [selectedArmoireId, setSelectedArmoireId] = useState<string>(type?.armoireId ?? "")

  const selectedDirection = directions.find(d => d.id === selectedDirectionId)
  const availableAgences = selectedDirection?.agences ?? []
  const selectedAgence = availableAgences.find(a => a.id === selectedAgenceId)
  const availableServices = selectedAgence?.services ?? []
  const selectedService = availableServices.find(s => s.id === selectedServiceId)
  const availableArmoires = selectedService?.armoires ?? []
  const selectedArmoire = availableArmoires.find(a => a.id === selectedArmoireId)

  // Refs for cursor tracking in textarea-like inputs
  const pathInputRef = useRef<HTMLInputElement>(null)
  const namingInputRef = useRef<HTMLInputElement>(null)

  // Insert token at cursor position in a given setter+ref
  const insertToken = (
    token: string,
    currentVal: string,
    setter: (v: string) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const el = inputRef.current
    if (el) {
      const start = el.selectionStart ?? currentVal.length
      const end = el.selectionEnd ?? currentVal.length
      const next = currentVal.slice(0, start) + token + currentVal.slice(end)
      setter(next)
      // Restore cursor after token
      setTimeout(() => {
        el.focus()
        el.setSelectionRange(start + token.length, start + token.length)
      }, 0)
    } else {
      setter(currentVal + token)
    }
  }

  // Live preview
  const preview = useMemo(() => {
    const dirName = selectedDirection?.name ?? "Akieni"
    const agenceName = selectedAgence?.name ?? "Agence Siège"
    const serviceName = selectedService?.name ?? "Service Finance"
    const armName = selectedArmoire?.name ?? "Finance"
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const dateStr = `${year}${month}${String(now.getDate()).padStart(2, "0")}`

    // Build path preview
    const resolvedPath = dynamicPath
      .replace(/\{\{Direction\}\}/g, dirName)
      .replace(/\{\{Agence\}\}/g, agenceName)
      .replace(/\{\{Service\}\}/g, serviceName)
      .replace(/\{\{Year\}\}/g, year)
      .replace(/\{\{Month\}\}/g, month)

    // Build name preview using mock values
    let resolvedName = namingPattern
    NAMING_TOKENS.forEach(t => {
      if (t.label === "{{Date}}") resolvedName = resolvedName.replace(/\{\{Date\}\}/g, dateStr)
      else resolvedName = resolvedName.replace(new RegExp(t.label.replace(/[{}]/g, "\\$&"), "g"), t.mock)
    })
    resolvedName = resolvedName + ".pdf"

    return { path: resolvedPath, file: resolvedName, armName }
  }, [dynamicPath, namingPattern, selectedDirection, selectedAgence, selectedService, selectedArmoire])

  const handleAddField = () => {
    if (newFieldName.trim()) {
      const newField: Field = {
        id: `field-${Date.now()}`,
        name: newFieldName,
        type: newFieldType,
        required: false,
        ocrEnabled: false,
      }
      setFields([...fields, newField])
      setNewFieldName("")
      setNewFieldType("text")
    }
  }

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const handleToggleFieldRequired = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, required: !f.required } : f))
  }

  const handleToggleFieldOcr = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, ocrEnabled: !f.ocrEnabled } : f))
  }

  const handleSave = () => {
    const newType: DocumentType = {
      id: type?.id ?? `type-${Date.now()}`,
      name,
      description,
      armoire: selectedArmoire?.name ?? type?.armoire ?? "",
      agenceId: selectedAgenceId || undefined,
      serviceId: selectedServiceId || undefined,
      armoireId: selectedArmoireId || undefined,
      count: type?.count ?? 0,
      fields,
      hasWorkflow: false,
      hasOcr: fields.some(f => f.ocrEnabled),
      status,
      dynamicPath,
      namingPattern,
    }
    onSave(newType)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l border-border z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-background z-10">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Modifier le type" : "Créer un nouveau type"}
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">

          {/* ─── 1. Paramètres Généraux ────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <Tag className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
              </div>
              <h3 className="font-semibold text-foreground">Paramètres Généraux</h3>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Nom du type</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Facture Fournisseur"
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez ce type de document..."
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Statut</label>
              <Select value={status} onValueChange={(v) => setStatus(v as "active" | "draft")}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activé</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* ─── 2. Destination : Direction → Agence → Service → Armoire ── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <FolderTree className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
              </div>
              <h3 className="font-semibold text-foreground">Destination de Classement</h3>
            </div>

            {/* Breadcrumb indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/30 rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap">
              <span className={cn(selectedDirectionId ? "text-foreground font-medium" : "opacity-50")}>
                {selectedDirection?.name ?? "Direction"}
              </span>
              <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
              <span className={cn(selectedAgenceId ? "text-foreground font-medium" : "opacity-50")}>
                {selectedAgence?.name ?? "Agence"}
              </span>
              <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
              <span className={cn(selectedServiceId ? "text-foreground font-medium" : "opacity-50")}>
                {selectedService?.name ?? "Service"}
              </span>
              <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
              <span className={cn(selectedArmoireId ? "text-blue-600 dark:text-blue-400 font-semibold" : "opacity-50")}>
                {selectedArmoire?.name ?? "Armoire"}
              </span>
            </div>

            {/* 3-column cascade grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Direction */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Direction</label>
                <Select
                  value={selectedDirectionId}
                  onValueChange={(v) => {
                    setSelectedDirectionId(v)
                    setSelectedAgenceId("")
                    setSelectedServiceId("")
                    setSelectedArmoireId("")
                  }}
                >
                  <SelectTrigger className="mt-1.5 h-9 text-sm">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {directions.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Agence */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agence</label>
                <Select
                  value={selectedAgenceId}
                  onValueChange={(v) => {
                    setSelectedAgenceId(v)
                    setSelectedServiceId("")
                    setSelectedArmoireId("")
                  }}
                  disabled={!selectedDirectionId || availableAgences.length === 0}
                >
                  <SelectTrigger className="mt-1.5 h-9 text-sm">
                    <SelectValue placeholder={!selectedDirectionId ? "— d'abord une direction" : "Choisir..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgences.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Service</label>
                <Select
                  value={selectedServiceId}
                  onValueChange={(v) => {
                    setSelectedServiceId(v)
                    setSelectedArmoireId("")
                  }}
                  disabled={!selectedAgenceId || availableServices.length === 0}
                >
                  <SelectTrigger className="mt-1.5 h-9 text-sm">
                    <SelectValue placeholder={!selectedAgenceId ? "— d'abord une agence" : "Choisir..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Armoire */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Armoire</label>
                <Select
                  value={selectedArmoireId}
                  onValueChange={setSelectedArmoireId}
                  disabled={!selectedServiceId || availableArmoires.length === 0}
                >
                  <SelectTrigger className="mt-1.5 h-9 text-sm">
                    <SelectValue placeholder={!selectedServiceId ? "— d'abord un service" : "Choisir..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableArmoires.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* ─── 3. File Naming & Path Convention ─────────────────────── */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
              </div>
              <h3 className="font-semibold text-foreground">Convention de Nommage & Dossier</h3>
            </div>

            {/* Dynamic Path Builder */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Chemin de dossier dynamique
                <span className="ml-2 text-xs text-muted-foreground font-normal">Cliquez sur un jeton pour l'insérer</span>
              </label>
              <Input
                ref={pathInputRef}
                value={dynamicPath}
                onChange={(e) => setDynamicPath(e.target.value)}
                placeholder="Ex: Directions / {{Direction}} / {{Agence}} / {{Year}}"
                className="font-mono text-sm"
              />
              {/* Path token pills */}
              <div className="flex flex-wrap gap-1.5">
                {PATH_TOKENS.map(tok => (
                  <button
                    key={tok.label}
                    type="button"
                    title={tok.desc}
                    onClick={() => insertToken(tok.label, dynamicPath, setDynamicPath, pathInputRef)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer"
                  >
                    {tok.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Naming Pattern Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Formule de nommage du fichier
                <span className="ml-2 text-xs text-muted-foreground font-normal">Les tokens seront remplacés au moment de l'enregistrement</span>
              </label>
              <Input
                ref={namingInputRef}
                value={namingPattern}
                onChange={(e) => setNamingPattern(e.target.value)}
                placeholder="Ex: {{Date}}_{{Vendor}}_{{Doc_ID}}"
                className="font-mono text-sm"
              />
              {/* Naming token pills */}
              <div className="flex flex-wrap gap-1.5">
                {NAMING_TOKENS.map(tok => (
                  <button
                    key={tok.label}
                    type="button"
                    title={`Exemple : ${tok.mock}`}
                    onClick={() => insertToken(tok.label, namingPattern, setNamingPattern, namingInputRef)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    {tok.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="rounded-xl overflow-hidden border border-zinc-800 dark:border-zinc-700 shadow-lg">
              <div className="flex items-center justify-between bg-zinc-900 dark:bg-zinc-800 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Aperçu en Direct</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                </div>
              </div>
              <div className="bg-zinc-950 dark:bg-zinc-900 px-4 py-4 font-mono space-y-2.5">
                {/* Path */}
                <div className="flex items-start gap-2">
                  <span className="text-zinc-600 dark:text-zinc-500 text-xs shrink-0 mt-0.5">PATH</span>
                  <span className="text-emerald-400 text-xs break-all leading-relaxed">
                    {preview.path || <span className="text-zinc-600 italic">chemin non défini</span>}
                  </span>
                </div>
                {/* File name */}
                <div className="flex items-start gap-2">
                  <span className="text-zinc-600 dark:text-zinc-500 text-xs shrink-0 mt-0.5">FILE</span>
                  <span className="text-amber-400 text-xs break-all">
                    {preview.file || <span className="text-zinc-600 italic">nom non défini</span>}
                  </span>
                </div>
                {/* Full path */}
                <div className="pt-1 border-t border-zinc-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-violet-400 text-[11px] break-all leading-relaxed">
                      /{preview.path}/{preview.file}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
                      title="Copier le chemin complet"
                      onClick={() => navigator.clipboard?.writeText(`/${preview.path}/${preview.file}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* ─── 4. Définition des Métadonnées ────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
                </div>
                <h3 className="font-semibold text-foreground">Définition des Métadonnées</h3>
              </div>
              <span className="text-xs text-muted-foreground">{fields.length} champ{fields.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{field.name}</p>
                      <Badge variant="outline" className="text-[10px]">{dataTypeOptions[field.type]}</Badge>
                      {field.required && (
                        <span className="text-[10px] text-red-500 font-medium">Obligatoire</span>
                      )}
                      {field.ocrEnabled && (
                        <span className="text-[10px] text-blue-500 font-medium">OCR</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleToggleFieldRequired(field.id)}
                      title={field.required ? "Rendre optionnel" : "Rendre obligatoire"}
                    >
                      <AlertCircle className={cn("h-4 w-4", field.required ? "text-red-500" : "text-muted-foreground")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleToggleFieldOcr(field.id)}
                      title={field.ocrEnabled ? "Désactiver OCR" : "Activer OCR"}
                    >
                      <FileText className={cn("h-4 w-4", field.ocrEnabled ? "text-blue-500" : "text-muted-foreground")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ajouter un champ */}
            <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 space-y-3">
              <p className="text-sm font-medium text-foreground">Ajouter un champ d'index</p>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Nom du champ"
                  onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                />
                <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as Field["type"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Montant</SelectItem>
                    <SelectItem value="dropdown">Liste</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddField} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-border bg-background">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1 gap-1.5" onClick={handleSave} disabled={!name.trim() || fields.length === 0}>
            <Check className="h-4 w-4" />
            {isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </div>
    </>
  )
}
