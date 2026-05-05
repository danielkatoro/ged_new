import { Eye, Download, MoreHorizontal, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const documents = [
  { id: "DOC-2841", name: "Facture TOTAL Energie — Avr. 2026", armoire: "Finance", type: "Facture", date: "23 Avr 2026", status: "Approuve", source: "email" },
  { id: "DOC-2840", name: "Contrat CDI — Jean-Marc Boka", armoire: "RH", type: "Contrat", date: "22 Avr 2026", status: "En validation", source: "upload" },
  { id: "DOC-2839", name: "Rapport Audit Q1 2026", armoire: "Juridique", type: "Rapport", date: "20 Avr 2026", status: "En attente", source: "upload" },
  { id: "DOC-2838", name: "Bon de commande #7821", armoire: "Finance", type: "Commande", date: "18 Avr 2026", status: "Approuve", source: "email" },
  { id: "DOC-2837", name: "Procedure Securite Incendie", armoire: "General", type: "Procedure", date: "15 Avr 2026", status: "Rejete", source: "upload" },
]

const statusStyles: Record<string, string> = {
  "Approuve": "bg-foreground text-background",
  "En validation": "bg-amber-100 text-amber-700 border-amber-200",
  "En attente": "bg-muted text-muted-foreground",
  "Rejete": "bg-red-50 text-red-600 border-red-100",
}

export function DocumentsTable() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Documents recents</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Derniers documents integres dans la GED</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-foreground">
          Voir tout →
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Document</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 hidden md:table-cell">Direction</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 hidden lg:table-cell">Date</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground text-xs truncate max-w-[220px]">{doc.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{doc.id}</span>
                      {doc.source === "email" && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground border border-border rounded px-1 leading-4">
                          <Mail className="h-2.5 w-2.5" /> email
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 hidden md:table-cell">
                  <Badge variant="outline" className="text-[10px] font-normal">{doc.armoire}</Badge>
                </td>
                <td className="px-3 py-3.5 hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">{doc.date}</span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${statusStyles[doc.status]}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem>Envoyer en validation</DropdownMenuItem>
                        <DropdownMenuItem>Voir l&apos;historique</DropdownMenuItem>
                        <DropdownMenuItem>Telecharger</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
