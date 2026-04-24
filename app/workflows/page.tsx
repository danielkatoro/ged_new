import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { GitBranch, Plus, CheckCircle2, Clock, AlertCircle, ArrowRight, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const workflows = [
  {
    name: "Approbation Factures Fournisseurs",
    description: "Validation des factures avant paiement — Finance",
    steps: ["Soumission", "Verificateur", "Directeur Finance", "Paiement"],
    currentStep: 1,
    status: "pending",
    documents: 7,
    lastActivity: "Il y a 30min",
    nextActor: "M. Diallo — Directeur Finance",
    deadline: "Dans 48h",
    escalade: true,
  },
  {
    name: "Validation Contrat CDI",
    description: "Signature multi-etapes — Salarie → RH → DG",
    steps: ["RH", "Salarie", "Direction Generale"],
    currentStep: 2,
    status: "active",
    documents: 1,
    lastActivity: "Il y a 2h",
    nextActor: "J. Boka — Salarie",
    deadline: "Dans 3j",
    escalade: false,
  },
  {
    name: "Revue Juridique — NDA",
    description: "Examen et approbation des accords de confidentialite",
    steps: ["Soumission", "Juriste", "Direction"],
    currentStep: 2,
    status: "active",
    documents: 3,
    lastActivity: "Il y a 4h",
    nextActor: "L. Kama — Juriste Senior",
    deadline: "Dans 5j",
    escalade: false,
  },
  {
    name: "Archivage Dossiers RH Q1",
    description: "Classement et archivage des dossiers employes du trimestre",
    steps: ["Collecte", "Verification", "Archivage"],
    currentStep: 3,
    status: "completed",
    documents: 34,
    lastActivity: "Il y a 1j",
    nextActor: "—",
    deadline: "Termine",
    escalade: false,
  },
]

const statusConfig = {
  active: { label: "En cours", icon: Clock, className: "bg-foreground text-background" },
  completed: { label: "Termine", icon: CheckCircle2, className: "bg-muted text-muted-foreground" },
  pending: { label: "En attente", icon: AlertCircle, className: "bg-amber-100 text-amber-700" },
}

export default function WorkflowsPage() {
  return (
    <Shell>
      <Header />
      <main className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">4 workflows actifs ou recents</p>
          <Button size="sm" className="h-8 gap-1.5 text-xs rounded">
            <Plus className="h-3.5 w-3.5" />
            Nouveau workflow
          </Button>
        </div>

        <div className="space-y-3">
          {workflows.map((wf, i) => {
            const config = statusConfig[wf.status as keyof typeof statusConfig]
            const StatusIcon = config.icon
            return (
              <div
                key={i}
                className="group rounded border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted group-hover:bg-foreground group-hover:text-background transition-colors flex-shrink-0">
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{wf.name}</h3>
                        {wf.escalade && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{wf.description}</p>
                    </div>
                  </div>
                  <Badge className={cn("gap-1 text-xs flex-shrink-0", config.className)}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>

                {/* Steps progress */}
                <div className="flex items-center gap-1 mb-4">
                  {wf.steps.map((step, s) => (
                    <div key={s} className="flex items-center flex-1 min-w-0">
                      <div className={cn(
                        "flex-1 h-1.5 rounded-full transition-colors",
                        s < wf.currentStep ? "bg-foreground" : "bg-muted"
                      )} />
                      {s < wf.steps.length - 1 && <div className="w-1.5" />}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mb-4">
                  {wf.steps.map((step, s) => (
                    <span key={s} className={cn(
                      "text-[10px] flex-1 text-center truncate",
                      s < wf.currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {step}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {wf.nextActor}
                    </div>
                    <span className={cn("text-xs", wf.escalade ? "text-amber-500 font-medium" : "text-muted-foreground")}>
                      {wf.deadline}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{wf.documents} doc{wf.documents > 1 ? "s" : ""}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </Shell>
  )
}
