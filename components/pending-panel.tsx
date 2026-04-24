import { Check, X, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const pendingDocs = [
  { name: "Facture SGBCI — Mars 2026", armoire: "Finance", attente: "2j", escalade: false },
  { name: "Avenant Contrat — A. Mbia", armoire: "RH", attente: "5j", escalade: true },
  { name: "Devis Travaux Bureau", armoire: "Logistique", attente: "1j", escalade: false },
]

export function PendingPanel() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">En attente de validation</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Documents en circuit d&apos;approbation</p>
        </div>
        <Link href="/workflows" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Voir tout
        </Link>
      </div>
      <div className="p-2 space-y-2">
        {pendingDocs.map((doc, i) => (
          <div key={i} className="rounded-xl bg-muted px-3 py-2.5 space-y-2">
            <div className="flex items-start gap-2">
              {doc.escalade
                ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                : <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{doc.armoire}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className={`text-[10px] ${doc.escalade ? "text-amber-500 font-medium" : "text-muted-foreground"}`}>
                    {doc.escalade ? `Escalade — ${doc.attente}` : `En attente ${doc.attente}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" className="h-6 text-[10px] px-2.5 flex-1 gap-1 rounded">
                <Check className="h-3 w-3" /> Approuver
              </Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2.5 flex-1 gap-1 rounded">
                <X className="h-3 w-3" /> Rejeter
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
