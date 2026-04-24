import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { Tag, Plus, FileText, Edit, Trash2, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const types = [
  { name: "Facture", description: "Factures clients et fournisseurs — OCR: montant, date, fournisseur, IBAN", count: 843, fields: 6, hasWorkflow: true, hasOcr: true },
  { name: "Contrat", description: "Contrats commerciaux et de prestation — circuit signature multi-etapes", count: 247, fields: 8, hasWorkflow: true, hasOcr: true },
  { name: "Bon de commande", description: "Commandes fournisseurs et materiels internes", count: 351, fields: 6, hasWorkflow: true, hasOcr: false },
  { name: "Rapport", description: "Rapports d'activite, audits et analyses", count: 184, fields: 5, hasWorkflow: false, hasOcr: false },
  { name: "Note de service", description: "Communications internes officielles", count: 432, fields: 4, hasWorkflow: false, hasOcr: false },
  { name: "Fiche de poste", description: "Descriptions de postes et profils RH — lien au dossier salarie", count: 291, fields: 9, hasWorkflow: false, hasOcr: true },
  { name: "Accord / NDA", description: "NDA, partenariats et conventions de confidentialite", count: 112, fields: 7, hasWorkflow: true, hasOcr: false },
  { name: "Procedure", description: "Guides et procedures operationnelles standardises", count: 143, fields: 5, hasWorkflow: false, hasOcr: false },
]

export default function TypesDocsPage() {
  return (
    <Shell>
      <Header />
      <main className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{types.length} types de documents configures — schemas de metadonnees personnalises</p>
          <Button size="sm" className="h-8 gap-1.5 text-xs rounded-lg">
            <Plus className="h-3.5 w-3.5" />
            Nouveau type
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {types.map((type, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-colors flex-shrink-0">
                  <Tag className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{type.name}</p>
                    {type.hasOcr && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">OCR</span>
                    )}
                    {type.hasWorkflow && (
                      <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                        <GitBranch className="h-2.5 w-2.5" /> Workflow
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{type.description}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs font-medium text-foreground">{type.count.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">documents</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {type.fields} champs
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Shell>
  )
}
