"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import {
  GitBranch,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  ChevronDown,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Palette de couleurs pour la Barre de répartition cumulée (Stacked Bar)
const stepColors = [
  "bg-blue-500",    // Étape 1
  "bg-amber-500",   // Étape 2
  "bg-purple-500",  // Étape 3
  "bg-pink-500",    // Étape 4
  "bg-teal-500",    // Étape 5
]

interface WorkflowDocument {
  id: string
  name: string
  type: "pdf" | "docx" | "xlsx" | "img"
  atStep: number
  uploadedAt: string
}

interface WorkflowData {
  id: string
  name: string
  description: string
  steps: string[]
  currentStep: number
  status: "pending" | "active" | "completed"
  lastActivity: string
  deadline: string
  escalade: boolean
  documents: WorkflowDocument[]
}

const workflows: WorkflowData[] = [
  {
    id: "1",
    name: "Approbation Factures Fournisseurs",
    description: "Validation des factures avant paiement — Finance",
    steps: ["Soumission", "Vérification", "Approbation DG", "Paiement"],
    currentStep: 1,
    status: "pending",
    lastActivity: "Il y a 30min",
    deadline: "Dans 48h",
    escalade: true,
    documents: [
      { id: "d1", name: "Facture_Orange_Avr2026.pdf", type: "pdf", atStep: 1, uploadedAt: "22 mai 2026" },
      { id: "d2", name: "Facture_MTN_Mar2026.pdf", type: "pdf", atStep: 1, uploadedAt: "22 mai 2026" },
      { id: "d3", name: "Facture_Ecowater_Jan2026.pdf", type: "pdf", atStep: 0, uploadedAt: "20 mai 2026" },
      { id: "d4", name: "Facture_TOTAL_Energie_Avr2026.pdf", type: "pdf", atStep: 0, uploadedAt: "20 mai 2026" },
      { id: "d5", name: "Budget_Q1_2026.xlsx", type: "xlsx", atStep: 1, uploadedAt: "19 mai 2026" },
      { id: "d6", name: "Facture_Orange_Mar2026.pdf", type: "pdf", atStep: 2, uploadedAt: "18 mai 2026" },
      { id: "d7", name: "Facture_MTN_Avr2026.pdf", type: "pdf", atStep: 1, uploadedAt: "18 mai 2026" },
    ],
  },
  {
    id: "2",
    name: "Validation Contrat CDI",
    description: "Signature multi-étapes — Salarié → RH → DG",
    steps: ["RH", "Salarié", "Direction Générale"],
    currentStep: 2,
    status: "active",
    lastActivity: "Il y a 2h",
    deadline: "Dans 3j",
    escalade: false,
    documents: [
      { id: "d1", name: "CDI_Jean_Marc_Boka.docx", type: "docx", atStep: 1, uploadedAt: "21 mai 2026" },
    ],
  },
  {
    id: "3",
    name: "Revue Juridique — NDA",
    description: "Examen et approbation des accords de confidentialité",
    steps: ["Soumission", "Juriste", "Direction"],
    currentStep: 2,
    status: "active",
    lastActivity: "Il y a 4h",
    deadline: "Dans 5j",
    escalade: false,
    documents: [
      { id: "d1", name: "NDA_Partenaire_X.pdf", type: "pdf", atStep: 1, uploadedAt: "21 mai 2026" },
      { id: "d2", name: "NDA_Partenaire_Y.pdf", type: "pdf", atStep: 1, uploadedAt: "21 mai 2026" },
      { id: "d3", name: "Accord_Confid_Z.pdf", type: "pdf", atStep: 2, uploadedAt: "20 mai 2026" },
    ],
  },
  {
    id: "4",
    name: "Archivage Dossiers RH Q1",
    description: "Classement et archivage des dossiers employés du trimestre",
    steps: ["Collecte", "Vérification", "Archivage"],
    currentStep: 3,
    status: "completed",
    lastActivity: "Il y a 1j",
    deadline: "Terminé",
    escalade: false,
    documents: [
      { id: "d1", name: "Dossier_RH_Janvier.pdf", type: "pdf", atStep: 2, uploadedAt: "15 mai 2026" },
      { id: "d2", name: "Dossier_RH_Fevrier.pdf", type: "pdf", atStep: 2, uploadedAt: "15 mai 2026" },
      { id: "d3", name: "Dossier_RH_Mars.pdf", type: "pdf", atStep: 2, uploadedAt: "15 mai 2026" },
      { id: "d4", name: "Recapitulatif_Q1.xlsx", type: "xlsx", atStep: 2, uploadedAt: "15 mai 2026" },
    ],
  },
]

const statusConfig = {
  active: { label: "En cours", icon: Clock, className: "bg-neutral-900 text-white" },
  completed: { label: "Terminé", icon: CheckCircle2, className: "bg-neutral-100 text-neutral-600" },
  pending: { label: "En attente", icon: AlertCircle, className: "bg-amber-100 text-amber-800" },
}

