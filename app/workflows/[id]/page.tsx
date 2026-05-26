"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { useParams, useRouter } from "next/navigation"
import {
  GitBranch,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
  File,
  FileSpreadsheet,
  ArrowLeft,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

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
  referenceCode?: string
  erpUrl?: string
}

const fileIconMap: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: File,
  xlsx: FileSpreadsheet,
  img: File,
}

// Palette harmonisée pour la Barre de répartition cumulée
const stepColors = [
  "bg-blue-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
]

const workflowsData: Record<string, WorkflowData> = {
  "1": {
    id: "1",
    name: "Approbation Factures Fournisseurs",
    description: "Validation des factures avant paiement — Finance",
    steps: ["Soumission", "Vérification", "Approbation DG", "Paiement"],
    currentStep: 1,
    status: "pending",
    lastActivity: "Il y a 30min",
    deadline: "Dans 48h",
    escalade: true,
    referenceCode: "AKIENI-2026-7VSEU4",
    erpUrl: "https://erp.example.com/workflow/1",
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
  "2": {
    id: "2",
    name: "Validation Contrat CDI",
    description: "Signature multi-étapes — Salarié → RH → DG",
    steps: ["RH", "Salarié", "Direction Générale"],
    currentStep: 2,
    status: "active",
    lastActivity: "Il y a 2h",
    deadline: "Dans 3j",
    escalade: false,
    referenceCode: "AKIENI-2026-CDI01",
    erpUrl: "https://erp.example.com/workflow/2",
    documents: [
      { id: "d1", name: "CDI_Jean_Marc_Boka.docx", type: "docx", atStep: 1, uploadedAt: "21 mai 2026" },
    ],
  },
  "3": {
    id: "3",
    name: "Revue Juridique — NDA",
    description: "Examen et approbation des accords de confidentialité",
    steps: ["Soumission", "Juriste", "Direction"],
    currentStep: 2,
    status: "active",
    lastActivity: "Il y a 4h",
    deadline: "Dans 5j",
    escalade: false,
    referenceCode: "AKIENI-2026-NDA01",
    erpUrl: "https://erp.example.com/workflow/3",
    documents: [
      { id: "d1", name: "NDA_Partenaire_X.pdf", type: "pdf", atStep: 1, uploadedAt: "21 mai 2026" },
      { id: "d2", name: "NDA_Partenaire_Y.pdf", type: "pdf", atStep: 1, uploadedAt: "21 mai 2026" },
      { id: "d3", name: "Accord_Confid_Z.pdf", type: "pdf", atStep: 2, uploadedAt: "20 mai 2026" },
    ],
  },
  "4": {
    id: "4",
    name: "Archivage Dossiers RH Q1",
    description: "Classement et archivage des dossiers employés du trimestre",
    steps: ["Collecte", "Vérification", "Archivage"],
    currentStep: 3,
    status: "completed",
    lastActivity: "Il y a 1j",
    deadline: "Terminé",
    escalade: false,
    referenceCode: "AKIENI-2026-RHA01",
    erpUrl: "https://erp.example.com/workflow/4",
    documents: [
      { id: "d1", name: "Dossier_RH_Janvier.pdf", type: "pdf", atStep: 2, uploadedAt: "15 mai 2026" },
      { id: "d2", name: "Dossier_RH_Fevrier.pdf", type: "pdf", atStep: 2, uploadedAt: "15 mai 2026" },
      { id: "d3", name: "Dossier_RH_Mars.pdf", type: "pdf", atStep: 2, uploadedAt: "15 mai 2026" },
      { id: "d4", name: "Recapitulatif_Q1.xlsx", type: "xlsx", atStep: 2, uploadedAt: "15 mai 2026" },
    ],
  },
}

const statusConfig = {
  active: { label: "En cours", icon: Clock, className: "bg-foreground text-background dark:bg-white dark:text-black" },
  completed: { label: "Terminé", icon: CheckCircle2, className: "bg-muted text-muted-foreground" },
  pending: { label: "En attente", icon: AlertCircle, className: "bg-amber-100/80 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
}

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id as string
  const workflow = workflowsData[workflowId]

  // Gestion des accordéons : Stocke l'index de l'étape actuellement ouverte (par défaut, l'étape active globale)
  const [openStep, setOpenStep] = useState<number | null>(workflow ? workflow.currentStep : null)

  if (!workflow) {
    return (
      <Shell>
        <Header />
        <main className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Workflow non trouvé</p>
            <Button size="sm" onClick={() => router.back()}>Retour</Button>
          </div>
        </main>
      </Shell>
    )
  }

  const config = statusConfig[workflow.status as keyof typeof statusConfig]
  const StatusIcon = config.icon
  const totalDocs = workflow.documents.length

  return (
    <Shell>
      <Header />
      <main className="p-6 space-y-6 bg-background">
        {/* Top Navigation & Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-5 border-border">
          <div className="flex items-start gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border shadow-xs flex-shrink-0 mt-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  {workflow.name}
                </h1>
                {workflow.escalade && (
                  <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {workflow.description}
              </p>
              {/* <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-md text-xs gap-1.5 border-border shadow-xs bg-background text-foreground hover:bg-muted"
                onClick={() => window.open(workflow.erpUrl || "https://workflow.management.example.com", "_blank")}
              >
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                Ouvrir dans ERP
              </Button> */}
            </div>
          </div>
          <Badge className={cn("gap-1 text-[11px] rounded-md px-2 py-0.5 font-medium shadow-none self-end sm:self-auto", config.className)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Info Blocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-medium text-muted-foreground mb-1">Documents Engagés</div>
            <div className="text-xl font-bold text-foreground">{totalDocs}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-medium text-muted-foreground mb-1">Échéance globale</div>
            <div className={cn("text-sm font-bold", workflow.escalade ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
              {workflow.deadline}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-medium text-muted-foreground mb-1">Dernière Synchronisation</div>
            <div className="text-sm font-bold text-foreground">{workflow.lastActivity}</div>
          </div>
        </div>

        {/* ─── BARRE DE RÉPARTITION CUMULÉE (STACKED BAR) ─── */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-foreground tracking-wide uppercase">Distribution analytique des documents</h2>
          
          {/* Composant Stacked Bar unifié */}
          <div className="w-full h-8 rounded-lg overflow-hidden flex bg-muted p-0.5 border border-border/50">
            {workflow.steps.map((step, stepIdx) => {
              const docsAtStep = workflow.documents.filter((d) => d.atStep === stepIdx).length
              const pct = totalDocs > 0 ? (docsAtStep / totalDocs) * 100 : 0

              if (docsAtStep === 0) return null

              return (
                <div
                  key={stepIdx}
                  style={{ width: `${pct}%` }}
                  className={cn(
                    "h-full transition-all first:rounded-l-md last:rounded-r-md flex items-center justify-center text-[11px] font-bold text-white shadow-inner relative group/segment",
                    stepColors[stepIdx % stepColors.length]
                  )}
                  title={`${step} : ${docsAtStep} document${docsAtStep > 1 ? 's' : ''}`}
                >
                  <span>{docsAtStep}</span>
                </div>
              )
            })}
          </div>

          {/* Légende détaillée sous la barre */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
            {workflow.steps.map((step, stepIdx) => {
              const count = workflow.documents.filter((d) => d.atStep === stepIdx).length
              const pct = totalDocs > 0 ? (count / totalDocs) * 100 : 0
              return (
                <div key={stepIdx} className="flex items-start gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0", stepColors[stepIdx % stepColors.length])} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{step}</p>
                    <p className="text-[11px] text-muted-foreground">{count} doc • {pct.toFixed(0)}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── FILES DOCUMENTAIRES SOUS FORME D'ACCORDÉONS ─── */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-foreground tracking-wide uppercase px-1">Détail des files d'attente GED</h2>
          
          {workflow.steps.map((step, stepIdx) => {
            const docsAtStep = workflow.documents.filter((d) => d.atStep === stepIdx)
            const isCurrentGlobalStep = stepIdx === workflow.currentStep
            const isOpen = openStep === stepIdx

            return (
              <div
                key={stepIdx}
                className={cn(
                  "bg-card border rounded-xl overflow-hidden shadow-xs transition-all border-border",
                  isCurrentGlobalStep && "border-l-4 border-l-amber-500 dark:border-l-amber-400"
                )}
              >
                {/* Entête Déclencheur de l'Accordéon */}
                <button
                  onClick={() => setOpenStep(isOpen ? null : stepIdx)}
                  className="w-full p-4 flex items-center justify-between gap-4 hover:bg-muted/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-white font-bold text-xs flex-shrink-0 shadow-xs",
                      stepColors[stepIdx % stepColors.length]
                    )}>
                      {stepIdx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-foreground">{step}</span>
                      {isCurrentGlobalStep && (
                        <span className="ml-2 text-[10px] font-semibold bg-amber-100/80 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/40 px-1.5 py-0.5 rounded-md">
                          Étape active principale
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="secondary" className="text-[11px] font-medium bg-muted text-muted-foreground shadow-none border px-1.5 py-0">
                      {docsAtStep.length} document{docsAtStep.length > 1 ? "s" : ""}
                    </Badge>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
                  </div>
                </button>

                {/* Corps de l'Accordéon (Contenu expansé) */}
                {isOpen && (
                  <div className="border-t border-border bg-muted/20 p-4 space-y-2 animate-in slide-in-from-top-1 duration-200">
                    {docsAtStep.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {docsAtStep.map((doc) => {
                          const FileIcon = fileIconMap[doc.type] || File

                          return (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/60 hover:border-border transition-all shadow-2xs text-xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted border border-border/50 flex-shrink-0">
                                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground truncate">
                                    {doc.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Importé le {doc.uploadedAt}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 rounded-md text-xs font-semibold text-foreground hover:bg-muted">
                                Ouvrir le chemin
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic p-2 text-center">
                        Aucun document en attente à cette étape du processus.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ─── CODE DE RÉFÉRENCE DU DOSSIER ERP ─── */}
        {workflow.referenceCode && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">Code de référence du dossier</p>
                <p className="text-lg font-mono font-bold text-foreground tracking-wide">{workflow.referenceCode}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-md text-xs gap-1.5 border-border shadow-xs bg-background text-foreground hover:bg-muted"
                onClick={() => window.open(workflow.erpUrl || "https://erp.example.com", "_blank")}
              >
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                Voir dans ERP
              </Button>
            </div>
          </div>
        )}
      </main>
    </Shell>
  )
}