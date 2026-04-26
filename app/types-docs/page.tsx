"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { Tag, Plus, FileText, Edit, Trash2, GitBranch, X, Check, AlertCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface DocumentType {
  id: string
  name: string
  description: string
  armoire: "Finance" | "RH" | "Juridique" | "Opérations"
  count: number
  fields: Field[]
  hasWorkflow: boolean
  hasOcr: boolean
  status: "active" | "draft"
  workflow?: string
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
    workflow: "Validation Finance",
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
    workflow: "Signature RH",
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
            <h1 className="text-xl font-semibold text-foreground">Types de Documents</h1>
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

function ConfigModal({ type, isEditing, onClose, onSave }: ConfigModalProps) {
  const [name, setName] = useState(type?.name ?? "")
  const [description, setDescription] = useState(type?.description ?? "")
  const [armoire, setArmoire] = useState<DocumentType["armoire"]>(type?.armoire ?? "Finance")
  const [workflow, setWorkflow] = useState(type?.workflow ?? "")
  const [fields, setFields] = useState<Field[]>(type?.fields ?? [])
  const [status, setStatus] = useState<"active" | "draft">(type?.status ?? "draft")
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState<Field["type"]>("text")

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
      armoire,
      count: type?.count ?? 0,
      fields,
      hasWorkflow: !!workflow,
      hasOcr: fields.some(f => f.ocrEnabled),
      status,
      workflow: workflow || undefined,
    }
    onSave(newType)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l border-border z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Modifier le type" : "Créer un nouveau type"}
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Paramètres Généraux */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Paramètres Généraux</h3>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Armoire de destination</label>
                <Select value={armoire} onValueChange={(v) => setArmoire(v as DocumentType["armoire"])}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Juridique">Juridique</SelectItem>
                    <SelectItem value="Opérations">Opérations</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Workflow par défaut</label>
              <Input
                value={workflow}
                onChange={(e) => setWorkflow(e.target.value)}
                placeholder="Ex: Validation Finance"
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Métadonnées */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Définition des Métadonnées</h3>
              <span className="text-xs text-muted-foreground">{fields.length} champ{fields.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-1">
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
          </div>
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