export default function WorkflowsPage() {
  const [syncing, setSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  // État local pour simuler l'ouverture d'un accordéon de détails directement sur la page si besoin
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null)

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 1500)
  }

  const filteredWorkflows = workflows.filter((wf) =>
    wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wf.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Shell>
      <Header />
      <main className="p-6 space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Suivi des Workflows</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {workflows.length} modèles actifs connectés à la plateforme de gestion externe.
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <Input
              placeholder="Rechercher un modèle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg h-9 w-60 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-2 text-xs border-neutral-200 shadow-sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-neutral-500", syncing && "animate-spin")} />
              Sync. Plateforme
            </Button>
          </div>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredWorkflows.map((wf) => {
            const config = statusConfig[wf.status]
            const StatusIcon = config.icon
            const totalDocs = wf.documents.length

            return (
              <div
                key={wf.id}
                className={cn(
                  "group rounded-xl border bg-white p-5 shadow-sm transition-all flex flex-col border-neutral-200/80",
                  wf.escalade && "border-amber-200 bg-amber-50/10"
                )}
              >
                {/* Top Card Row */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-50 border group-hover:bg-neutral-900 group-hover:text-white transition-colors flex-shrink-0">
                      <GitBranch className="h-4 w-4 text-neutral-600 group-hover:text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-neutral-900 truncate">{wf.name}</h3>
                        {wf.escalade && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{wf.description}</p>
                    </div>
                  </div>
                  <Badge className={cn("gap-1 text-[11px] rounded-md px-2 py-0.5 font-medium shadow-none", config.className)}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>

                {/* ─── BARRE DE RÉPARTITION CUMULÉE (STACKED BAR) ─── */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-medium text-neutral-500 flex justify-between">
                    <span>Distribution des documents par étape</span>
                    <span className="text-neutral-900 font-semibold">{totalDocs} doc{totalDocs > 1 ? 's' : ''}</span>
                  </div>
                  
                  {/* Container de la barre cumulée */}
                  <div className="w-full h-7 rounded-lg overflow-hidden flex bg-neutral-100 p-0.5 border border-neutral-200/50">
                    {wf.steps.map((step, stepIdx) => {
                      const docsAtStep = wf.documents.filter((d) => d.atStep === stepIdx).length
                      // Calcul du pourcentage de largeur (si aucun document, proportion égale minimale pour l'UI, ou 0)
                      const pct = totalDocs > 0 ? (docsAtStep / totalDocs) * 100 : 100 / wf.steps.length

                      if (docsAtStep === 0 && totalDocs > 0) return null // N'affiche pas les étapes vides si la barre contient des docs

                      return (
                        <div
                          key={stepIdx}
                          style={{ width: `${pct}%` }}
                          className={cn(
                            "h-full transition-all first:rounded-l-md last:rounded-r-md flex items-center justify-center text-[10px] font-bold text-white shadow-inner relative group/segment",
                            stepColors[stepIdx % stepColors.length]
                          )}
                        >
                          <span>{docsAtStep}</span>
                          {/* Tooltip au survol */}
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-neutral-950 text-white text-[9px] px-2 py-0.5 rounded opacity-0 pointer-events-none group-hover/segment:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {step} : {docsAtStep} doc{docsAtStep > 1 ? 's' : ''}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Légende horizontale sous la barre */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-5 text-[10px] text-muted-foreground border-b pb-3 border-neutral-100">
                  {wf.steps.map((step, stepIdx) => {
                    const count = wf.documents.filter((d) => d.atStep === stepIdx).length
                    return (
                      <div key={stepIdx} className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", stepColors[stepIdx % stepColors.length])} />
                        <span className={cn("font-medium", count > 0 && "text-neutral-900")}>
                          {step} ({count})
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Footer Actions / Accordion Trigger */}
                <div className="mt-auto pt-1 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-neutral-600 hover:text-neutral-900 px-2 gap-1"
                    onClick={() => setExpandedWorkflow(expandedWorkflow === wf.id ? null : wf.id)}
                  >
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expandedWorkflow === wf.id && "rotate-180")} />
                    {expandedWorkflow === wf.id ? "Masquer les détails" : "Voir les documents"}
                  </Button>
                  
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs h-8 text-blue-600 hover:text-blue-700 font-medium gap-1 px-0"
                    asChild
                  >
                    <a href={`/workflows/${wf.id}`}>
                      Ouvrir le Workflow <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                {/* ─── STRUCTURE ACCORDÉON EXPANSÉE (DÉTAILS DES FILES GED) ─── */}
                {expandedWorkflow === wf.id && (
                  <div className="mt-4 pt-4 border-t border-dashed space-y-3 animate-in fade-in-50 duration-200">
                    <div className="text-xs font-bold text-neutral-800">Localisation des fichiers GED par file d'attente :</div>
                    <div className="space-y-2">
                      {wf.steps.map((step, stepIdx) => {
                        const stepDocs = wf.documents.filter((d) => d.atStep === stepIdx)
                        return (
                          <div key={stepIdx} className="border rounded-lg overflow-hidden bg-neutral-50/50">
                            {/* Entête de l'accordéon d'étape */}
                            <div className="p-2.5 bg-neutral-50 flex items-center justify-between border-b text-xs font-medium">
                              <div className="flex items-center gap-2">
                                <span className={cn("w-1.5 h-1.5 rounded-full", stepColors[stepIdx % stepColors.length])} />
                                <span className="text-neutral-700">{step}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] bg-white font-normal px-1.5">
                                {stepDocs.length} fichier{stepDocs.length > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            {/* Liste des documents GED de cette étape */}
                            <div className="p-2 space-y-1.5">
                              {stepDocs.length === 0 ? (
                                <p className="text-[11px] text-muted-foreground italic p-1">Aucun document à cette étape.</p>
                              ) : (
                                stepDocs.map((doc) => (
                                  <div key={doc.id} className="flex items-center justify-between p-1.5 rounded bg-white border border-neutral-100 shadow-2xs text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                                      <span className="font-medium text-neutral-800 truncate">{doc.name}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0 bg-neutral-50 px-1 py-0.5 rounded">
                                      Arrivé le {doc.uploadedAt}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </Shell>
  )
}